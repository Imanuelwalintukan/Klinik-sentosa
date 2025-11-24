import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const ExaminationList = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchExaminations();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchExaminations = async () => {
    try {
      const response = await axios.get('/pemeriksaan');
      setExaminations(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data pemeriksaan');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pemeriksaan ini?')) {
      try {
        await axios.delete(`/pemeriksaan/${id}`);
        fetchExaminations(); // Refresh data
      } catch (err) {
        setError('Gagal menghapus pemeriksaan');
      }
    }
  };

  const filteredExaminations = Array.isArray(examinations) ? examinations.filter(examination =>
    examination.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examination.nama_dokter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examination.diagnosa?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="loading">Memuat data pemeriksaan...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="examination-list">
      <div className="header">
        <h2>Daftar Pemeriksaan</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/examinations/new'}>
          Tambah Pemeriksaan
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Cari pemeriksaan berdasarkan nama pasien, dokter, atau diagnosa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pasien</th>
              <th>Nama Dokter</th>
              <th>Tanggal Pemeriksaan</th>
              <th>Diagnosa</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredExaminations.map((examination) => (
              <tr key={examination.id}>
                <td>{examination.id}</td>
                <td>{examination.nama_pasien}</td>
                <td>{examination.nama_dokter}</td>
                <td>{examination.tanggal_pemeriksaan ? new Date(examination.tanggal_pemeriksaan).toLocaleDateString() : '-'}</td>
                <td>{examination.diagnosa}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-info mr-2" 
                    onClick={() => window.location.href=`/examinations/${examination.id}/edit`}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(examination.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExaminationList;