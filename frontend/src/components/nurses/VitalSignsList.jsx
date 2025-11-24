import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import './Nurse.css';

const VitalSignsList = () => {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVitalSignsChecks();
  }, []);

  const fetchVitalSignsChecks = async () => {
    try {
      const response = await axios.get('/pemeriksaan-awal');
      setChecks(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data pemeriksaan awal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pemeriksaan awal ini?')) {
      try {
        await axios.delete(`/pemeriksaan-awal/${id}`);
        fetchVitalSignsChecks(); // Refresh the list
      } catch (err) {
        setError('Gagal menghapus pemeriksaan awal');
      }
    }
  };

  if (loading) return <div className="loading">Memuat data pemeriksaan awal...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="vital-signs-list">
      <div className="header">
        <h2>Pemeriksaan Awal oleh Perawat</h2>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.hash = '#/nurses/vital-signs-check/new'}
        >
          Tambah Pemeriksaan Awal
        </button>
      </div>
      
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pasien</th>
            <th>Perawat</th>
            <th>Berat Badan</th>
            <th>Tinggi Badan</th>
            <th>Tensi</th>
            <th>Suhu</th>
            <th>Denyut Nadi</th>
            <th>Saturasi O2</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id}>
              <td>{check.id}</td>
              <td>{check.nama_pasien || 'Tidak diketahui'}</td>
              <td>{check.nama_perawat || 'Tidak diketahui'}</td>
              <td>{check.berat_badan ? `${check.berat_badan} kg` : '-'}</td>
              <td>{check.tinggi_badan ? `${check.tinggi_badan} cm` : '-'}</td>
              <td>{check.tensi_sistolik && check.tensi_diastolik ? 
                `${check.tensi_sistolik}/${check.tensi_diastolik} mmHg` : '-'}</td>
              <td>{check.suhu_tubuh ? `${check.suhu_tubuh} °C` : '-'}</td>
              <td>{check.denyut_nadi ? `${check.denyut_nadi} bpm` : '-'}</td>
              <td>{check.saturasi_oksigen ? `${check.saturasi_oksigen}%` : '-'}</td>
              <td>{new Date(check.tanggal_pemeriksaan).toLocaleString('id-ID')}</td>
              <td>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(check.id)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VitalSignsList;