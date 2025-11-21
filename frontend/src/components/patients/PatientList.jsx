import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/pasien');
      setPatients(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data pasien');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pasien ini?')) {
      try {
        await axios.delete(`/api/pasien/${id}`);
        fetchPatients(); // Refresh data
      } catch (err) {
        setError('Gagal menghapus pasien');
      }
    }
  };

  const filteredPatients = Array.isArray(patients) ? patients.filter(patient =>
    patient.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nomor_telepon.includes(searchTerm)
  ) : [];

  if (loading) return <div className="loading">Memuat data pasien...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="patient-list">
      <div className="header">
        <h2>Daftar Pasien</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/patients/new'}>
          Tambah Pasien
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Cari pasien berdasarkan nama atau nomor telepon..."
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
              <th>Nama</th>
              <th>Tanggal Lahir</th>
              <th>Jenis Kelamin</th>
              <th>Alamat</th>
              <th>Nomor Telepon</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.nama}</td>
                <td>{patient.tanggal_lahir ? new Date(patient.tanggal_lahir).toLocaleDateString() : '-'}</td>
                <td>{patient.jenis_kelamin}</td>
                <td>{patient.alamat}</td>
                <td>{patient.nomor_telepon}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-info mr-2" 
                    onClick={() => window.location.href=`/patients/${patient.id}/edit`}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(patient.id)}
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

export default PatientList;