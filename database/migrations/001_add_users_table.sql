-- 001_add_users_table.sql
-- Skrip ini membuat tabel 'users' terpusat untuk otentikasi semua peran.

CREATE TABLE IF NOT EXISTS users (
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

-- Penjelasan:
-- Tabel ini akan menjadi satu-satunya sumber kebenaran untuk otentikasi.
-- `password_hash` akan menyimpan password yang sudah di-enkripsi.
-- `role` akan menentukan hak akses pengguna di seluruh aplikasi.
-- `nama` adalah nama lengkap pengguna.
-- Kolom lain seperti `spesialis` atau `nomor_telepon` bisa digunakan sesuai kebutuhan peran.
