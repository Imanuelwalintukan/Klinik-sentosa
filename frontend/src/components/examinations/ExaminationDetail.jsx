import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ExaminationDetail.css';

const ExaminationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [examination, setExamination] = useState(null);
  const [prescription, setPrescription] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Ambil data pemeriksaan
        const examResponse = await axios.get(`/pemeriksaan/${id}`);
        setExamination(examResponse.data.data);

        // Ambil data resep yang terkait
        const resepResponse = await axios.get(`/resep/pemeriksaan/${id}`);
        setPrescription(resepResponse.data.data);

      } catch (err) {
        setError('Gagal mengambil detail data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    // Note: Deleting an examination should ideally also handle related prescriptions.
    // This might require a cascaded delete in the database or a more complex backend function.
    if (window.confirm('Apakah Anda yakin ingin menghapus pemeriksaan ini beserta resepnya?')) {
      try {
        await axios.delete(`/pemeriksaan/${id}`);
        alert('Pemeriksaan berhasil dihapus');
        navigate('/examinations');
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
          <Link to={`/prescriptions/new?examinationId=${id}`} className="btn btn-primary">
            + Tambah Resep
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate('/examinations')}>
            Kembali ke Daftar
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card info-card">
          <h3>Informasi Pemeriksaan</h3>
          {/* ... Detail rows ... */}
          <div className="detail-row">
            <div className="detail-label">Pasien:</div>
            <div className="detail-value">{examination.nama_pasien}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Dokter:</div>
            <div className="detail-value">{examination.nama_dokter}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Tanggal:</div>
            <div className="detail-value">
              {new Date(examination.tanggal_pemeriksaan).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="detail-card diagnosis-card">
          <h3>Hasil Pemeriksaan</h3>
          <div className="detail-group">
            <h4>Keluhan</h4>
            <p>{examination.keluhan || '-'}</p>
          </div>
          <div className="detail-group">
            <h4>Diagnosa</h4>
            <p>{examination.diagnosa || '-'}</p>
          </div>
          <div className="detail-group">
            <h4>Rekomendasi Pengobatan</h4>
            <p>{examination.rekomendasi_pengobatan || '-'}</p>
          </div>
        </div>

        <div className="detail-card prescription-card">
          <h3>Resep Obat</h3>
          {prescription.length > 0 ? (
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Obat</th>
                  <th>Jumlah</th>
                  <th>Aturan Pakai</th>
                </tr>
              </thead>
              <tbody>
                {prescription.map(item => (
                  <tr key={item.id}>
                    <td>{item.nama_obat}</td>
                    <td>{item.jumlah}</td>
                    <td>{item.aturan_pakai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Belum ada resep untuk pemeriksaan ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminationDetail;