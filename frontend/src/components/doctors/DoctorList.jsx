import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchDoctors();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/dokter');
      setDoctors(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data dokter');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
      try {
        await axios.delete(`/dokter/${id}`);
        fetchDoctors(); // Refresh data
      } catch (err) {
        setError('Gagal menghapus dokter');
      }
    }
  };

  // Dapatkan spesialisasi unik untuk dropdown filter
  const uniqueSpecializations = [...new Set(doctors.map(doctor => doctor.spesialis))];

  const filteredDoctors = Array.isArray(doctors) ? doctors.filter(doctor =>
    (doctor.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.spesialis.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (specializationFilter === '' || doctor.spesialis === specializationFilter)
  ) : [];

  if (loading) return <div className="loading">Memuat data dokter...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-list">
      <div className="header">
        <h2>Daftar Dokter</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/doctors/new'}>
          Tambah Dokter
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'end' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Cari dokter berdasarkan nama atau spesialis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-select" style={{ flexShrink: 0, width: '250px' }}>
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="form-control"
          >
            <option value="">Semua Spesialisasi</option>
            {uniqueSpecializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Spesialis</th>
              <th>Nomor Telepon</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.id}</td>
                <td>{doctor.nama}</td>
                <td>{doctor.spesialis}</td>
                <td>{doctor.nomor_telepon}</td>
                <td>{doctor.alamat}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-info mr-2" 
                    onClick={() => window.location.href=`/doctors/${doctor.id}/edit`}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(doctor.id)}
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

export default DoctorList;