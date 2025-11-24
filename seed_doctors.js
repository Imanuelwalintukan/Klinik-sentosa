// Skrip migrasi untuk menambahkan dokter-dokter dengan berbagai spesialisasi
const db = require('./backend/config/database');

const seedSpecialistDoctors = async () => {
  try {
    console.log('Menambahkan dokter-dokter dengan berbagai spesialisasi...');

    // Hapus data dalam urutan yang benar karena constraint
    await db.query('DELETE FROM resep');
    await db.query('DELETE FROM pemeriksaan');
    await db.query('DELETE FROM pemeriksaan_penunjang'); // Jika ada dari EMR
    await db.query('DELETE FROM rekam_medis'); // Jika ada dari EMR
    
    // Hapus semua dokter lama 
    await db.query('DELETE FROM dokter');

    // Tambahkan dokter-dokter dengan berbagai spesialisasi
    const doctors = [
      ['Dr. Andi Pratama', 'Penyakit Dalam', '081511112222', 'Jl. Kesehatan No. 10'],
      ['Dr. Sari Lestari', 'Anak', '081622223333', 'Jl. Kesehatan No. 12'],
      ['Dr. Hadi Wijaya', 'Bedah', '081733334444', 'Jl. Kesehatan No. 14'],
      ['Dr. Rina Safitri', 'Gigi', '081844445555', 'Jl. Gigi Indah No. 5'],
      ['Dr. Budi Santoso', 'Umum', '081955556666', 'Jl. Sehat Raya No. 8'],
      ['Dr. Maya Indah', 'Kandungan', '082066667777', 'Jl. Ibu dan Anak No. 3'],
      ['Dr. Joko Nugroho', 'THT', '082177778888', 'Jl. Pendengaran No. 7'],
      ['Dr. Dian Kartika', 'Mata', '082288889999', 'Jl. Penglihatan No. 9'],
      ['Dr. Agus Salim', 'Saraf', '082399990000', 'Jl. Otak Sehat No. 11'],
      ['Dr. Fitri Wulandari', 'Kulit', '082400001111', 'Jl. Cantik Alami No. 15'],
      ['Dr. Heru Setiawan', 'Jantung', '082511112222', 'Jl. Detak Jantung No. 6'],
      ['Dr. Lina Marlina', 'Psikiater', '082622223333', 'Jl. Jiwa Sehat No. 20'],
      ['Dr. Toni Hartono', 'Radiologi', '082733334444', 'Jl. Sinar Terang No. 17'],
      ['Dr. Riana Puspita', 'Anastesi', '082844445555', 'Jl. Bius Sempurna No. 22'],
      ['Dr. Yanto Susilo', 'Orthopedi', '082955556666', 'Jl. Tulang Kuat No. 25']
    ];

    for (const [nama, spesialis, nomor_telepon, alamat] of doctors) {
      const result = await db.query(
        'INSERT INTO dokter (nama, spesialis, nomor_telepon, alamat) VALUES ($1, $2, $3, $4) RETURNING id',
        [nama, spesialis, nomor_telepon, alamat]
      );
      if (nama === 'Dr. Andi Pratama') {
        console.log(`ID untuk Dr. Andi Pratama: ${result.rows[0].id}`);
      }
    }

    console.log('Data dokter-dokter dengan berbagai spesialisasi telah ditambahkan');
  } catch (error) {
    console.error('Gagal menambahkan dokter-dokter:', error.message);
  } finally {
    process.exit(0);
  }
};

seedSpecialistDoctors();