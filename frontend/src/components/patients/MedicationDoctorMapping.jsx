import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider';
import './MedicationDoctorMapping.css';

const MedicationDoctorMapping = () => {
  const [medications, setMedications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [medicationsRes, doctorsRes, prescriptionsRes] = await Promise.all([
        axios.get('/obat'),
        axios.get('/dokter'),
        axios.get('/resep').catch(() => ({ data: { data: [] } })) // Handle error jika pengguna tidak punya akses
      ]);

      setMedications(medicationsRes.data.data || []);
      setDoctors(doctorsRes.data.data || []);
      setPrescriptions(prescriptionsRes.data.data || []);
    } catch (err) {
      setError('Gagal mengambil data obat dan dokter: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan obat yang umum diresepkan berdasarkan spesialisasi dokter
  const getCommonMedicationsForSpecialization = (specialization) => {
    // Kita bisa membuat logika untuk mengidentifikasi obat yang sering diresepkan
    // berdasarkan spesialisasi dari data resep yang ada
    const commonMeds = {};

    prescriptions.forEach(prescription => {
      // Kita perlu info spesialisasi dokter untuk setiap resep
      // Karena saat ini resep hanya berisi id_pemeriksaan, kita perlu mengaitkannya dengan dokter
    });

    return [];
  };

  // Filter dokter berdasarkan spesialisasi jika dipilih
  const filteredDoctors = selectedSpecialization
    ? doctors.filter(doctor => doctor.spesialis.toLowerCase().includes(selectedSpecialization.toLowerCase()))
    : doctors;

  // Dapatkan spesialisasi unik untuk dropdown filter
  const specializations = [...new Set(doctors.map(doctor => doctor.spesialis))];

  // Fungsi untuk mencari obat yang umum untuk spesialisasi tertentu
  const getMedicationsBySpecialization = (specialization) => {
    // Dalam implementasi nyata, kita akan menghubungkan data resep, pemeriksaan, dan dokter
    // untuk menentukan obat-obatan yang sering diresepkan oleh dokter spesialisasi tertentu
    // Sebagai contoh sementara, kita akan buat logika berdasarkan nama obat atau deskripsi
    const specializationsMap = {
      'penyakit dalam': ['paracetamol', 'antibiotik', 'antihistamin', 'obat tekanan darah'],
      'anak': ['paracetamol sirup', 'multivitamin anak', 'obat batuk anak'],
      'kulit': ['krim antibiotik', 'antijamur', 'kortikosteroid topikal'],
      'gigi': ['antibiotik', 'obat nyeri', 'kumur antiseptik'],
      'bedah': ['antibiotik', 'penghilang rasa sakit', 'obat pembeku darah'],
      'kandungan': ['pil kb', 'hormon', 'multivitamin'],
      'syaraf': ['antidepresan', 'obat tidur', 'penghilang nyeri saraf'],
      'mata': ['tetes mata', 'obat glukoma', 'antibiotik mata'],
      'telinga hidung tenggorokan': ['obat alergi', 'decongestan', 'antibiotik']
    };

    const commonMeds = specializationsMap[specialization.toLowerCase()] || [];
    return medications.filter(med =>
      commonMeds.some(commonMed =>
        med.nama_obat.toLowerCase().includes(commonMed) ||
        med.deskripsi?.toLowerCase().includes(commonMed)
      )
    );
  };

  if (loading) return <div className="loading">Memuat data obat dan dokter...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="medication-doctor-mapping">
      <h2>Daftar Obat & Dokter Spesialis</h2>
      <p>Informasi obat-obatan dan dokter spesialis yang relevan</p>

      <div className="filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'end' }}>
        <div className="filter-select">
          <label htmlFor="specializationFilter">Filter Spesialisasi:</label>
          <select
            id="specializationFilter"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="form-control"
          >
            <option value="">Semua Spesialisasi</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedSpecialization && (
        <div className="specialization-medications">
          <h3>Obat Umum untuk Spesialisasi {selectedSpecialization}</h3>
          {getMedicationsBySpecialization(selectedSpecialization).length > 0 ? (
            <div className="medication-list">
              {getMedicationsBySpecialization(selectedSpecialization).map((med) => (
                <div key={med.id} className="medication-card">
                  <h4>{med.nama_obat}</h4>
                  <p className="medication-description">{med.deskripsi || 'Tidak ada deskripsi'}</p>
                  <div className="medication-details">
                    <span className="stock">Stok: {med.stok}</span>
                    <span className="price">Rp{med.harga?.toLocaleString('id-ID') || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Tidak ada obat yang umum untuk spesialisasi ini dalam database.</p>
          )}
        </div>
      )}

      <div className="content-grid">
        <div className="medications-section">
          <h3>Daftar Obat Tersedia</h3>
          {medications.length > 0 ? (
            <div className="medication-list">
              {medications.map((med) => (
                <div key={med.id} className="medication-card">
                  <h4>{med.nama_obat}</h4>
                  <p className="medication-description">{med.deskripsi || 'Tidak ada deskripsi'}</p>
                  <div className="medication-details">
                    <span className="stock">Stok: {med.stok}</span>
                    <span className="price">Rp{med.harga?.toLocaleString('id-ID') || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Tidak ada obat yang terdaftar.</p>
          )}
        </div>

        <div className="doctors-section">
          <h3>Dokter Spesialis</h3>
          {filteredDoctors.length > 0 ? (
            <div className="doctor-list">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="doctor-card">
                  <h4>{doc.nama}</h4>
                  <p className="specialization">{doc.spesialis}</p>
                  <div className="contact-info">
                    <p className="phone">Telp: {doc.nomor_telepon || '-'}</p>
                    <p className="address">{doc.alamat || '-'}</p>
                  </div>
                  {currentUser?.role === 'pasien' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = `#/patient/examination-request`}
                    >
                      Buat Janji
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Tidak ada dokter yang sesuai kriteria.</p>
          )}
        </div>
      </div>

      <div className="info-section">
        <h3>Panduan Pemilihan Obat & Dokter</h3>
        <ul>
          <li>Konsultasikan dengan dokter sebelum menggunakan obat-obatan</li>
          <li>Setiap obat memiliki indikasi dan efek samping yang berbeda</li>
          <li>Dokter spesialis memiliki keahlian dalam bidang tertentu</li>
          <li>Gunakan filter spesialisasi untuk menemukan dokter yang sesuai dengan keluhan Anda</li>
          <li>Obat-obatan yang umum untuk spesialisasi akan ditampilkan ketika filter dipilih</li>
        </ul>
      </div>
    </div>
  );
};

export default MedicationDoctorMapping;