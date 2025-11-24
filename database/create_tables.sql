-- Skrip untuk membuat tabel-tabel di database PostgreSQL

-- Membuat tabel pasien
CREATE TABLE IF NOT EXISTS pasien (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(10),
    alamat TEXT,
    nomor_telepon VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat tabel dokter
CREATE TABLE IF NOT EXISTS dokter (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    spesialis VARCHAR(100),
    nomor_telepon VARCHAR(15),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat tabel perawat
CREATE TABLE IF NOT EXISTS perawat (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nomor_telepon VARCHAR(15),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat tabel pemeriksaan
CREATE TABLE IF NOT EXISTS pemeriksaan (
    id SERIAL PRIMARY KEY,
    id_pasien INTEGER REFERENCES pasien(id),
    id_dokter INTEGER REFERENCES dokter(id),
    tanggal_pemeriksaan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    keluhan TEXT,
    diagnosa TEXT,
    rekomendasi_pengobatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat tabel pemeriksaan awal oleh perawat
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

-- Membuat tabel obat
CREATE TABLE IF NOT EXISTS obat (
    id SERIAL PRIMARY KEY,
    nama_obat VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    stok INTEGER DEFAULT 0,
    harga DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat tabel resep
CREATE TABLE IF NOT EXISTS resep (
    id SERIAL PRIMARY KEY,
    id_pemeriksaan INTEGER REFERENCES pemeriksaan(id),
    id_obat INTEGER REFERENCES obat(id),
    jumlah INTEGER,
    aturan_pakai TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat beberapa data awal sebagai contoh
INSERT INTO pasien (nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon) VALUES
('Budi Santoso', '1990-05-15', 'Laki-laki', 'Jl. Merdeka No. 123', '081234567890'),
('Siti Nurhaliza', '1985-11-22', 'Perempuan', 'Jl. Sudirman No. 45', '081345678901'),
('Ahmad Fauzi', '1978-03-08', 'Laki-laki', 'Jl. Gatot Subroto No. 67', '081456789012');

INSERT INTO dokter (nama, spesialis, nomor_telepon, alamat) VALUES
('Dr. Andi Pratama', 'Penyakit Dalam', '081511112222', 'Jl. Kesehatan No. 10'),
('Dr. Sari Lestari', 'Anak', '081622223333', 'Jl. Kesehatan No. 12'),
('Dr. Hadi Wijaya', 'Bedah', '081733334444', 'Jl. Kesehatan No. 14');