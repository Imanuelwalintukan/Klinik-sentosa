-- Tambahkan tabel metode_pembayaran
CREATE TABLE IF NOT EXISTS metode_pembayaran (
  id SERIAL PRIMARY KEY,
  nama_metode VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  jenis_pembayaran VARCHAR(50) CHECK (jenis_pembayaran IN ('tunai', 'non_tunai', 'jaminan')), -- tunai, transfer, kartu, bpjs, dll
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambahkan tabel pembayaran
CREATE TABLE IF NOT EXISTS pembayaran (
  id SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep(id) ON DELETE CASCADE, -- pembayaran terkait dengan resep
  id_metode_pembayaran INTEGER REFERENCES metode_pembayaran(id),
  jumlah_pembayaran DECIMAL(10,2) NOT NULL,
  jumlah_dibayarkan DECIMAL(10,2) DEFAULT 0,
  jumlah_kembalian DECIMAL(10,2) DEFAULT 0,
  status_pembayaran VARCHAR(50) DEFAULT 'belum_lunas' CHECK (status_pembayaran IN ('belum_lunas', 'lunas', 'ditunda')),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambahkan kolom ke tabel resep untuk relasi pembayaran
ALTER TABLE resep ADD COLUMN IF NOT EXISTS id_pembayaran INTEGER REFERENCES pembayaran(id);