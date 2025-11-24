const db = require('./backend/config/database');

const checkUsers = async () => {
  try {
    console.log('Memeriksa data pengguna di tabel users...');

    const result = await db.query('SELECT id, username, nama, role FROM users WHERE role = $1', ['dokter']);
    
    if (result.rows.length > 0) {
      console.log('Data dokter di tabel users:');
      result.rows.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Nama: ${user.nama}, Role: ${user.role}`);
      });
    } else {
      console.log('Tidak ada dokter ditemukan di tabel users');
    }
  } catch (error) {
    console.error('Gagal memeriksa data pengguna:', error.message);
  } finally {
    process.exit(0);
  }
};

checkUsers();