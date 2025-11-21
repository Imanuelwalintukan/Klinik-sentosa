import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ExaminationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamination();
  }, [id]);

  const fetchExamination = async () => {
    try {
      const response = await axios.get(`/api/pemeriksaan/${id}`);
      setExamination(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data pemeriksaan');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pemeriksaan ini?')) {
      try {
        await axios.delete(`/api/pemeriksaan/${id}`);
        alert('Pemeriksaan berhasil dihapus');
        navigate('/examinations'); // Kembali ke daftar pemeriksaan
      } catch (err) {
        setError('Gagal menghapus pemeriksaan');
      }
    }
  };

  if (loading) return <div className="loading">Memuat data pemeriksaan...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!examination) return <div>Data pemeriksaan tidak ditemukan</div>;

  return (
    <div className="examination-detail">
      <div className="header">
        <h2>Detail Pemeriksaan</h2>
        <div className="actions">
          <button className="btn btn-info mr-2" onClick={() => navigate(`/examinations/${id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Hapus
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/examinations')}>
            Kembali
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h3>Informasi Pemeriksaan</h3>
          
          <div className="detail-row">
            <div className="detail-label">ID Pemeriksaan:</div>
            <div className="detail-value">{examination.id}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Nama Pasien:</div>
            <div className="detail-value">{examination.nama_pasien}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Nama Dokter:</div>
            <div className="detail-value">{examination.nama_dokter}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Tanggal Pemeriksaan:</div>
            <div className="detail-value">
              {examination.tanggal_pemeriksaan ? new Date(examination.tanggal_pemeriksaan).toLocaleString() : '-'}
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Keluhan:</div>
            <div className="detail-value">{examination.keluhan || '-'}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Diagnosa:</div>
            <div className="detail-value">{examination.diagnosa || '-'}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Rekomendasi Pengobatan:</div>
            <div className="detail-value">{examination.rekomendasi_pengobatan || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationDetail;