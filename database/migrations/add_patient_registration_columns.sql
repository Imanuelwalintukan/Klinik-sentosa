-- Menambahkan kolom-kolom baru untuk pendaftaran pasien lengkap
ALTER TABLE pasien 
ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(100),
ADD COLUMN IF NOT EXISTS agama VARCHAR(50),
ADD COLUMN IF NOT EXISTS status_perkawinan VARCHAR(50),
ADD COLUMN IF NOT EXISTS nomor_bpjs VARCHAR(50),
ADD COLUMN IF NOT EXISTS riwayat_alergi TEXT;