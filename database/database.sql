-- Struktur awal database untuk Klinik Sentosa

-- Tabel pasien
CREATE TABLE pasien (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(10),
    alamat TEXT,
    nomor_telepon VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel dokter
CREATE TABLE dokter (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    spesialis VARCHAR(100),
    nomor_telepon VARCHAR(15),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel pemeriksaan
CREATE TABLE pemeriksaan (
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

-- Tabel obat
CREATE TABLE obat (
    id SERIAL PRIMARY KEY,
    nama_obat VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    stok INTEGER DEFAULT 0,
    harga DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel resep
CREATE TABLE resep (
    id SERIAL PRIMARY KEY,
    id_pemeriksaan INTEGER REFERENCES pemeriksaan(id),
    id_obat INTEGER REFERENCES obat(id),
    jumlah INTEGER,
    aturan_pakai TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel 'users' terpusat untuk otentikasi semua peran.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Password akan di-hash menggunakan bcrypt
    role VARCHAR(20) NOT NULL, -- e.g., 'admin', 'dokter', 'perawat', 'apoteker'
    nama VARCHAR(100) NOT NULL,
    
    -- Kolom opsional yang bisa digunakan oleh role tertentu
    spesialis VARCHAR(100),
    nomor_telepon VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
