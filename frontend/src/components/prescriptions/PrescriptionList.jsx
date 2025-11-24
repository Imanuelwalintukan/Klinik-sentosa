import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './Prescription.css'; // Asumsi file styling yang sama

const PrescriptionList = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Menunggu'); // 'Menunggu' or 'Selesai'
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      setLoading(true);
      axios.get('/pemeriksaan')
        .then(response => {
          setExaminations(response.data.data);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setError('Gagal mengambil data resep dari server.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const filteredExaminations = useMemo(() => {
    return examinations.filter(ex => ex.status_resep === activeTab);
  }, [examinations, activeTab]);

  const handleProcess = (pemeriksaanId) => {
    navigate(`/dispense/${pemeriksaanId}`);
  };

  if (loading) {
    return <div className="prescription-list-container"><h2>Memuat antrian resep...</h2></div>;
  }

  if (error) {
    return <div className="prescription-list-container alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="prescription-list-container">
      <div className="list-header">
        <h2>Antrian Resep</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'Menunggu' ? 'active' : ''}`} 
            onClick={() => setActiveTab('Menunggu')}
          >
            Menunggu
          </button>
          <button 
            className={`tab ${activeTab === 'Selesai' ? 'active' : ''}`}
            onClick={() => setActiveTab('Selesai')}
          >
            Selesai
          </button>
        </div>
      </div>

      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Tanggal</th>
            <th>Nama Pasien</th>
            <th>Nama Dokter</th>
            <th>Status Resep</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredExaminations.length > 0 ? (
            filteredExaminations.map((ex) => (
              <tr key={ex.id}>
                <td>{new Date(ex.tanggal_pemeriksaan).toLocaleString('id-ID')}</td>
                <td>{ex.nama_pasien}</td>
                <td>{ex.nama_dokter}</td>
                <td>
                  <span className={`status-badge ${ex.status_resep === 'Selesai' ? 'status-diperiksa' : 'status-belum'}`}>
                    {ex.status_resep}
                  </span>
                </td>
                <td>
                  {activeTab === 'Menunggu' ? (
                    <button onClick={() => handleProcess(ex.id)} className="btn btn-sm btn-success">
                      Proses Resep
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/examinations/${ex.id}`)} className="btn btn-sm btn-info">
                      Lihat Detail
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                Tidak ada resep dalam status '{activeTab}'.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrescriptionList;