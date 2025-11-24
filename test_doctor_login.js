const db = require('./backend/config/database');

const testDoctorLogin = async () => {
  try {
    console.log('Menguji login dokter...');

    // Ambil beberapa dokter dari tabel users
    const doctors = await db.query('SELECT id, username, nama, role FROM users WHERE role = $1 LIMIT 5', ['dokter']);
    
    if (doctors.rows.length > 0) {
      console.log('Berikut adalah username dokter yang bisa digunakan untuk login:');
      doctors.rows.forEach(doctor => {
        console.log(`- ID: ${doctor.id}, Username: ${doctor.username}, Nama: ${doctor.nama}`);
      });
      console.log('\nGunakan password "default123" untuk login.');
    } else {
      console.log('Tidak ada dokter ditemukan di tabel users');
    }
  } catch (error) {
    console.error('Gagal menguji login dokter:', error.message);
  } finally {
    process.exit(0);
  }
};

testDoctorLogin();