-- Membuat tabel untuk menyimpan daftar diagnosa berdasarkan spesialisasi dokter
CREATE TABLE IF NOT EXISTS diagnosa_spesialis (
  id SERIAL PRIMARY KEY,
  kode_diagnosa VARCHAR(20) UNIQUE NOT NULL,  -- Contoh: I10 (hipertensi), J06 (infeksi saluran pernapasan), dll
  nama_diagnosa VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  spesialisasi_berlaku VARCHAR(100),  -- Spesialisasi dokter yang dapat memberikan diagnosa ini
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk mencatat diagnosa yang sering digunakan oleh dokter tertentu
CREATE TABLE IF NOT EXISTS diagnosa_dokter (
  id SERIAL PRIMARY KEY,
  id_dokter INTEGER REFERENCES dokter(id) ON DELETE CASCADE,
  kode_diagnosa VARCHAR(20) REFERENCES diagnosa_spesialis(kode_diagnosa),
  nama_diagnosa VARCHAR(255) NOT NULL,  -- Disimpan juga untuk efisiensi
  digunakan_sebanyak INTEGER DEFAULT 1, -- Jumlah penggunaan untuk rekomendasi
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data diagnosa awal berdasarkan spesialisasi
INSERT INTO diagnosa_spesialis (kode_diagnosa, nama_diagnosa, deskripsi, spesialisasi_berlaku) VALUES
  -- Diagnosa umum yang bisa digunakan semua dokter
  ('Z00.0', 'Pemeriksaan Kesehatan Rutin', 'Pemeriksaan kesehatan menyeluruh untuk tujuan pencegahan', 'Umum'),
  ('R51', 'Sakit Kepala', 'Gangguan neurologis umum yang sering dialami pasien', 'Umum'),
  ('R10.13', 'Nyeri Perut', 'Ketidaknyamanan di area perut', 'Umum'),
  ('R05', 'Batuk', 'Refleks perlindungan saluran napas', 'Umum'),
  ('R06.02', 'Sesak Napas', 'Gangguan pernapasan', 'Umum'),
  ('R50.9', 'Demam', 'Meningkatnya suhu tubuh', 'Umum'),
  
  -- Diagnosa untuk Spesialis Penyakit Dalam
  ('I10', 'Hipertensi Esensial', 'Tekanan darah tinggi tanpa penyebab sekunder', 'Penyakit Dalam'),
  ('E11.9', 'Diabetes Mellitus Tipe 2 Tanpa Komplikasi', 'Penyakit metabolik dengan kadar glukosa tinggi', 'Penyakit Dalam'),
  ('K29.7', 'Gastritis', 'Peradangan lambung', 'Penyakit Dalam'),
  ('J44.1', 'Penyakit Paru Obstruktif Kronik (PPOK)', 'Gangguan paru progresif', 'Penyakit Dalam'),
  ('E78.0', 'Hiperkolesterolemia', 'Kadar kolesterol tinggi', 'Penyakit Dalam'),
  
  -- Diagnosa untuk Spesialis Anak
  ('J06.9', 'Infeksi Saluran Pernapasan Atas', 'Infeksi virus umum pada anak', 'Anak'),
  ('A00.9', 'Diare', 'Gangguan pencernaan umum pada anak', 'Anak'),
  ('J02.9', 'Faringitis', 'Radang tenggorokan', 'Anak'),
  ('A56.8', 'ISK (Infeksi Saluran Kemih)', 'Infeksi bakteri pada sistem kemih anak', 'Anak'),
  ('R61', 'Hiperhidrosis', 'Pengeluaran keringat berlebih', 'Anak'),
  
  -- Diagnosa untuk Spesialis Gigi
  ('K02.9', 'Karies Gigi', 'Kerusakan enamel gigi', 'Gigi'),
  ('K04.9', 'Pulpitis', 'Peradangan jaringan pulpa gigi', 'Gigi'),
  ('K05.9', 'Gingivitis', 'Peradangan gusi', 'Gigi'),
  ('K08.3', 'Gigi Impaksi', 'Gigi yang tidak tumbuh normal', 'Gigi'),
  ('K14.1', 'Stomatitis', 'Radang pada mulut', 'Gigi'),
  
  -- Diagnosa untuk Spesialis Bedah
  ('M54.5', 'Nyeri Punggung Bawah', 'Kondisi umum yang memerlukan penanganan bedah', 'Bedah'),
  ('K35.8', 'Apendisitis Akut', 'Peradangan usus buntu', 'Bedah'),
  ('J35.1', 'Ambeien', 'Pembengkakan vena anorektal', 'Bedah'),
  ('E16.2', 'Hernia Inguinalis', 'Penonjolan jaringan melalui dinding abdomen', 'Bedah'),
  ('L02.9', 'Abses Kulit', 'Kumpulan nanah dalam jaringan', 'Bedah'),
  
  -- Diagnosa untuk Spesialis THT
  ('J03.9', 'Tonsillitis Akut', 'Peradangan tonsil', 'THT'),
  ('H66.9', 'Otitis Media', 'Peradangan telinga tengah', 'THT'),
  ('J32.9', 'Rinitis Alergi', 'Alergi terhadap alergen di hidung', 'THT'),
  ('J39.0', 'Laringitis', 'Peradangan laring', 'THT'),
  ('J34.8', 'Deviasi Septum', 'Gangguan pada dinding hidung', 'THT'),
  
  -- Diagnosa untuk Spesialis Mata
  ('H52.0', 'Miopi', 'Gangguan refraksi penglihatan', 'Mata'),
  ('H26.9', 'Katarak', 'Pengabutan lensa mata', 'Mata'),
  ('H40.9', 'Glaukoma', 'Kenaikan tekanan bola mata', 'Mata'),
  ('H02.1', 'Ptosis', 'Kelopak mata turun', 'Mata'),
  ('H10.9', 'Konjungtivitis', 'Peradangan konjungtiva', 'Mata'),
  
  -- Diagnosa untuk Spesialis Kandungan
  ('O24.9', 'Diabetes Gestasional', 'Diabetes selama kehamilan', 'Kandungan'),
  ('O80', 'Persalinan Normal', 'Persalinan pervaginam spontan', 'Kandungan'),
  ('O22.9', 'Varises pada Kehamilan', 'Pelebaran vena selama hamil', 'Kandungan'),
  ('O70.9', 'Robekan Perineal', 'Robekan saat melahirkan', 'Kandungan'),
  ('O10.9', 'Hipertensi Kronik dalam Kehamilan', 'Tekanan darah tinggi saat hamil', 'Kandungan'),
  
  -- Diagnosa untuk Spesialis Saraf
  ('G47.0', 'Insomnia', 'Gangguan tidur', 'Saraf'),
  ('G47.3', 'Sleep Apnea', 'Gangguan pernapasan saat tidur', 'Saraf'),
  ('G20', 'Parkinson', 'Gangguan sistem saraf', 'Saraf'),
  ('G47.1', 'Narkolepsi', 'Gangguan tidur berlebih', 'Saraf'),
  ('G54.0', 'Neuralgia', 'Nyeri saraf', 'Saraf'),
  
  -- Diagnosa untuk Spesialis Kulit
  ('L29.0', 'Dermatitis Alergi', 'Peradangan kulit karena alergi', 'Kulit'),
  ('L03.9', 'Selulitis', 'Infeksi jaringan kulit dalam', 'Kulit'),
  ('L50.9', 'Urtikaria', 'Biduran atau gatal-gatal', 'Kulit'),
  ('L84', 'Kutil', 'Lesi pada kulit karena virus HPV', 'Kulit'),
  ('L20.9', 'Eksim', 'Peradangan kulit kronis', 'Kulit'),
  
  -- Diagnosa untuk Spesialis Jantung
  ('I25.1', 'Penyakit Jantung Koroner', 'Penyempitan arteri koroner', 'Jantung'),
  ('I11.0', 'Penyakit Jantung Hipertensi', 'Kerusakan jantung karena hipertensi', 'Jantung'),
  ('I48.9', 'Fibrilasi Atrium', 'Gangguan irama jantung', 'Jantung'),
  ('I20.9', 'Angina Pektoris', 'Nyeri dada karena jantung', 'Jantung'),
  ('I50.9', 'Gagal Jantung', 'Kemampuan jantung memompa darah menurun', 'Jantung');