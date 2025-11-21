# Aplikasi Manajemen Klinik Sentosa

Aplikasi manajemen klinik berbasis web menggunakan React untuk frontend dan Node.js untuk backend.

## Struktur Project

```
klinik-sentosa/
├── backend/                    # Backend Node.js
│   ├── config/                 # Konfigurasi database
│   ├── controllers/            # Logika tiap modul (pasien, dokter, resep, dll)
│   ├── middleware/             # Middleware tambahan
│   ├── models/                 # Model database (menggunakan PostgreSQL)
│   ├── routes/                 # Definisi rute API
│   ├── app.js                  # Entry point backend
│   ├── seeding.js              # Skrip untuk seeding database
│   └── test-connection.js      # Skrip untuk uji koneksi database
├── database/                   # File-file terkait database
│   ├── database.sql            # Struktur awal database
│   ├── create_tables.sql       # Skrip untuk membuat tabel
│   └── DB_SETUP.md             # Dokumentasi setup database
├── frontend/                   # Frontend React (menggunakan Vite)
│   ├── public/                 # File statis
│   ├── src/                    # Sumber kode utama
│   │   ├── assets/             # Gambar dan file statis
│   │   ├── components/         # Komponen React berdasarkan modul
│   │   │   ├── auth/           # Komponen autentikasi
│   │   │   ├── appointments/   # Komponen jadwal appointment
│   │   │   ├── dashboard/      # Komponen dashboard
│   │   │   ├── patients/       # Komponen manajemen pasien
│   │   │   ├── doctors/        # Komponen manajemen dokter
│   │   │   ├── examinations/   # Komponen manajemen pemeriksaan
│   │   │   ├── medications/    # Komponen manajemen obat
│   │   │   ├── prescriptions/  # Komponen manajemen resep
│   │   │   ├── reports/        # Komponen laporan
│   │   │   ├── roles/          # Komponen berdasarkan peran
│   │   │   └── notifications/  # Komponen notifikasi
│   │   ├── styles/             # File CSS tambahan
│   │   ├── App.jsx             # Komponen utama
│   │   └── main.jsx            # Entry point React
│   └── ...
├── .env                        # Konfigurasi environment
├── .gitignore                  # File yang diabaikan oleh Git
├── package.json                # Dependensi project dan skrip
├── package-lock.json           # Versi dependensi yang terkunci
├── README.md                   # Dokumentasi utama
└── node_modules/               # Dependensi (akan dibuat saat instalasi)
```

## Instalasi

### Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- npm (Node Package Manager)
- PostgreSQL (versi 10 atau lebih tinggi)

### Setup Database
1. Buat database PostgreSQL dengan nama `klinik_sentosa`
2. Konfigurasi file `.env` dengan detail koneksi database Anda
3. Jalankan seeding untuk membuat tabel dan menambahkan data awal:
   ```bash
   cd backend
   node seeding.js
   ```

### Setup aplikasi
1. Instal dependensi untuk backend dan frontend:
   ```bash
   npm install
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

2. Konfigurasi file `.env` di root project:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=klinik_sentosa
   DB_PASS=postgres
   DB_PORT=5432
   PORT=3000
   ```

## Menjalankan Aplikasi

### Development
- Jalankan backend: `npm run dev` (dari root direktori)
- Jalankan frontend: `npm run dev:client` (dari root direktori)

### Production
- Build frontend: `npm run build:client`
- Jalankan aplikasi: `npm start`

## Teknologi yang Digunakan

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Vite, CSS
- **Database**: PostgreSQL
- **Tools**: npm

## API Endpoints

Setelah backend berjalan, API endpoints tersedia di `/api/`:
- `/api/pasien` - CRUD data pasien
- `/api/dokter` - CRUD data dokter
- `/api/pemeriksaan` - CRUD data pemeriksaan
- `/api/obat` - CRUD data obat
- `/api/resep` - CRUD data resep
- `/api/reports` - Laporan untuk admin

## Fitur Utama

- Sistem autentikasi dan otorisasi berbasis peran
- Manajemen pasien, dokter, pemeriksaan, obat, dan resep
- Sistem laporan untuk admin
- Dashboard analitik
- Sistem notifikasi
- Sistem penjadwalan appointment
- UI yang mewah dan elegan