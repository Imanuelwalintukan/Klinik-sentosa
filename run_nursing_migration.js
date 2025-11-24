// Script untuk menjalankan migrasi tabel perawat
const db = require('./backend/config/database');

const runMigration = async () => {
  try {
    console.log('Menjalankan migrasi tabel perawat...');
    
    const migrationQuery = `
      -- Menambahkan tabel perawat
      CREATE TABLE IF NOT EXISTS perawat (
          id SERIAL PRIMARY KEY,
          nama VARCHAR(100) NOT NULL,
          nomor_telepon VARCHAR(15),
          alamat TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Menambahkan tabel pemeriksaan awal oleh perawat
      CREATE TABLE IF NOT EXISTS pemeriksaan_awal (
          id SERIAL PRIMARY KEY,
          id_pasien INTEGER REFERENCES pasien(id),
          id_perawat INTEGER REFERENCES perawat(id),
          berat_badan DECIMAL(5,2),
          tinggi_badan DECIMAL(5,2),
          tensi_sistolik INTEGER,  -- tekanan darah sistolik
          tensi_diastolik INTEGER, -- tekanan darah diastolik
          suhu_tubuh DECIMAL(4,2), -- suhu dalam celcius
          denyut_nadi INTEGER,     -- bpm (beats per minute)
          saturasi_oksigen INTEGER, -- SpO2 dalam persen
          riwayat_singkat TEXT,     -- keluhan awal atau catatan perawat
          tanggal_pemeriksaan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await db.query(migrationQuery);
    
    console.log('Migrasi tabel perawat berhasil dijalankan');
  } catch (error) {
    console.error('Gagal menjalankan migrasi:', error.message);
  } finally {
    process.exit(0);
  }
};

runMigration();