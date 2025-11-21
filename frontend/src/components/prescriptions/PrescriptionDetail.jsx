import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const response = await axios.get(`/api/resep/${id}`);
      setPrescription(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data resep');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus resep ini?')) {
      try {
        await axios.delete(`/api/resep/${id}`);
        alert('Resep berhasil dihapus');
        navigate('/prescriptions'); // Kembali ke daftar resep
      } catch (err) {
        setError('Gagal menghapus resep');
      }
    }
  };

  if (loading) return <div className="loading">Memuat data resep...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!prescription) return <div>Data resep tidak ditemukan</div>;

  return (
    <div className="prescription-detail">
      <div className="header">
        <h2>Detail Resep</h2>
        <div className="actions">
          <button className="btn btn-info mr-2" onClick={() => navigate(`/prescriptions/${id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Hapus
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/prescriptions')}>
            Kembali
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h3>Informasi Resep</h3>
          
          <div className="detail-row">
            <div className="detail-label">ID Resep:</div>
            <div className="detail-value">{prescription.id}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Nama Pasien:</div>
            <div className="detail-value">{prescription.nama_pasien}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Nama Obat:</div>
            <div className="detail-value">{prescription.nama_obat}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Tanggal Pemeriksaan:</div>
            <div className="detail-value">
              {prescription.tanggal_pemeriksaan ? new Date(prescription.tanggal_pemeriksaan).toLocaleDateString() : '-'}
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Jumlah:</div>
            <div className="detail-value">{prescription.jumlah}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Aturan Pakai:</div>
            <div className="detail-value">{prescription.aturan_pakai}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail;