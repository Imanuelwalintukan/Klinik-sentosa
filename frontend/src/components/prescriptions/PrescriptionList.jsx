import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('/api/resep');
      setPrescriptions(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data resep');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus resep ini?')) {
      try {
        await axios.delete(`/api/resep/${id}`);
        fetchPrescriptions(); // Refresh data
      } catch (err) {
        setError('Gagal menghapus resep');
      }
    }
  };

  const filteredPrescriptions = Array.isArray(prescriptions) ? prescriptions.filter(prescription =>
    prescription.nama_pasien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.nama_obat?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="loading">Memuat data resep...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="prescription-list">
      <div className="header">
        <h2>Daftar Resep</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/prescriptions/new'}>
          Tambah Resep
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Cari resep berdasarkan nama pasien atau nama obat..."
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
              <th>Nama Obat</th>
              <th>Tanggal Pemeriksaan</th>
              <th>Jumlah</th>
              <th>Aturan Pakai</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.map((prescription) => (
              <tr key={prescription.id}>
                <td>{prescription.id}</td>
                <td>{prescription.nama_pasien}</td>
                <td>{prescription.nama_obat}</td>
                <td>{prescription.tanggal_pemeriksaan ? new Date(prescription.tanggal_pemeriksaan).toLocaleDateString() : '-'}</td>
                <td>{prescription.jumlah}</td>
                <td>{prescription.aturan_pakai}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-info mr-2" 
                    onClick={() => window.location.href=`/prescriptions/${prescription.id}/edit`}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(prescription.id)}
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

export default PrescriptionList;