// test-connection.js - Untuk menguji koneksi database
const db = require('./config/database');

const testConnection = async () => {
  try {
    console.log('Menghubungkan ke database...');
    const result = await db.query('SELECT NOW()');
    console.log('Berhasil terhubung ke database PostgreSQL');
    console.log('Waktu server database:', result.rows[0].now);

    // Menguji apakah tabel pasien ada
    const tableResult = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'pasien'
    `);

    if (tableResult.rows.length > 0) {
      console.log('Tabel pasien ditemukan');

      // Menguji apakah ada data di tabel pasien
      const dataResult = await db.query('SELECT COUNT(*) FROM pasien');
      console.log(`Jumlah data pasien: ${dataResult.rows[0].count}`);
    } else {
      console.log('Tabel pasien tidak ditemukan. Anda perlu menjalankan seeding terlebih dahulu.');
    }

  } catch (err) {
    console.error('Kesalahan saat menguji koneksi database:', err.message);
  } finally {
    process.exit(0);
  }
};

testConnection();