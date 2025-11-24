// Skrip untuk menguji endpoint diagnosis secara langsung
const db = require('./backend/config/database');

const testDiagnosisEndpoint = async () => {
  try {
    console.log('Menguji endpoint diagnosis tanpa otentikasi...');

    // Kita akan menguji query yang persis sama seperti yang digunakan oleh getGeneralDiagnoses
    const result = await db.query(
      'SELECT * FROM diagnosa_spesialis WHERE spesialisasi_berlaku = \'Umum\' OR spesialisasi_berlaku = \'umum\' ORDER BY nama_diagnosa'
    );
    
    console.log('Query berhasil dijalankan');
    console.log(`Ditemukan ${result.rows.length} diagnosa umum`);
    
    if (result.rows.length > 0) {
      console.log('Contoh data diagnosa:');
      result.rows.slice(0, 3).forEach(diag => {
        console.log(`- ${diag.kode_diagnosa}: ${diag.nama_diagnosa} (${diag.spesialisasi_berlaku})`);
      });
    }
  } catch (error) {
    console.error('Gagal menguji endpoint diagnosis:', error.message);
    console.error('Detail error:', error);
  } finally {
    process.exit(0);
  }
};

testDiagnosisEndpoint();