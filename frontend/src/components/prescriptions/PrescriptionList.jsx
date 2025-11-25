import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './Prescription.css';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'dispensed'
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ambil semua resep
      const response = await axios.get('/resep');
      if (response.data.success) {
        setPrescriptions(response.data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Gagal mengambil data resep dari server: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions berdasarkan status
  const filteredPrescriptions = useMemo(() => {
    let result = prescriptions;
    
    // Filter berdasarkan status
    if (activeTab === 'pending') {
      result = result.filter(p => p.status !== 'telah_diberikan');
    } else if (activeTab === 'dispensed') {
      result = result.filter(p => p.status === 'telah_diberikan');
    }
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nama_pasien.toLowerCase().includes(term) ||
        p.nama_dokter.toLowerCase().includes(term) ||
        p.items.some(item => item.nama_obat.toLowerCase().includes(term))
      );
    }

    return result;
  }, [prescriptions, activeTab, searchTerm]);

  const handleProcess = (pemeriksaanId) => {
    navigate(`/dispense/${pemeriksaanId}`);
  };

  if (loading) {
    return (
      <div className="prescription-list-container">
        <h2 className="page-title">Manajemen Resep</h2>
        <div className="loading">Memuat antrian resep...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prescription-list-container">
        <h2 className="page-title">Manajemen Resep</h2>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchData}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="prescription-list-container">
      <div className="list-header">
        <h2 className="page-title">Manajemen Resep</h2>
        
        <div className="controls">
          <input
            type="text"
            placeholder="Cari pasien, dokter, atau obat..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Resep Belum Diambil <span className="badge">{prescriptions.filter(p => p.status !== 'telah_diberikan').length}</span>
            </button>
            <button
              className={`tab ${activeTab === 'dispensed' ? 'active' : ''}`}
              onClick={() => setActiveTab('dispensed')}
            >
              Resep Sudah Diambil <span className="badge">{prescriptions.filter(p => p.status === 'telah_diberikan').length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>No Resep</th>
              <th>Tanggal</th>
              <th>Nama Pasien</th>
              <th>Nama Dokter</th>
              <th>Daftar Obat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>#RS-{prescription.id.toString().padStart(4, '0')}</td>
                  <td>{new Date(prescription.created_at || prescription.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</td>
                  <td>{prescription.nama_pasien}</td>
                  <td>{prescription.nama_dokter}</td>
                  <td>
                    <div className="medication-list">
                      {prescription.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="med-item">
                          • {item.nama_obat} (Jumlah: {item.jumlah}, Aturan: {item.aturan_pakai})
                        </div>
                      ))}
                      {prescription.items && prescription.items.length > 3 && (
                        <div className="more-items">+{prescription.items.length - 3} obat lagi</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${prescription.status === 'telah_diberikan' ? 'status-dispensed' : 'status-pending'}`}>
                      {prescription.status === 'telah_diberikan' ? 'Telah Diberikan' : 'Belum Diberikan'}
                    </span>
                  </td>
                  <td>
                    {prescription.status !== 'telah_diberikan' && currentUser?.role === 'apoteker' ? (
                      <button 
                        onClick={() => handleProcess(prescription.pemeriksaan_id || prescription.id)} 
                        className="btn btn-sm btn-success"
                      >
                        Proses Resep
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/prescriptions/${prescription.id}`)} 
                        className="btn btn-sm btn-info"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="empty-state">
                    <h4>{searchTerm ? 'Tidak ada hasil pencarian' : activeTab === 'pending' ? 'Tidak ada resep menunggu' : 'Tidak ada resep yang sudah diberikan'}</h4>
                    <p>{searchTerm ? 'Coba kata kunci lain' : activeTab === 'pending' ? 'Semua resep telah diproses' : 'Tidak ditemukan resep dengan status tersebut'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentUser?.role === 'apoteker' && (
        <div className="actions-footer">
          <button 
            className="btn btn-refresh"
            onClick={fetchData}
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;