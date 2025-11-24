const db = require('./backend/config/database');

const checkMedications = async () => {
  try {
    console.log('Memeriksa data obat di database...');

    const result = await db.query('SELECT * FROM obat ORDER BY nama_obat');
    
    console.log(`Ditemukan ${result.rows.length} obat dalam database:`);
    
    if (result.rows.length > 0) {
      result.rows.forEach((obat, index) => {
        console.log(`${index + 1}. ID: ${obat.id}, Nama: ${obat.nama_obat}, Stok: ${obat.stok}, Harga: ${obat.harga}`);
      });
    } else {
      console.log('Tidak ada data obat ditemukan di database.');
      console.log('Kemungkinan besar, Anda perlu menambahkan data obat ke tabel obat.');
    }
  } catch (error) {
    console.error('Gagal memeriksa data obat:', error.message);
  } finally {
    process.exit(0);
  }
};

checkMedications();