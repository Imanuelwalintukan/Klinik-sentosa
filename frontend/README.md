# Frontend Aplikasi Klinik Sentosa

Frontend untuk aplikasi manajemen klinik berbasis React menggunakan Vite sebagai build tool.

## Teknologi

- React 19
- React Router DOM 7
- Vite 7
- CSS (dengan tema mewah dan elegan)

## Fitur Utama

- Sistem navigasi berdasarkan role (admin, dokter, apoteker, pasien)
- Manajemen pasien, dokter, pemeriksaan, obat, dan resep
- Dashboard analitik
- Sistem laporan
- Sistem penjadwalan appointment
- UI yang mewah dan elegan

## Struktur Komponen

Komponen disusun berdasarkan modul:
- `auth/` - Komponen autentikasi dan otorisasi
- `patients/` - Komponen manajemen pasien
- `doctors/` - Komponen manajemen dokter
- `examinations/` - Komponen manajemen pemeriksaan
- `medications/` - Komponen manajemen obat
- `prescriptions/` - Komponen manajemen resep
- `reports/` - Komponen laporan
- `roles/` - Komponen berdasarkan peran pengguna

## Instalasi

1. Instal dependensi:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

## Build untuk Production

```bash
npm run build
```

## Integrasi

Frontend ini terintegrasi dengan backend Node.js yang tersedia di `../backend` dan mengakses API melalui `http://localhost:3000/api/`.