const db = require('./backend/config/database');

const checkDiagnosisEndpoint = async () => {
  try {
    console.log('Mengecek endpoint diagnosis...');

    // Cek apakah tabel diagnosa_spesialis berisi data yang sesuai untuk diagnosa umum
    const result = await db.query(`
      SELECT * FROM diagnosa_spesialis 
      WHERE spesialisasi_berlaku = 'Umum' OR spesialisasi_berlaku = 'umum'
      ORDER BY nama_diagnosa
      LIMIT 5
    `);
    
    if (result.rows.length > 0) {
      console.log('Data diagnosa umum ditemukan:');
      result.rows.forEach(diag => {
        console.log(`- ${diag.kode_diagnosa}: ${diag.nama_diagnosa}`);
      });
    } else {
      console.log('Tidak ada data diagnosa dengan spesialisasi_berlaku = "Umum" atau "umum"');
      
      // Cek semua data diagnosa
      const allDiagnoses = await db.query('SELECT DISTINCT spesialisasi_berlaku FROM diagnosa_spesialis');
      console.log('Spesialisasi_berlaku yang tersedia:');
      allDiagnoses.rows.forEach(row => {
        console.log(`- ${row.spesialisasi_berlaku}`);
      });
    }
  } catch (error) {
    console.error('Gagal mengecek endpoint diagnosis:', error.message);
  } finally {
    process.exit(0);
  }
};

checkDiagnosisEndpoint();