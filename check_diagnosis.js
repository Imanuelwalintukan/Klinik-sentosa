const db = require('./backend/config/database');

const checkDiagnosisTable = async () => {
  try {
    console.log('Memeriksa tabel diagnosa_spesialis...');

    const result = await db.query('SELECT COUNT(*) as count FROM diagnosa_spesialis');
    
    console.log(`Jumlah data di tabel diagnosa_spesialis: ${result.rows[0].count}`);
    
    if (result.rows[0].count > 0) {
      console.log('Tabel diagnosa_spesialis sudah berisi data.');
    } else {
      console.log('Tabel diagnosa_spesialis kosong. Mungkin perlu menjalankan seeding diagnosis.');
    }
  } catch (error) {
    console.error('Gagal memeriksa tabel diagnosa_spesialis:', error.message);
  } finally {
    process.exit(0);
  }
};

checkDiagnosisTable();