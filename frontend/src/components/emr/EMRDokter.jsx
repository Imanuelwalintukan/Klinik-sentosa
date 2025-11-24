import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './EMR.css';

const EMRDokter = () => {
  const { id: pasienId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_pasien: pasienId,
    id_dokter: '', // Akan diisi otomatis dari session dokter
    tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
    riwayat_penyakit_keluarga: '',
    riwayat_pengobatan_sebelumnya: '',
    catatan_klinis: '',
    ringkasan_kondisi_pasien: ''
  });
  
  const [dokterOptions, setDokterOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchDokterOptions();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchDokterOptions = async () => {
    try {
      const response = await axios.get('/dokter');
      setDokterOptions(response.data.data);
      
      // Isi ID dokter otomatis jika hanya ada satu dokter atau dari session
      if (response.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          id_dokter: response.data.data[0].id
        }));
      }
    } catch (err) {
      setError('Gagal mengambil data dokter');
    } finally {
      setLoading(false);
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
      const response = await axios.post('/emr/rekam-medis', formData);
      alert('Rekam medis berhasil ditambahkan');
      
      // Redirect ke halaman detail EMR atau daftar EMR
      navigate(`/emr/pasien/${pasienId}`);
    } catch (err) {
      setError('Gagal menyimpan rekam medis: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Memuat...</div>;

  return (
    <div className="emr-dokter">
      <h2>Tambah Rekam Medis Baru</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="emr-form">
        <div className="form-row">
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
              {dokterOptions.map(dokter => (
                <option key={dokter.id} value={dokter.id}>
                  {dokter.nama} ({dokter.spesialis})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="tanggal_pemeriksaan">Tanggal Pemeriksaan:</label>
            <input
              type="date"
              id="tanggal_pemeriksaan"
              name="tanggal_pemeriksaan"
              value={formData.tanggal_pemeriksaan}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="riwayat_penyakit_keluarga">Riwayat Penyakit Keluarga:</label>
          <textarea
            id="riwayat_penyakit_keluarga"
            name="riwayat_penyakit_keluarga"
            value={formData.riwayat_penyakit_keluarga}
            onChange={handleChange}
            className="form-control"
            rows="4"
            placeholder="Contoh: Diabetes, Hipertensi, Jantung, dll"
          />
        </div>

        <div className="form-group">
          <label htmlFor="riwayat_pengobatan_sebelumnya">Riwayat Pengobatan Sebelumnya:</label>
          <textarea
            id="riwayat_pengobatan_sebelumnya"
            name="riwayat_pengobatan_sebelumnya"
            value={formData.riwayat_pengobatan_sebelumnya}
            onChange={handleChange}
            className="form-control"
            rows="4"
            placeholder="Obat-obatan yang pernah diminum sebelumnya"
          />
        </div>

        <div className="form-group">
          <label htmlFor="catatan_klinis">Catatan Klinis:</label>
          <textarea
            id="catatan_klinis"
            name="catatan_klinis"
            value={formData.catatan_klinis}
            onChange={handleChange}
            className="form-control"
            rows="5"
            placeholder="Catatan klinis hasil pemeriksaan dokter"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ringkasan_kondisi_pasien">Ringkasan Kondisi Pasien:</label>
          <textarea
            id="ringkasan_kondisi_pasien"
            name="ringkasan_kondisi_pasien"
            value={formData.ringkasan_kondisi_pasien}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Ringkasan kondisi pasien saat ini"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Rekam Medis'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/emr/pasien/${pasienId}`)}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default EMRDokter;