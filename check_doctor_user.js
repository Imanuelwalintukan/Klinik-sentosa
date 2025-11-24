const bcrypt = require('bcryptjs');
const db = require('./backend/config/database');

const checkDoctorUser = async () => {
  try {
    console.log('Memeriksa data akun dokter di tabel users...');

    // Ambil semua dokter user
    const result = await db.query('SELECT id, username, nama, role FROM users WHERE role = $1', ['dokter']);
    
    if (result.rows.length > 0) {
      console.log('Dokter users ditemukan:');
      result.rows.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Nama: ${user.nama}, Role: ${user.role}`);
      });
    } else {
      console.log('Tidak ditemukan pengguna dengan role dokter');
    }
  } catch (error) {
    console.error('Gagal memeriksa dokter user:', error.message);
  } finally {
    process.exit(0);
  }
};

checkDoctorUser();