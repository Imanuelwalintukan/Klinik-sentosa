// seeding.js - Untuk mengisi data awal ke database
const db = require('./config/database');

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

    console.log('Tabel-tabel berhasil dibuat');
  } catch (err) {
    console.error('Kesalahan saat membuat tabel:', err.stack);
  }
};

// Fungsi untuk menambahkan data awal
const seedData = async () => {
  try {
    // Menambahkan data pasien awal jika belum ada
    const pasienCount = await db.query('SELECT COUNT(*) FROM pasien');
    if (parseInt(pasienCount.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO pasien (nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon) VALUES
        ('Budi Santoso', '1990-05-15', 'Laki-laki', 'Jl. Merdeka No. 123', '081234567890'),
        ('Siti Nurhaliza', '1985-11-22', 'Perempuan', 'Jl. Sudirman No. 45', '081345678901'),
        ('Ahmad Fauzi', '1978-03-08', 'Laki-laki', 'Jl. Gatot Subroto No. 67', '081456789012');
      `);
      console.log('Data pasien awal berhasil ditambahkan');
    } else {
      console.log('Data pasien sudah ada, melewati seeding pasien');
    }

    // Menambahkan data dokter awal jika belum ada
    const dokterCount = await db.query('SELECT COUNT(*) FROM dokter');
    if (parseInt(dokterCount.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO dokter (nama, spesialis, nomor_telepon, alamat) VALUES
        ('Dr. Andi Pratama', 'Penyakit Dalam', '081511112222', 'Jl. Kesehatan No. 10'),
        ('Dr. Sari Lestari', 'Anak', '081622223333', 'Jl. Kesehatan No. 12'),
        ('Dr. Hadi Wijaya', 'Bedah', '081733334444', 'Jl. Kesehatan No. 14');
      `);
      console.log('Data dokter awal berhasil ditambahkan');
    } else {
      console.log('Data dokter sudah ada, melewati seeding dokter');
    }

    // Menambahkan data obat awal jika belum ada
    const obatCount = await db.query('SELECT COUNT(*) FROM obat');
    if (parseInt(obatCount.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO obat (nama_obat, deskripsi, stok, harga) VALUES
        ('Paracetamol', 'Obat penurun panas dan pereda nyeri', 100, 5000.00),
        ('Amoxicillin', 'Antibiotik untuk infeksi bakteri', 50, 8000.00),
        ('Ibuprofen', 'Obat antiinflamasi', 75, 6000.00);
      `);
      console.log('Data obat awal berhasil ditambahkan');
    } else {
      console.log('Data obat sudah ada, melewati seeding obat');
    }

  } catch (err) {
    console.error('Kesalahan saat seeding data:', err.stack);
  }
};

// Fungsi utama
const runSeeding = async () => {
  try {
    console.log('Memulai seeding database...');
    await createTables();
    await seedData();
    console.log('Proses seeding selesai');
  } catch (err) {
    console.error('Kesalahan saat menjalankan seeding:', err.stack);
  } finally {
    // Tutup koneksi database setelah selesai
    process.exit(0);
  }
};

// Jalankan seeding
runSeeding();