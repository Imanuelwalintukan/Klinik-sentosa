// AppointmentScheduler.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    id_pasien: '',
    id_dokter: '',
    tanggal_janji: '',
    waktu_janji: '',
    keluhan: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Dalam implementasi nyata, ini akan memanggil API untuk jadwal
      // Untuk sekarang, kita gunakan data dummy
      const dummyAppointments = [
        {
          id: 1,
          nama_pasien: 'Budi Santoso',
          nama_dokter: 'Dr. Andi',
          tanggal_janji: '2023-06-15',
          waktu_janji: '09:00',
          keluhan: 'Sakit kepala',
          status: 'Terjadwal'
        },
        {
          id: 2,
          nama_pasien: 'Siti Nurhaliza',
          nama_dokter: 'Dr. Sari',
          tanggal_janji: '2023-06-15',
          waktu_janji: '10:30',
          keluhan: 'Demam',
          status: 'Terjadwal'
        }
      ];
      setAppointments(dummyAppointments);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data jadwal');
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/dokter');
      setDoctors(response.data.data);
    } catch (err) {
      console.error('Gagal mengambil data dokter');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/pasien');
      setPatients(response.data.data);
    } catch (err) {
      console.error('Gagal mengambil data pasien');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Dalam implementasi nyata, ini akan memanggil API untuk membuat jadwal
      const newAppointment = {
        id: appointments.length + 1,
        ...formData,
        nama_pasien: patients.find(p => p.id === parseInt(formData.id_pasien))?.nama || 'Pasien',
        nama_dokter: doctors.find(d => d.id === parseInt(formData.id_dokter))?.nama || 'Dokter',
        status: 'Terjadwal'
      };
      
      setAppointments([...appointments, newAppointment]);
      setFormData({
        id_pasien: '',
        id_dokter: '',
        tanggal_janji: '',
        waktu_janji: '',
        keluhan: ''
      });
      setShowForm(false);
      alert('Jadwal berhasil dibuat');
    } catch (err) {
      setError('Gagal membuat jadwal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan jadwal ini?')) {
      setAppointments(appointments.filter(app => app.id !== id));
    }
  };

  if (loading) return <div className="loading">Memuat jadwal...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="appointment-scheduler">
      <div className="header">
        <h2>Sistem Penjadwalan Appointment</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : 'Buat Jadwal Baru'}
        </button>
      </div>

      {showForm && (
        <div className="appointment-form">
          <h3>Buat Jadwal Baru</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id_pasien">Pasien:</label>
                <select
                  id="id_pasien"
                  name="id_pasien"
                  value={formData.id_pasien}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Pilih Pasien</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.nama}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="id_dokter">Dokter:</label>
                <select
                  id="id_dokter"
                  name="id_dokter"
                  value={formData.id_dokter}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Pilih Dokter</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.nama} ({doctor.spesialis})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tanggal_janji">Tanggal Janji:</label>
                <input
                  type="date"
                  id="tanggal_janji"
                  name="tanggal_janji"
                  value={formData.tanggal_janji}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="waktu_janji">Waktu Janji:</label>
                <input
                  type="time"
                  id="waktu_janji"
                  name="waktu_janji"
                  value={formData.waktu_janji}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="keluhan">Keluhan:</label>
              <textarea
                id="keluhan"
                name="keluhan"
                value={formData.keluhan}
                onChange={handleChange}
                className="form-control"
                rows="2"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Buat Jadwal</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="appointment-list">
        <h3>Daftar Jadwal</h3>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pasien</th>
                <th>Nama Dokter</th>
                <th>Tanggal & Waktu</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.nama_pasien}</td>
                  <td>{appointment.nama_dokter}</td>
                  <td>{appointment.tanggal_janji} {appointment.waktu_janji}</td>
                  <td>{appointment.keluhan}</td>
                  <td>
                    <span className={`status-badge ${appointment.status === 'Terjadwal' ? 'status-scheduled' : 'status-completed'}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(appointment.id)}
                    >
                      Batal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;