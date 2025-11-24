const bcrypt = require('bcryptjs');
const db = require('./backend/config/database');

const addMedications = async () => {
  try {
    console.log('Menambahkan contoh obat ke database...');

    // Data obat yang akan ditambahkan
    const medications = [
      ['Aspirin', 'Obat pereda nyeri dan anti-inflamasi', 120, 7500],
      ['Omeprazole', 'Obat untuk mengurangi asam lambung', 80, 12000],
      ['Loratadine', 'Obat antihistamin untuk alergi', 90, 8000],
      ['Cetirizine', 'Obat antihistamin lainnya', 75, 8500],
      ['Diclofenac', 'Obat anti-inflamasi non-steroid', 60, 9500],
      ['Prednisone', 'Kortikosteroid untuk peradangan', 40, 15000],
      ['Salbutamol', 'Obat asma dan bronkospasme', 55, 11000],
      ['Metformin', 'Obat untuk diabetes tipe 2', 100, 6500],
      ['Atorvastatin', 'Obat penurun kolesterol', 85, 14000],
      ['Losartan', 'Obat tekanan darah tinggi', 70, 10000],
      ['Amlodipine', 'Obat tekanan darah tinggi lainnya', 65, 10500],
      ['Metronidazole', 'Antibiotik untuk infeksi', 95, 7000],
      ['Ciprofloxacin', 'Antibiotik spektrum luas', 85, 13000],
      ['Ranitidine', 'Obat penghambat reseptor H2', 75, 9000],
      ['Dextromethorphan', 'Obat batuk', 110, 7500]
    ];

    let addedCount = 0;
    for (const [nama_obat, deskripsi, stok, harga] of medications) {
      // Cek apakah obat sudah ada
      const existing = await db.query('SELECT id FROM obat WHERE nama_obat = $1', [nama_obat]);
      
      if (existing.rows.length === 0) {
        // Jika belum ada, tambahkan
        await db.query(`
          INSERT INTO obat (nama_obat, deskripsi, stok, harga) 
          VALUES ($1, $2, $3, $4)
        `, [nama_obat, deskripsi, stok, harga]);
        
        console.log(`Obat ${nama_obat} telah ditambahkan`);
        addedCount++;
      } else {
        console.log(`Obat ${nama_obat} sudah ada di database`);
      }
    }

    console.log(`\nProses selesai. ${addedCount} obat baru telah ditambahkan.`);
    
    // Tampilkan jumlah total obat setelah penambahan
    const total = await db.query('SELECT COUNT(*) as count FROM obat');
    console.log(`Total obat di database sekarang: ${total.rows[0].count}`);
    
  } catch (error) {
    console.error('Gagal menambahkan obat:', error.message);
  } finally {
    process.exit(0);
  }
};

addMedications();