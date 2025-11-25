import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './ExaminationHistory.css';

const ExaminationHistory = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchExaminationHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  const fetchExaminationHistory = async () => {
    try {
      let url = '/pemeriksaan';

      // Jika user adalah pasien, ambil hanya pemeriksaan mereka sendiri
      if (currentUser?.role === 'pasien') {
        // Cari ID pasien terkait dengan user ini
        try {
          const patientResponse = await axios.get(`/pasien/user/${currentUser.id}`);
          if (patientResponse.data.success && patientResponse.data.data) {
            const patientId = patientResponse.data.data.id;
            url = `/pemeriksaan/pasien/${patientId}`;
          } else {
            throw new Error('Pasien terkait dengan user ini tidak ditemukan');
          }
        } catch (error) {
          throw new Error('Gagal mengambil ID pasien: ' + (error.response?.data?.message || error.message));
        }
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setExaminations(response.data.data);
      } else {
        throw new Error(response.data.message || 'Gagal mengambil data pemeriksaan');
      }
    } catch (err) {
      setError('Gagal mengambil riwayat pemeriksaan: ' + (err.response?.data?.message || err.message));
      console.error('Error saat mengambil riwayat pemeriksaan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter examinations berdasarkan pencarian dan tanggal
  const filteredExaminations = examinations.filter(exam => {
    // Filter berdasarkan pencarian
    const matchesSearch = !searchTerm ||
      exam.nama_pasien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.nama_dokter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  if (!isAuthenticated) {
    return (
      <div className="examination-history">
        <h2>Riwayat Pemeriksaan</h2>
        <div className="alert alert-warning">Silakan login terlebih dahulu untuk melihat riwayat pemeriksaan.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="examination-history">
        <h2>Riwayat Pemeriksaan</h2>
        <div className="loading">Memuat riwayat pemeriksaan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="examination-history">
        <h2>Riwayat Pemeriksaan</h2>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchExaminationHistory}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="examination-history">
      <div className="history-header">
        <h2>Riwayat Pemeriksaan</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Cari nama dokter, diagnosa..."
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
                <th>Nama Dokter</th>
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
                  <td>{examination.nama_dokter || '-'}</td>
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
                : currentUser?.role === 'pasien'
                  ? 'Anda belum memiliki riwayat pemeriksaan.'
                  : 'Belum ada data pemeriksaan yang tercatat.'}
            </p>
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

export default ExaminationHistory;