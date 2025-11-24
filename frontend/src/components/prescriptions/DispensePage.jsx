import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './Prescription.css';

const DispensePage = () => {
  const { pemeriksaanId } = useParams();
  const navigate = useNavigate();

  const [examination, setExamination] = useState(null);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch examination details
        const examRes = await axios.get(`/pemeriksaan/${pemeriksaanId}`);
        setExamination(examRes.data.data);

        // Fetch prescription items
        const resepRes = await axios.get(`/resep/pemeriksaan/${pemeriksaanId}`);
        setPrescriptionItems(resepRes.data.data);

      } catch (err) {
        setError('Gagal mengambil data resep.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchData();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [pemeriksaanId, isAuthenticated]);

  const handleDispense = async () => {
    if (window.confirm('Apakah Anda yakin ingin menyelesaikan dan memberikan resep ini? Stok obat akan dikurangi.')) {
      setIsDispensing(true);
      setError(null);
      try {
        const response = await axios.post(`/resep/dispense/${pemeriksaanId}`);
        if (response.data.success) {
          alert('Resep berhasil diberikan!');
          navigate('/prescriptions'); // Kembali ke antrian resep
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal memberikan resep.');
      } finally {
        setIsDispensing(false);
      }
    }
  };

  if (loading) return <div className="dispense-page"><h2>Memuat...</h2></div>;
  if (error && !examination) return <div className="dispense-page alert alert-danger">{error}</div>;

  return (
    <div className="dispense-page">
      <h2>Proses Pemberian Resep</h2>
      
      {examination && (
        <div className="dispense-context">
          <p><strong>Pasien:</strong> {examination.nama_pasien}</p>
          <p><strong>Dokter:</strong> {examination.nama_dokter}</p>
          <p><strong>Tanggal:</strong> {new Date(examination.tanggal_pemeriksaan).toLocaleString('id-ID')}</p>
        </div>
      )}

      <h3>Obat yang akan Diberikan:</h3>
      {prescriptionItems.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Obat</th>
              <th>Jumlah</th>
              <th>Aturan Pakai</th>
            </tr>
          </thead>
          <tbody>
            {prescriptionItems.map(item => (
              <tr key={item.id}>
                <td>{item.nama_obat}</td>
                <td>{item.jumlah}</td>
                <td>{item.aturan_pakai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Tidak ada item obat dalam resep ini.</p>
      )}

      {error && <div className="alert alert-danger" style={{marginTop: '20px'}}>{error}</div>}

      <div className="dispense-actions">
        <button 
          onClick={handleDispense} 
          className="btn btn-success btn-lg" 
          disabled={isDispensing || prescriptionItems.length === 0 || examination?.status_resep === 'Selesai'}
        >
          {isDispensing ? 'Memproses...' : 'Konfirmasi & Berikan Obat'}
        </button>
        <button onClick={() => navigate('/prescriptions')} className="btn btn-secondary">
          Kembali ke Antrian
        </button>
      </div>

       {examination?.status_resep === 'Selesai' && (
        <div className="alert alert-info" style={{marginTop: '20px'}}>
            Resep ini sudah pernah diberikan sebelumnya.
        </div>
      )}

    </div>
  );
};

export default DispensePage;
