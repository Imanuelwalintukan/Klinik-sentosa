import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import './Nurse.css';

const NurseList = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      const response = await axios.get('/perawat');
      setNurses(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data perawat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus perawat ini?')) {
      try {
        await axios.delete(`/perawat/${id}`);
        fetchNurses(); // Refresh the list
      } catch (err) {
        setError('Gagal menghapus perawat');
      }
    }
  };

  if (loading) return <div className="loading">Memuat data perawat...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="nurse-list">
      <div className="header">
        <h2>Daftar Perawat</h2>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.hash = '#/nurses/new'}
        >
          Tambah Perawat Baru
        </button>
      </div>
      
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Nomor Telepon</th>
            <th>Alamat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {nurses.map((nurse) => (
            <tr key={nurse.id}>
              <td>{nurse.id}</td>
              <td>{nurse.nama}</td>
              <td>{nurse.nomor_telepon || '-'}</td>
              <td>{nurse.alamat || '-'}</td>
              <td>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => window.location.hash = `#/nurses/${nurse.id}/edit`}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(nurse.id)}
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

export default NurseList;