-- View untuk laporan pemeriksaan yang sering digunakan dalam pelaporan
CREATE OR REPLACE VIEW view_laporan_pemeriksaan AS
SELECT 
    p.id AS id_pemeriksaan,
    p.tanggal_pemeriksaan,
    p.keluhan,
    p.diagnosa,
    p.rekomendasi_pengobatan,
    ps.id AS id_pasien,
    ps.nama AS nama_pasien,
    ps.jenis_kelamin AS jenis_kelamin_pasien,
    ps.usia AS usia_pasien,
    d.id AS id_dokter,
    d.nama AS nama_dokter,
    d.spesialis AS spesialis_dokter,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, ps.tanggal_lahir)) AS usia_pasien_tahun,
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ps.tanggal_lahir)) < 18 THEN 'Anak-anak'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ps.tanggal_lahir)) BETWEEN 18 AND 59 THEN 'Dewasa'
        ELSE 'Lansia'
    END AS kategori_usia,
    DATE_PART('month', p.tanggal_pemeriksaan) AS bulan,
    DATE_PART('year', p.tanggal_pemeriksaan) AS tahun
FROM pemeriksaan p
JOIN pasien ps ON p.id_pasien = ps.id
JOIN dokter d ON p.id_dokter = d.id;

-- View untuk laporan resep dan obat
CREATE OR REPLACE VIEW view_laporan_resep AS
SELECT 
    r.id AS id_resep,
    r.id_pemeriksaan,
    pm.tanggal_pemeriksaan,
    ps.id AS id_pasien,
    ps.nama AS nama_pasien,
    d.id AS id_dokter,
    d.nama AS nama_dokter,
    o.id AS id_obat,
    o.nama_obat,
    o.harga,
    r.jumlah,
    r.aturan_pakai,
    EXTRACT(YEAR FROM pm.tanggal_pemeriksaan) AS tahun_resep,
    EXTRACT(MONTH FROM pm.tanggal_pemeriksaan) AS bulan_resep
FROM resep r
JOIN pemeriksaan pm ON r.id_pemeriksaan = pm.id
JOIN pasien ps ON pm.id_pasien = ps.id
JOIN dokter d ON pm.id_dokter = d.id
JOIN obat o ON r.id_obat = o.id;

-- View untuk laporan keuangan
CREATE OR REPLACE VIEW view_laporan_keuangan AS
SELECT 
    p.id AS id_pembayaran,
    p.id_pasien,
    ps.nama AS nama_pasien,
    d.id AS id_dokter,
    d.nama AS nama_dokter,
    p.tanggal_pembayaran,
    SUM(o.harga * r.jumlah) AS total_pembayaran,
    COUNT(r.id) AS jumlah_resep,
    COUNT(DISTINCT pm.id) AS jumlah_pemeriksaan,
    EXTRACT(YEAR FROM p.tanggal_pembayaran) AS tahun_pembayaran,
    EXTRACT(MONTH FROM p.tanggal_pembayaran) AS bulan_pembayaran
FROM pembayaran p
JOIN pemeriksaan pm ON p.id_pemeriksaan = pm.id
JOIN pasien ps ON pm.id_pasien = ps.id
JOIN dokter d ON pm.id_dokter = d.id
JOIN resep r ON pm.id = r.id_pemeriksaan
JOIN obat o ON r.id_obat = o.id
GROUP BY p.id, ps.id, d.id, p.tanggal_pembayaran;