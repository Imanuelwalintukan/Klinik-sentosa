import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const PendingPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchPendingPrescriptions();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchPendingPrescriptions = async () => {
    try {
      // Kita akan mendapatkan semua pemeriksaan dan memfilter yang belum di-dispense
      const response = await axios.get('/pemeriksaan');
      const examinations = response.data.data;
      
      // Filter hanya pemeriksaan yang memiliki resep dan status belum 'Selesai'
      const pendingExaminations = examinations.filter(exam => 
        exam.status_resep !== 'Selesai' && exam.status_resep !== 'Batal'
      );
      
      setPrescriptions(pendingExaminations);
    } catch (err) {
      setError('Gagal mengambil data resep menunggu');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menandai resep sebagai selesai (dispensing)
  const handleDispense = async (examinationId) => {
    if (window.confirm('Apakah Anda yakin ingin menandai resep ini sebagai selesai?')) {
      try {
        // Panggil API untuk dispensing resep
        await axios.post(`/resep/dispense/${examinationId}`);
        
        // Refresh daftar resep
        fetchPendingPrescriptions();
        alert('Resep berhasil diberikan');
      } catch (err) {
        setError(`Gagal menyelesaikan resep: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) return <div className="loading">Memuat resep menunggu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pending-prescriptions">
      <h2>Resep Menunggu</h2>
      
      {prescriptions.length === 0 ? (
        <div className="no-prescriptions">
          <p>Tidak ada resep menunggu saat ini.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID Pemeriksaan</th>
              <th>Pasien</th>
              <th>Dokter</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.id}</td>
                <td>{exam.nama_pasien}</td>
                <td>{exam.nama_dokter}</td>
                <td>{new Date(exam.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</td>
                <td>
                  <span className={`status status-${exam.status_resep?.toLowerCase() || 'pending'}`}>
                    {exam.status_resep || 'Menunggu'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleDispense(exam.id)}
                  >
                    Berikan Obat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingPrescriptions;