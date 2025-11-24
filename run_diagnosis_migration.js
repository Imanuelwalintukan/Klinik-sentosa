const db = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

const runDiagnosisMigration = async () => {
  try {
    console.log('Menjalankan migrasi tabel diagnosis...');

    // Baca file SQL untuk tabel diagnosis
    const sqlFilePath = path.join(__dirname, 'database', 'migrations', 'add_diagnosis_tables.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

    await db.query(sqlQuery);

    console.log('Migrasi tabel diagnosis berhasil dijalankan');
    console.log('Tabel diagnosa_spesialis dan diagnosa_dokter telah dibuat');
  } catch (error) {
    console.error('Gagal menjalankan migrasi diagnosis:', error.message);
  } finally {
    process.exit(0);
  }
};

runDiagnosisMigration();