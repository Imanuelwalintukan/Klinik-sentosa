# Panduan Setup Database untuk Aplikasi Klinik Sentosa

## Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- PostgreSQL (versi 10 atau lebih tinggi)
- npm (Node Package Manager)

## Instalasi

1. **Instal dependensi backend:**
   ```bash
   npm install
   ```

2. **Buat database PostgreSQL:**
   Anda perlu membuat database dengan nama `klinik_sentosa` di PostgreSQL Anda.
   
   Contoh perintah di PostgreSQL:
   ```sql
   CREATE DATABASE klinik_sentosa;
   ```

3. **Konfigurasi koneksi database:**
   Buat file `.env` di root direktori proyek dan tambahkan konfigurasi:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=klinik_sentosa
   DB_PASS=postgres
   DB_PORT=5432
   PORT=3000
   ```

   Sesuaikan dengan konfigurasi database PostgreSQL Anda.

## Setup Database

1. **Jalankan seeding untuk membuat tabel dan menambahkan data awal:**
   ```bash
   npm run seed
   ```
   
   Ini akan:
   - Membuat semua tabel yang diperlukan sesuai dengan `database.sql`
   - Menambahkan data awal ke tabel-tabel tersebut

2. **Uji koneksi database (opsional):**
   ```bash
   node test-connection.js
   ```

## Menjalankan Aplikasi

1. **Jalankan backend:**
   ```bash
   npm run dev
   ```

2. **Jalankan frontend (di terminal terpisah):**
   ```bash
   cd frontend
   npm run dev
   ```

## Struktur Database

Database ini terdiri dari 5 tabel utama:
- **pasien**: Menyimpan data pasien
- **dokter**: Menyimpan data dokter
- **pemeriksaan**: Menyimpan data pemeriksaan medis
- **obat**: Menyimpan data obat
- **resep**: Menyimpan data resep yang diberikan dokter

## API Endpoints

Setelah setup selesai, API endpoints tersedia di `/api/`:
- `/api/pasien` - CRUD data pasien
- `/api/dokter` - CRUD data dokter
- `/api/pemeriksaan` - CRUD data pemeriksaan
- `/api/obat` - CRUD data obat
- `/api/resep` - CRUD data resep
- `/api/reports` - Laporan untuk admin

## Troubleshooting

Jika mengalami masalah:
1. Pastikan PostgreSQL berjalan
2. Pastikan nama database, username, dan password sesuai
3. Pastikan tabel-tabel sudah dibuat dengan menjalankan `npm run seed`
4. Cek koneksi dengan `node test-connection.js`

## Catatan

- Pastikan firewall tidak memblokir koneksi ke PostgreSQL
- Gunakan password yang kuat untuk produksi
- Backup database secara berkala untuk keamanan data