// Script untuk menjalankan migrasi EMR (Electronic Medical Records)
const db = require('./backend/config/database');

const runEMRMigration = async () => {
  try {
    console.log('Menjalankan migrasi EMR (Electronic Medical Records)...');
    
    const migrationQuery = `
      -- Tabel rekam_medis untuk menyimpan catatan medis utama pasien
      CREATE TABLE IF NOT EXISTS rekam_medis (
          id SERIAL PRIMARY KEY,
          id_pasien INTEGER REFERENCES pasien(id) ON DELETE CASCADE,
          id_dokter INTEGER REFERENCES dokter(id),
          tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          tanggal_pemeriksaan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          riwayat_penyakit_keluarga TEXT,
          riwayat_pengobatan_sebelumnya TEXT,
          catatan_klinis TEXT,
          ringkasan_kondisi_pasien TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabel untuk riwayat alergi secara terperinci
      CREATE TABLE IF NOT EXISTS riwayat_alergi (
          id SERIAL PRIMARY KEY,
          id_pasien INTEGER REFERENCES pasien(id) ON DELETE CASCADE,
          jenis_alergi VARCHAR(100), -- obat, makanan, lingkungan, dll
          nama_alergen VARCHAR(200), -- nama spesifik alergen
          tingkat_keparahan VARCHAR(20), -- ringan, sedang, berat
          tanggal_konfirmasi DATE,
          gejala_yang_muncul TEXT,
          catatan_tambahan TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabel untuk hasil pemeriksaan penunjang (lab, radiologi, dll)
      CREATE TABLE IF NOT EXISTS pemeriksaan_penunjang (
          id SERIAL PRIMARY KEY,
          id_pasien INTEGER REFERENCES pasien(id) ON DELETE CASCADE,
          id_pemeriksaan INTEGER REFERENCES pemeriksaan(id) ON DELETE SET NULL, -- referensi ke pemeriksaan utama
          jenis_pemeriksaan VARCHAR(100), -- laboratorium, radiologi, histopatologi, dll
          nama_pemeriksaan VARCHAR(200),
          hasil_pemeriksaan TEXT,
          nilai_normal VARCHAR(200),
          catatan_hasil TEXT,
          tanggal_pemeriksaan DATE,
          dokter_penanggung_jawab VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabel untuk riwayat imunisasi
      CREATE TABLE IF NOT EXISTS riwayat_imunisasi (
          id SERIAL PRIMARY KEY,
          id_pasien INTEGER REFERENCES pasien(id) ON DELETE CASCADE,
          jenis_imunisasi VARCHAR(100),
          tanggal_imunisasi DATE,
          dosis_ke INTEGER,
          batch_vaksin VARCHAR(100),
          catatan_tambahan TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabel untuk riwayat kehamilan (untuk pasien wanita)
      CREATE TABLE IF NOT EXISTS riwayat_kehamilan (
          id SERIAL PRIMARY KEY,
          id_pasien INTEGER REFERENCES pasien(id) ON DELETE CASCADE,
          tanggal_kehamilan DATE,
          usia_kehamilan INTEGER, -- dalam minggu
          hasil_pemeriksaan_kehamilan TEXT,
          catatan_dokter TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Memperluas tabel pemeriksaan dengan referensi ke EMR
      ALTER TABLE pemeriksaan
      ADD COLUMN IF NOT EXISTS id_rekam_medis INTEGER REFERENCES rekam_medis(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS riwayat_penyakit_keluarga TEXT,
      ADD COLUMN IF NOT EXISTS riwayat_pengobatan_sebelumnya TEXT;
    `;
    
    await db.query(migrationQuery);
    
    console.log('Migrasi EMR berhasil dijalankan');
    console.log('Tabel-tabel EMR telah ditambahkan ke database');
  } catch (error) {
    console.error('Gagal menjalankan migrasi EMR:', error.message);
  } finally {
    process.exit(0);
  }
};

runEMRMigration();