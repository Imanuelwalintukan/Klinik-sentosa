import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import './Nurse.css';

const VitalSignsCheck = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id_pasien: patientId || '',
    id_perawat: '', // Akan diisi oleh ID perawat yang login
    berat_badan: '',
    tinggi_badan: '',
    tensi_sistolik: '',
    tensi_diastolik: '',
    suhu_tubuh: '',
    denyut_nadi: '',
    saturasi_oksigen: '',
    riwayat_singkat: ''
  });

  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch pasien dan perawat saat komponen dimuat
  useEffect(() => {
    fetchPatients();
    fetchNurses();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/pasien');
      setPatients(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data pasien');
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await axios.get('/perawat');
      setNurses(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data perawat');
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
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/pemeriksaan-awal', formData);

      setSuccess(true);
      alert('Pemeriksaan awal berhasil disimpan');
      navigate('/nurses'); // Kembali ke dashboard perawat
    } catch (err) {
      setError('Gagal menyimpan pemeriksaan awal: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vital-signs-check">
      <h2>Pemeriksaan Awal oleh Perawat</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {success ? (
        <div className="alert alert-success">
          <p>Pemeriksaan awal berhasil disimpan.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/nurses/patient-checks')}
          >
            Lihat Semua Pemeriksaan
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="vital-signs-form">
          {!patientId && (
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
          )}

          <div className="form-group">
            <label htmlFor="id_perawat">Perawat:</label>
            <select
              id="id_perawat"
              name="id_perawat"
              value={formData.id_perawat}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Pilih Perawat Anda</option>
              {nurses.map(nurse => (
                <option key={nurse.id} value={nurse.id}>{nurse.nama}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="berat_badan">Berat Badan:</label>
              <input
                type="number"
                id="berat_badan"
                name="berat_badan"
                value={formData.berat_badan}
                onChange={handleChange}
                className="form-control"
                placeholder="kg"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tinggi_badan">Tinggi Badan:</label>
              <input
                type="number"
                id="tinggi_badan"
                name="tinggi_badan"
                value={formData.tinggi_badan}
                onChange={handleChange}
                className="form-control"
                placeholder="cm"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tensi_sistolik">Tekanan Darah (Sistolik):</label>
              <input
                type="number"
                id="tensi_sistolik"
                name="tensi_sistolik"
                value={formData.tensi_sistolik}
                onChange={handleChange}
                className="form-control"
                placeholder="mmHg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tensi_diastolik">Tekanan Darah (Diastolik):</label>
              <input
                type="number"
                id="tensi_diastolik"
                name="tensi_diastolik"
                value={formData.tensi_diastolik}
                onChange={handleChange}
                className="form-control"
                placeholder="mmHg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="suhu_tubuh">Suhu Tubuh:</label>
              <input
                type="number"
                id="suhu_tubuh"
                name="suhu_tubuh"
                value={formData.suhu_tubuh}
                onChange={handleChange}
                className="form-control"
                placeholder="°C"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="denyut_nadi">Denyut Nadi:</label>
              <input
                type="number"
                id="denyut_nadi"
                name="denyut_nadi"
                value={formData.denyut_nadi}
                onChange={handleChange}
                className="form-control"
                placeholder="bpm"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="saturasi_oksigen">Saturasi Oksigen:</label>
            <input
              type="number"
              id="saturasi_oksigen"
              name="saturasi_oksigen"
              value={formData.saturasi_oksigen}
              onChange={handleChange}
              className="form-control"
              placeholder="%"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="riwayat_singkat">Riwayat Singkat/Keluhan Awal:</label>
            <textarea
              id="riwayat_singkat"
              name="riwayat_singkat"
              value={formData.riwayat_singkat}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Catat gejala awal atau keluhan pasien..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Pemeriksaan Awal'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/nurses')}
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VitalSignsCheck;