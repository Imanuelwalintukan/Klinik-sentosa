// Script untuk seeding data perawat awal
const db = require('./backend/config/database');

const seedNurses = async () => {
  try {
    console.log('Menambahkan data perawat awal...');

    // Hapus data perawat lama jika ada
    await db.query('DELETE FROM perawat');

    // Tambahkan data perawat
    const nurses = [
      ['Siti Aminah', '081234567891', 'Jl. Kesehatan No. 1'],
      ['Dian Kartika', '081234567892', 'Jl. Kesehatan No. 2'],
      ['Rina Wahyuni', '081234567893', 'Jl. Kesehatan No. 3'],
      ['Maya Putri', '081234567894', 'Jl. Kesehatan No. 4'],
      ['Linda Sari', '081234567895', 'Jl. Kesehatan No. 5']
    ];

    for (const [nama, nomor_telepon, alamat] of nurses) {
      await db.query(
        'INSERT INTO perawat (nama, nomor_telepon, alamat) VALUES ($1, $2, $3)',
        [nama, nomor_telepon, alamat]
      );
    }

    console.log('Data perawat berhasil ditambahkan');
  } catch (error) {
    console.error('Gagal menambahkan data perawat:', error.message);
  } finally {
    process.exit(0);
  }
};

seedNurses();