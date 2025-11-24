// seeding.js - Untuk mengisi data awal ke database
const db = require('./config/database');
const bcrypt = require('bcryptjs');

// Fungsi untuk membuat tabel-tabel
const createTables = async () => {
  try {
    // Membuat tabel pasien
    await db.query(`
      CREATE TABLE IF NOT EXISTS pasien (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        tanggal_lahir DATE,
        jenis_kelamin VARCHAR(10),
        alamat TEXT,
        nomor_telepon VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Membuat tabel dokter
    await db.query(`
      CREATE TABLE IF NOT EXISTS dokter (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        spesialis VARCHAR(100),
        nomor_telepon VARCHAR(15),
        alamat TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Membuat tabel pemeriksaan
    await db.query(`
      CREATE TABLE IF NOT EXISTS pemeriksaan (
        id SERIAL PRIMARY KEY,
        id_pasien INTEGER REFERENCES pasien(id),
        id_dokter INTEGER REFERENCES dokter(id),
        tanggal_pemeriksaan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        keluhan TEXT,
        diagnosa TEXT,
        rekomendasi_pengobatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tambahkan kolom status_resep ke tabel pemeriksaan jika belum ada
    try {
      await db.query(`
        ALTER TABLE pemeriksaan ADD COLUMN status_resep VARCHAR(20) DEFAULT 'Menunggu';
      `);
      console.log('Kolom status_resep berhasil ditambahkan ke tabel pemeriksaan.');
    } catch (e) {
      if (e.code === '42701') { // Kolom sudah ada
        // Abaikan error, ini diharapkan jika seeder dijalankan lebih dari sekali
      } else {
        throw e;
      }
    }

    // Membuat tabel obat
    await db.query(`
      CREATE TABLE IF NOT EXISTS obat (
        id SERIAL PRIMARY KEY,
        nama_obat VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        stok INTEGER DEFAULT 0,
        harga DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Membuat tabel resep
    await db.query(`
      CREATE TABLE IF NOT EXISTS resep (
        id SERIAL PRIMARY KEY,
        id_pemeriksaan INTEGER REFERENCES pemeriksaan(id),
        id_obat INTEGER REFERENCES obat(id),
        jumlah INTEGER,
        aturan_pakai TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Membuat tabel users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        nama VARCHAR(100) NOT NULL,
        spesialis VARCHAR(100),
        nomor_telepon VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Membuat tabel untuk menyimpan daftar diagnosa berdasarkan spesialisasi dokter
    await db.query(`
      CREATE TABLE IF NOT EXISTS diagnosa_spesialis (
        id SERIAL PRIMARY KEY,
        kode_diagnosa VARCHAR(20) UNIQUE NOT NULL,
        nama_diagnosa VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        spesialisasi_berlaku VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabel untuk mencatat diagnosa yang sering digunakan oleh dokter tertentu
    await db.query(`
      CREATE TABLE IF NOT EXISTS diagnosa_dokter (
        id SERIAL PRIMARY KEY,
        id_dokter INTEGER REFERENCES dokter(id) ON DELETE CASCADE,
        kode_diagnosa VARCHAR(20) REFERENCES diagnosa_spesialis(kode_diagnosa),
        nama_diagnosa VARCHAR(255) NOT NULL,
        digunakan_sebanyak INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabel-tabel berhasil dibuat');
  } catch (err) {
    console.error('Kesalahan saat membuat tabel:', err.stack);
  }
};

// Fungsi untuk menambahkan data pengguna awal
const seedUsers = async () => {
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin', nama: 'Administrator' },
    { username: 'dokter', password: 'dokter123', role: 'dokter', nama: 'Dr. Andi', spesialis: 'Penyakit Dalam' },
    { username: 'apoteker', password: 'apoteker123', role: 'apoteker', nama: 'Susi Apoteker' },
    { username: 'perawat', password: 'perawat123', role: 'perawat', nama: 'Siti Perawat' }
  ];

  try {
    console.log('Memulai seeding data pengguna...');
    for (const user of users) {
      // Cek jika username sudah ada
      const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [user.username]);
      
      if (existingUser.rows.length === 0) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(user.password, salt);
        
        // Insert user baru
        await db.query(
          'INSERT INTO users (username, password_hash, role, nama, spesialis) VALUES ($1, $2, $3, $4, $5)',
          [user.username, password_hash, user.role, user.nama, user.spesialis || null]
        );
        console.log(`User '${user.username}' berhasil ditambahkan.`);
      } else {
        console.log(`User '${user.username}' sudah ada, melewati.`);
      }
    }
    console.log('Seeding data pengguna selesai.');
  } catch (err) {
    console.error('Kesalahan saat seeding data pengguna:', err.stack);
  }
};

// Fungsi untuk menambahkan data diagnosa awal
const seedDiagnoses = async () => {
  try {
    console.log('Memulai seeding data diagnosa...');

    // Periksa apakah tabel diagnosa_spesialis sudah memiliki data
    const countResult = await db.query('SELECT COUNT(*) FROM diagnosa_spesialis');
    const rowCount = parseInt(countResult.rows[0].count);

    if (rowCount === 0) {
      // Insert data diagnosa awal berdasarkan spesialisasi
      const insertQuery = `
        INSERT INTO diagnosa_spesialis (kode_diagnosa, nama_diagnosa, deskripsi, spesialisasi_berlaku) VALUES
          -- Diagnosa umum yang bisa digunakan semua dokter
          ('Z00.0', 'Pemeriksaan Kesehatan Rutin', 'Pemeriksaan kesehatan menyeluruh untuk tujuan pencegahan', 'Umum'),
          ('R51', 'Sakit Kepala', 'Gangguan neurologis umum yang sering dialami pasien', 'Umum'),
          ('R10.13', 'Nyeri Perut', 'Ketidaknyamanan di area perut', 'Umum'),
          ('R05', 'Batuk', 'Refleks perlindungan saluran napas', 'Umum'),
          ('R06.02', 'Sesak Napas', 'Gangguan pernapasan', 'Umum'),
          ('R50.9', 'Demam', 'Meningkatnya suhu tubuh', 'Umum'),

          -- Diagnosa untuk Spesialis Penyakit Dalam
          ('I10', 'Hipertensi Esensial', 'Tekanan darah tinggi tanpa penyebab sekunder', 'Penyakit Dalam'),
          ('E11.9', 'Diabetes Mellitus Tipe 2 Tanpa Komplikasi', 'Penyakit metabolik dengan kadar glukosa tinggi', 'Penyakit Dalam'),
          ('K29.7', 'Gastritis', 'Peradangan lambung', 'Penyakit Dalam'),
          ('J44.1', 'Penyakit Paru Obstruktif Kronik (PPOK)', 'Gangguan paru progresif', 'Penyakit Dalam'),
          ('E78.0', 'Hiperkolesterolemia', 'Kadar kolesterol tinggi', 'Penyakit Dalam'),

          -- Diagnosa untuk Spesialis Anak
          ('J06.9', 'Infeksi Saluran Pernapasan Atas', 'Infeksi virus umum pada anak', 'Anak'),
          ('A00.9', 'Diare', 'Gangguan pencernaan umum pada anak', 'Anak'),
          ('J02.9', 'Faringitis', 'Radang tenggorokan', 'Anak'),
          ('A56.8', 'ISK (Infeksi Saluran Kemih)', 'Infeksi bakteri pada sistem kemih anak', 'Anak'),
          ('R61', 'Hiperhidrosis', 'Pengeluaran keringat berlebih', 'Anak'),

          -- Diagnosa untuk Spesialis Gigi
          ('K02.9', 'Karies Gigi', 'Kerusakan enamel gigi', 'Gigi'),
          ('K04.9', 'Pulpitis', 'Peradangan jaringan pulpa gigi', 'Gigi'),
          ('K05.9', 'Gingivitis', 'Peradangan gusi', 'Gigi'),
          ('K08.3', 'Gigi Impaksi', 'Gigi yang tidak tumbuh normal', 'Gigi'),
          ('K14.1', 'Stomatitis', 'Radang pada mulut', 'Gigi'),

          -- Diagnosa untuk Spesialis Bedah
          ('M54.5', 'Nyeri Punggung Bawah', 'Kondisi umum yang memerlukan penanganan bedah', 'Bedah'),
          ('K35.8', 'Apendisitis Akut', 'Peradangan usus buntu', 'Bedah'),
          ('J35.1', 'Ambeien', 'Pembengkakan vena anorektal', 'Bedah'),
          ('E16.2', 'Hernia Inguinalis', 'Penonjolan jaringan melalui dinding abdomen', 'Bedah'),
          ('L02.9', 'Abses Kulit', 'Kumpulan nanah dalam jaringan', 'Bedah'),

          -- Diagnosa untuk Spesialis THT
          ('J03.9', 'Tonsillitis Akut', 'Peradangan tonsil', 'THT'),
          ('H66.9', 'Otitis Media', 'Peradangan telinga tengah', 'THT'),
          ('J32.9', 'Rinitis Alergi', 'Alergi terhadap alergen di hidung', 'THT'),
          ('J39.0', 'Laringitis', 'Peradangan laring', 'THT'),
          ('J34.8', 'Deviasi Septum', 'Gangguan pada dinding hidung', 'THT'),

          -- Diagnosa untuk Spesialis Mata
          ('H52.0', 'Miopi', 'Gangguan refraksi penglihatan', 'Mata'),
          ('H26.9', 'Katarak', 'Pengabutan lensa mata', 'Mata'),
          ('H40.9', 'Glaukoma', 'Kenaikan tekanan bola mata', 'Mata'),
          ('H02.1', 'Ptosis', 'Kelopak mata turun', 'Mata'),
          ('H10.9', 'Konjungtivitis', 'Peradangan konjungtiva', 'Mata'),

          -- Diagnosa untuk Spesialis Kandungan
          ('O24.9', 'Diabetes Gestasional', 'Diabetes selama kehamilan', 'Kandungan'),
          ('O80', 'Persalinan Normal', 'Persalinan pervaginam spontan', 'Kandungan'),
          ('O22.9', 'Varises pada Kehamilan', 'Pelebaran vena selama hamil', 'Kandungan'),
          ('O70.9', 'Robekan Perineal', 'Robekan saat melahirkan', 'Kandungan'),
          ('O10.9', 'Hipertensi Kronik dalam Kehamilan', 'Tekanan darah tinggi saat hamil', 'Kandungan'),

          -- Diagnosa untuk Spesialis Saraf
          ('G47.0', 'Insomnia', 'Gangguan tidur', 'Saraf'),
          ('G47.3', 'Sleep Apnea', 'Gangguan pernapasan saat tidur', 'Saraf'),
          ('G20', 'Parkinson', 'Gangguan sistem saraf', 'Saraf'),
          ('G47.1', 'Narkolepsi', 'Gangguan tidur berlebih', 'Saraf'),
          ('G54.0', 'Neuralgia', 'Nyeri saraf', 'Saraf'),

          -- Diagnosa untuk Spesialis Kulit
          ('L29.0', 'Dermatitis Alergi', 'Peradangan kulit karena alergi', 'Kulit'),
          ('L03.9', 'Selulitis', 'Infeksi jaringan kulit dalam', 'Kulit'),
          ('L50.9', 'Urtikaria', 'Biduran atau gatal-gatal', 'Kulit'),
          ('L84', 'Kutil', 'Lesi pada kulit karena virus HPV', 'Kulit'),
          ('L20.9', 'Eksim', 'Peradangan kulit kronis', 'Kulit'),

          -- Diagnosa untuk Spesialis Jantung
          ('I25.1', 'Penyakit Jantung Koroner', 'Penyempitan arteri koroner', 'Jantung'),
          ('I11.0', 'Penyakit Jantung Hipertensi', 'Kerusakan jantung karena hipertensi', 'Jantung'),
          ('I48.9', 'Fibrilasi Atrium', 'Gangguan irama jantung', 'Jantung'),
          ('I20.9', 'Angina Pektoris', 'Nyeri dada karena jantung', 'Jantung'),
          ('I50.9', 'Gagal Jantung', 'Kemampuan jantung memompa darah menurun', 'Jantung');
      `;

      await db.query(insertQuery);
      console.log('Data diagnosa berhasil ditambahkan.');
    } else {
      console.log('Data diagnosa sudah ada, melewati seeding.');
    }
  } catch (err) {
    console.error('Kesalahan saat seeding data diagnosa:', err.stack);
  }
};

// Fungsi utama
const runSeeding = async () => {
  try {
    console.log('Memulai seeding database...');
    await createTables();
    await seedUsers();
    await seedDiagnoses();
    console.log('Proses seeding selesai');
  } catch (err) {
    console.error('Kesalahan saat menjalankan seeding:', err.stack);
  } finally {
    // Tutup koneksi database setelah selesai
    db.pool.end();
    process.exit(0);
  }
};

// Jalankan seeding
runSeeding();