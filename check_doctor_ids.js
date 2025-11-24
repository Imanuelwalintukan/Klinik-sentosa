const db = require('./backend/config/database');

const checkDoctorIds = async () => {
  try {
    console.log('Memeriksa ID dokter di tabel dokter dan users...');

    // Ambil semua dokter dari tabel dokter
    const doctors = await db.query('SELECT id, nama FROM dokter ORDER BY id');
    console.log('Data di tabel dokter:');
    doctors.rows.forEach(doc => {
      console.log(`ID: ${doc.id}, Nama: ${doc.nama}`);
    });

    // Ambil semua dokter dari tabel users
    const users = await db.query('SELECT id, nama FROM users WHERE role = $1 ORDER BY id', ['dokter']);
    console.log('\nData dokter di tabel users:');
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}, Nama: ${user.nama}`);
    });

    console.log('\nJika login sebagai dokter, ID dari tabel users yang digunakan, bukan tabel dokter.');
    console.log('Tapi ExaminationForm.jsx mencari dokter di tabel dokter berdasarkan ID dari tabel users.');
    console.log('Inilah yang menyebabkan error.');
  } catch (error) {
    console.error('Gagal memeriksa ID dokter:', error.message);
  } finally {
    process.exit(0);
  }
};

checkDoctorIds();