// Script tambahan data untuk testing EMR
const db = require('./backend/config/database');

const seedTestData = async () => {
  try {
    console.log('Menambahkan data dummy untuk testing sistem EMR...');

    // Tambahkan beberapa pemeriksaan dummy untuk data laporan dengan ID pasien dan dokter yang valid
    const examinations = [
      [8, 4, 'Demam tinggi', 'Demam', 'Istirahat cukup dan minum banyak air putih', '2025-11-01T09:00:00', 'Belum'],
      [9, 5, 'Batuk pilek', 'Common Cold', 'Istirahat dan konsumsi obat batuk', '2025-11-02T10:30:00', 'Selesai'],
      [10, 6, 'Sakit kepala', 'Tension Headache', 'Konsumsi obat paracetamol', '2025-11-03T11:15:00', 'Selesai'],
      [11, 7, 'Nyeri sendi', 'Arthritis', 'Olahraga ringan dan konsumsi obat anti inflamasi', '2025-11-04T14:20:00', 'Belum'],
      [12, 8, 'Asma', 'Bronchial Asthma', 'Gunakan inhaler dan hindari pemicu', '2025-11-05T15:45:00', 'Selesai']
    ];

    // Hapus resep yang terkait dengan pemeriksaan yang akan kita update
    await db.query('DELETE FROM resep WHERE id_pemeriksaan IN (SELECT id FROM pemeriksaan WHERE id_pasien IN (8,9,10,11,12))');

    // Hapus pemeriksaan yang sudah ada untuk pasien yang akan kita update
    await db.query('DELETE FROM pemeriksaan WHERE id_pasien IN (8,9,10,11,12)');

    // Tambahkan data pemeriksaan dan kumpulkan ID yang dihasilkan
    const createdExaminations = [];
    for (const [id_pasien, id_dokter, keluhan, diagnosa, rekomendasi, tanggal_pemeriksaan, status_resep] of examinations) {
      const result = await db.query(`
        INSERT INTO pemeriksaan (id_pasien, id_dokter, keluhan, diagnosa, rekomendasi_pengobatan, tanggal_pemeriksaan, status_resep)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [id_pasien, id_dokter, keluhan, diagnosa, rekomendasi, tanggal_pemeriksaan, status_resep]);

      createdExaminations.push({
        id: result.rows[0].id,
        id_pasien: id_pasien
      });
    }

    // Tambahkan resep untuk pemeriksaan yang baru dibuat
    for (const exam of createdExaminations) {
      // Buat beberapa resep dummy untuk setiap pemeriksaan
      await db.query(`
        INSERT INTO resep (id_pemeriksaan, id_obat, jumlah, aturan_pakai)
        VALUES ($1, 1, 3, '3 kali sehari setelah makan'),
               ($1, 2, 1, '1 kali sehari sebelum tidur')
        ON CONFLICT (id) DO UPDATE SET
          id_pemeriksaan = EXCLUDED.id_pemeriksaan,
          id_obat = EXCLUDED.id_obat,
          jumlah = EXCLUDED.jumlah,
          aturan_pakai = EXCLUDED.aturan_pakai
      `, [exam.id]);
    }

    console.log('Data dummy untuk testing EMR berhasil ditambahkan');
  } catch (error) {
    console.error('Gagal menambahkan data dummy untuk EMR:', error.message);
  } finally {
    process.exit(0);
  }
};

seedTestData();