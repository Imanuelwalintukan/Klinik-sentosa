import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider';
import './ExaminationRequestForm.css';

const ExaminationRequestForm = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Ambil daftar dokter
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/dokter');
        setDoctors(response.data.data || []);
      } catch (err) {
        setError('Gagal mengambil daftar dokter');
      }
    };

    fetchDoctors();
  }, []);

  // Set dokter yang dipilih berdasarkan parameter URL
  useEffect(() => {
    const doctorIdFromUrl = searchParams.get('doctorId');
    if (doctorIdFromUrl && doctors.length > 0) {
      // Periksa apakah dokter dengan ID tersebut ada dalam daftar
      const doctorExists = doctors.find(doctor => doctor.id == doctorIdFromUrl);
      if (doctorExists) {
        setSelectedDoctor(parseInt(doctorIdFromUrl));
      } else {
        setError('Dokter yang Anda pilih tidak ditemukan');
      }
    }
  }, [doctors, searchParams]);

  // Filter dokter berdasarkan spesialisasi dan pastikan dokter yang dipilih dari URL tetap tersedia
  const filteredDoctors = doctors.filter(doctor => {
    // Jika tidak ada filter spesialisasi, tampilkan semua dokter
    if (!specializationFilter) return true;
    // Jika ada filter spesialisasi, tampilkan dokter sesuai spesialisasi
    const matchesSpecialization = doctor.spesialis.toLowerCase().includes(specializationFilter.toLowerCase());

    // Jika dokter ini adalah yang dipilih dari URL, tetap tampilkan meskipun tidak cocok dengan filter spesialisasi
    const isDoctorFromUrl = searchParams.get('doctorId') && parseInt(searchParams.get('doctorId')) === doctor.id;

    return matchesSpecialization || isDoctorFromUrl;
  });

  // Dapatkan nama dokter yang dipilih dari URL
  const getSelectedDoctorName = () => {
    if (selectedDoctor) {
      const doctor = doctors.find(d => d.id === parseInt(selectedDoctor));
      return doctor ? doctor.nama : '';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !symptoms) {
      setError('Silakan pilih dokter dan masukkan keluhan Anda');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kirim permintaan pemeriksaan
      const examinationData = {
        id_pasien: currentUser.id,
        id_dokter: selectedDoctor,
        tanggal_pemeriksaan: new Date().toISOString(),
        keluhan_utama: symptoms,
        status: 'menunggu'
      };

      await axios.post('/pemeriksaan', examinationData);
      setSuccess(true);
      setSymptoms('');
      alert('Permintaan pemeriksaan berhasil dikirim ke dokter');
      // Redirect ke halaman yang menunjukkan obat-obatan yang mungkin direkomendasikan
      setTimeout(() => {
        window.location.href = '#/medication-doctor';
      }, 1500);
    } catch (err) {
      setError('Gagal mengirim permintaan pemeriksaan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="error">Silakan login terlebih dahulu</div>;
  }

  // Dapatkan spesialisasi unik
  const specializations = [...new Set(doctors.map(doctor => doctor.spesialis))];

  return (
    <div className="examination-request-form">
      <h2>Buat Permintaan Pemeriksaan</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Permintaan pemeriksaan berhasil dikirim!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="specializationFilter">Pilih Spesialisasi:</label>
          <select
            id="specializationFilter"
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="form-control"
          >
            <option value="">Pilih semua spesialisasi</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="doctor">Pilih Dokter:</label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="form-control"
            required
          >
            <option value="">Pilih dokter</option>
            {filteredDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.nama} - {doctor.spesialis}
              </option>
            ))}
            {/* Jika dokter dari URL tidak muncul di hasil filter, tambahkan sebagai opsi tersembunyi */}
            {searchParams.get('doctorId') && !filteredDoctors.some(d => d.id == searchParams.get('doctorId')) && (
              <option value={searchParams.get('doctorId')} style={{display: 'none'}}>
                {doctors.find(d => d.id == searchParams.get('doctorId'))?.nama || 'Dokter tidak ditemukan'} - (Dipilih dari URL)
              </option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Keluhan Anda:</label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="form-control"
            rows="5"
            placeholder="Jelaskan keluhan Anda secara rinci..."
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.location.href = '/patient'}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExaminationRequestForm;