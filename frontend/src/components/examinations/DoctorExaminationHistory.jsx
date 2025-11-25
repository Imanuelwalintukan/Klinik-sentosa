import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Gunakan axios biasa untuk menghindari konflik baseURL
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './ExaminationHistory.css';

const DoctorExaminationHistory = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    console.log('DoctorExaminationHistory - useEffect dijalankan');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('currentUser:', currentUser);
    console.log('role:', currentUser?.role);

    if (isAuthenticated && currentUser && currentUser.role === 'dokter') {
      console.log('Memanggil fetchExaminationHistory...');
      fetchExaminationHistory();
    } else {
      console.log('Tidak memenuhi syarat untuk mengambil data, setLoading(false)');
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  const fetchExaminationHistory = async () => {
    try {
      console.log('fetchExaminationHistory dipanggil');
      // Ambil pemeriksaan berdasarkan dokter yang login
      // Gunakan URL lengkap untuk menghindari konflik dengan baseURL axiosConfig
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/pemeriksaan/dokter', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response dari server:', response);

      if (response.data.success) {
        console.log('Jumlah data yang diterima:', response.data.data?.length || 0);
        setExaminations(response.data.data);
      } else {
        console.log('Response success false:', response.data);
        throw new Error(response.data.message || 'Gagal mengambil data pemeriksaan');
      }
    } catch (err) {
      console.error('Error secara detail:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError('Gagal mengambil riwayat pemeriksaan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter examinations berdasarkan pencarian dan tanggal
  const filteredExaminations = examinations.filter(exam => {
    // Filter berdasarkan pencarian
    const matchesSearch = !searchTerm ||
      exam.nama_pasien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.diagnosa?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter berdasarkan rentang tanggal
    const examDate = new Date(exam.tanggal_pemeriksaan);
    const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
    const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

    const matchesDate = (!startDate || examDate >= startDate) && (!endDate || examDate <= endDate);

    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Menunggu': return '#FFA726'; // Orange
      case 'Dalam Proses': return '#29B6F6'; // Blue
      case 'Selesai': return '#66BB6A'; // Green
      case 'Dibatalkan': return '#EF5350'; // Red
      default: return '#9E9E9E'; // Grey
    }
  };

  const handleViewDetails = (examinationId) => {
    navigate(`/examinations/${examinationId}`);
  };

  if (!isAuthenticated || currentUser?.role !== 'dokter') {
    return (
      <div className="examination-history">
        <h2>Riwayat Pemeriksaan Dokter</h2>
        <div className="alert alert-warning">Silakan login sebagai dokter untuk melihat riwayat pemeriksaan.</div>
      </div>
    );
  }

  console.log('Status rendering:');
  console.log('loading:', loading);
  console.log('error:', error);
  console.log('examinations.length:', examinations.length);
  console.log('filteredExaminations.length:', filteredExaminations.length);

  if (loading) {
    return (
      <div className="examination-history">
        <h2>Riwayat Pemeriksaan Dokter</h2>
        <div className="loading">Memuat riwayat pemeriksaan...</div>
        <p>Harap tunggu, sedang mengambil data dari server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="examination-history">
        <h2>Riwayat Pemeriksaan Dokter</h2>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchExaminationHistory}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="examination-history">
      <div className="history-header">
        <h2>Riwayat Pemeriksaan Dokter</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Cari nama pasien, diagnosa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <input
            type="date"
            placeholder="Tanggal awal"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter(prev => ({...prev, startDate: e.target.value}))}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <input
            type="date"
            placeholder="Tanggal akhir"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter(prev => ({...prev, endDate: e.target.value}))}
            className="filter-input"
          />
        </div>
      </div>

      <div className="history-table-container">
        {filteredExaminations.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th>ID Pemeriksaan</th>
                <th>Tanggal</th>
                <th>Nama Pasien</th>
                <th>Diagnosa</th>
                <th>Rekomendasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredExaminations.map((examination) => (
                <tr key={examination.id}>
                  <td>#{examination.id?.toString().padStart(4, '0')}</td>
                  <td>{new Date(examination.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</td>
                  <td>{examination.nama_pasien || '-'}</td>
                  <td>{examination.diagnosa || '-'}</td>
                  <td>{examination.rekomendasi_pengobatan || '-'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(examination.status_resep || examination.status_pemeriksaan) }}
                    >
                      {examination.status_resep || examination.status_pemeriksaan || 'Menunggu'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewDetails(examination.id)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h3>{searchTerm || dateFilter.startDate || dateFilter.endDate ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat pemeriksaan'}</h3>
            <p>
              {searchTerm || dateFilter.startDate || dateFilter.endDate
                ? 'Coba kata kunci atau tanggal lain.'
                : 'Anda belum memiliki riwayat pemeriksaan.'}
            </p>
            {examinations.length === 0 && (
              <p className="debug-info">
                Debug: Tidak ada data pemeriksaan sama sekali untuk dokter ini
              </p>
            )}
            {examinations.length > 0 && filteredExaminations.length === 0 && (
              <p className="debug-info">
                Debug: Ada {examinations.length} data pemeriksaan, tetapi setelah filter menampilkan 0 hasil
              </p>
            )}
          </div>
        )}
      </div>

      {filteredExaminations.length > 0 && (
        <div className="pagination-info">
          <p>Menampilkan {filteredExaminations.length} dari {examinations.length} pemeriksaan</p>
        </div>
      )}
    </div>
  );
};

export default DoctorExaminationHistory;