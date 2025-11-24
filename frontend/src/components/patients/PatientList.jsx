import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './Patient.css'; // Asumsi file styling yang sama

const PatientList = ({ onAdd, onEdit, onExamine }) => {
  const [pasien, setPasien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth(); // Dapatkan status autentikasi dan informasi pengguna

  const fetchPasien = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Mengirim permintaan ke endpoint /pasien...");
      console.log("Token dalam localStorage:", localStorage.getItem('user') ? 'ada' : 'tidak ada');
      const response = await axios.get('/pasien');
      console.log("Respon diterima:", response);
      if (response.data.success) {
        setPasien(response.data.data);
      } else {
        throw new Error(response.data.message || 'Gagal mengambil data pasien.');
      }
    } catch (err) {
      console.error("Error lengkap:", err);
      console.error("Error response:", err.response);
      console.error("Status error:", err.response?.status);
      console.error("Error message:", err.message);
      console.error("Error data:", err.response?.data);
      if (err.response?.status === 401) {
        setError('Akses ditolak: Anda belum login atau sesi Anda telah habis. Silakan login kembali.');
      } else if (err.response?.status === 403) {
        setError('Akses ditolak: Anda tidak memiliki izin untuk mengakses data ini.');
      } else {
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengambil data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchPasien();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [fetchPasien, isAuthenticated]);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
      try {
        await axios.delete(`/pasien/${id}`);
        // Refresh data setelah berhasil hapus
        fetchPasien();
      } catch (err) {
        console.error("Delete error:", err);
        alert('Gagal menghapus data pasien.');
      }
    }
  };

  if (loading) {
    return <div className="patient-list-container"><h2>Memuat data pasien...</h2></div>;
  }

  if (error) {
    return <div className="patient-list-container alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Daftar Pasien</h2>
        <button onClick={onAdd} className="btn btn-primary">
          + Tambah Pasien Baru
        </button>
      </div>

      {pasien.length === 0 ? (
        <p>Belum ada data pasien.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="thead-dark">
            <tr>
              <th>Nama</th>
              <th>Nomor Telepon</th>
              <th>Alamat</th>
              <th>Status</th>
              <th>EMR</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pasien.map((p) => (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>{p.nomor_telepon}</td>
                <td>{p.alamat}</td>
                <td>
                  <span
                    className={`status-badge ${p.status_pemeriksaan === 'Sudah Diperiksa' ? 'status-diperiksa' : 'status-belum'}`}
                  >
                    {p.status_pemeriksaan}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/emr/pasien/${p.id}`)}
                    className="btn btn-sm btn-info"
                    title="Lihat Rekam Medis"
                  >
                    EMR
                  </button>
                </td>
                <td>
                  {/* Hanya tampilkan tombol "Periksa" jika bukan admin */}
                  {currentUser?.role !== 'admin' && (
                    <button onClick={() => onExamine(p.id)} className="btn btn-sm btn-success">
                      Periksa
                    </button>
                  )}
                  <button onClick={() => onEdit(p.id)} className="btn btn-sm btn-warning" style={{ marginLeft: '5px' }}>
                    Edit
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

export default PatientList;
