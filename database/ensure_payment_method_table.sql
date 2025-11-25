-- File untuk memastikan struktur tabel metode_pembayaran sesuai dengan query kita
-- Cek apakah tabel metode_pembayaran sudah ada
CREATE TABLE IF NOT EXISTS metode_pembayaran (
  id SERIAL PRIMARY KEY,
  nama_metode VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  jenis_pembayaran VARCHAR(50) CHECK (jenis_pembayaran IN ('tunai', 'non_tunai', 'jaminan')), -- tunai, transfer, kartu, bpjs, dll
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cek apakah kolom is_active ada di tabel
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'metode_pembayaran' AND column_name = 'is_active') THEN
    ALTER TABLE metode_pembayaran ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Tambahkan beberapa data metode pembayaran default jika belum ada
INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
SELECT 'Tunai', 'Pembayaran dengan uang tunai', 'tunai', TRUE
WHERE NOT EXISTS (SELECT 1 FROM metode_pembayaran WHERE nama_metode = 'Tunai');

INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
SELECT 'Transfer Bank', 'Pembayaran melalui transfer antar bank', 'non_tunai', TRUE
WHERE NOT EXISTS (SELECT 1 FROM metode_pembayaran WHERE nama_metode = 'Transfer Bank');

INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
SELECT 'Kartu Debit', 'Pembayaran menggunakan kartu debit', 'non_tunai', TRUE
WHERE NOT EXISTS (SELECT 1 FROM metode_pembayaran WHERE nama_metode = 'Kartu Debit');

INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
SELECT 'Kartu Kredit', 'Pembayaran menggunakan kartu kredit', 'non_tunai', TRUE
WHERE NOT EXISTS (SELECT 1 FROM metode_pembayaran WHERE nama_metode = 'Kartu Kredit');

INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
SELECT 'BPJS Kesehatan', 'Pembayaran melalui program BPJS Kesehatan', 'jaminan', TRUE
WHERE NOT EXISTS (SELECT 1 FROM metode_pembayaran WHERE nama_metode = 'BPJS Kesehatan');

INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran, is_active)
SELECT 'Asuransi Swasta', 'Pembayaran melalui asuransi kesehatan swasta', 'jaminan', TRUE
WHERE NOT EXISTS (SELECT 1 FROM metode_pembayaran WHERE nama_metode = 'Asuransi Swasta');