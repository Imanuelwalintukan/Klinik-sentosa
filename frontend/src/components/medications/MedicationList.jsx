import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

const MedicationList = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('/obat');
      setMedications(Array.isArray(response.data.data) ? response.data.data : []);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data obat');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
      try {
        await axios.delete(`/obat/${id}`);
        fetchMedications(); // Refresh data
      } catch (err) {
        setError('Gagal menghapus obat');
      }
    }
  };

  const filteredMedications = medications.filter(medication =>
    medication.nama_obat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Memuat data obat...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="medication-list">
      <div className="header">
        <h2>Daftar Obat</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/medications/new'}>
          Tambah Obat
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Cari obat berdasarkan nama atau deskripsi..."
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
              <th>Nama Obat</th>
              <th>Deskripsi</th>
              <th>Stok</th>
              <th>Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedications.map((medication) => (
              <tr key={medication.id}>
                <td>{medication.id}</td>
                <td>{medication.nama_obat}</td>
                <td>{medication.deskripsi}</td>
                <td>{medication.stok}</td>
                <td>{medication.harga ? `Rp ${medication.harga.toLocaleString()}` : '-'}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-info mr-2" 
                    onClick={() => window.location.href=`/medications/${medication.id}/edit`}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(medication.id)}
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

export default MedicationList;