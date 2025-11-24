const bcrypt = require('bcryptjs');
const db = require('./backend/config/database');

// Fungsi untuk menyinkronkan dokter ke tabel users
const syncDoctorsToUsers = async () => {
  try {
    console.log('Memulai sinkronisasi dokter ke tabel users...');

    // Ambil semua dokter dari tabel dokter
    const doctors = await db.query('SELECT * FROM dokter');
    
    if (doctors.rows.length === 0) {
      console.log('Tidak ada data dokter ditemukan di tabel dokter.');
      return;
    }

    // Ambil semua data dari tabel users untuk memastikan tidak ada duplikasi
    for (const doctor of doctors.rows) {
      // Buat username berdasarkan nama dokter (hapus spasi dan jadikan lowercase)
      const username = doctor.nama.toLowerCase().replace(/\s+/g, '');
      
      // Hash password default
      const password = 'default123'; // Password default untuk semua dokter
      const passwordHash = await bcrypt.hash(password, 10);

      // Cek apakah dokter sudah ada di tabel users
      const existingUser = await db.query(
        'SELECT id FROM users WHERE nama = $1 LIMIT 1', 
        [doctor.nama]
      );

      if (existingUser.rows.length === 0) {
        // Jika belum ada, tambahkan ke tabel users
        await db.query(`
          INSERT INTO users (username, password_hash, role, nama, spesialis, nomor_telepon)
          VALUES ($1, $2, 'dokter', $3, $4, $5)
        `, [username, passwordHash, doctor.nama, doctor.spesialis, doctor.nomor_telepon]);
        
        console.log(`Dokter ${doctor.nama} telah ditambahkan ke tabel users.`);
      } else {
        console.log(`Dokter ${doctor.nama} sudah ada di tabel users.`);
      }
    }

    console.log('Sinkronisasi dokter ke tabel users selesai.');
  } catch (error) {
    console.error('Terjadi kesalahan saat sinkronisasi dokter ke tabel users:', error.message);
  } finally {
    process.exit(0);
  }
};

syncDoctorsToUsers();