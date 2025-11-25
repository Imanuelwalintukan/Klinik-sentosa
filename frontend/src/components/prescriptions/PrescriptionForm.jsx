import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './PrescriptionForm.css';

const PrescriptionForm = () => {
  const [searchParams] = useSearchParams();
  const examinationIdFromUrl = searchParams.get('examinationId');
  const navigate = useNavigate();

  const { currentUser, isAuthenticated } = useAuth();

  const [examination, setExamination] = useState(null);
  const [medications, setMedications] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([
    { id_obat: '', jumlah: 1, aturan_pakai: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (currentUser?.role !== 'dokter') {
      setError('Hanya dokter yang dapat membuat resep.');
      setLoading(false);
      return;
    }

    // Jika examinationIdFromUrl tidak ada, tampilkan error
    if (!examinationIdFromUrl) {
      setError('ID Pemeriksaan tidak ditemukan di URL. Silakan kembali ke halaman pemeriksaan untuk membuat resep.');
      setLoading(false);
      return;
    }

    fetchPrescriptionData();
  }, [examinationIdFromUrl, isAuthenticated, currentUser, navigate]);

  const fetchPrescriptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ambil detail pemeriksaan
      const examResponse = await axios.get(`/pemeriksaan/${examinationIdFromUrl}`);
      if (examResponse.data.success) {
        setExamination(examResponse.data.data);
      } else {
        throw new Error('Data pemeriksaan tidak ditemukan');
      }

      // Ambil daftar obat
      const medicationResponse = await axios.get('/obat');
      if (medicationResponse.data.success) {
        setMedications(medicationResponse.data.data);
      } else {
        throw new Error('Gagal mengambil data obat');
      }
    } catch (err) {
      setError('Gagal mengambil data: ' + (err.response?.data?.message || err.message));
      console.error('Error saat mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const items = [...prescriptionItems];
    items[index][name] = value;
    setPrescriptionItems(items);
  };

  const addItem = () => {
    setPrescriptionItems([...prescriptionItems, { id_obat: '', jumlah: 1, aturan_pakai: '' }]);
  };

  const removeItem = (index) => {
    if (prescriptionItems.length <= 1) return; // Harus ada setidaknya satu item
    const items = [...prescriptionItems];
    items.splice(index, 1);
    setPrescriptionItems(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter item yang diisi lengkap
    const validItems = prescriptionItems.filter(item =>
      item.id_obat && item.jumlah > 0 && item.aturan_pakai
    );

    if (validItems.length === 0) {
      setError('Harap isi setidaknya satu item resep dengan lengkap.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/resep/bulk', {
        examinationId: examinationIdFromUrl,
        items: validItems
      });

      if (response.data.success) {
        alert('Resep berhasil disimpan!');
        navigate(`/examinations/${examinationIdFromUrl}`);
      } else {
        throw new Error(response.data.message || 'Gagal menyimpan resep');
      }
    } catch (err) {
      setError('Gagal menyimpan resep: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="prescription-form">
        <h2>Buat Resep</h2>
        <div className="alert alert-danger">{error}</div>
        <div className="form-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/examinations')}
          >
            Kembali ke Daftar Pemeriksaan
          </button>
          <button
            className="btn btn-primary"
            onClick={fetchPrescriptionData}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading && !examination) {
    return <div className="prescription-form"><h2>Memuat data...</h2></div>;
  }

  return (
    <div className="prescription-form">
      <h2>Buat Resep</h2>

      {examination && (
        <div className="examination-context">
          <h4>Informasi Pemeriksaan</h4>
          <p><strong>Pasien:</strong> {examination.nama_pasien}</p>
          <p><strong>Tanggal:</strong> {new Date(examination.tanggal_pemeriksaan).toLocaleString('id-ID')}</p>
          <p><strong>Diagnosa:</strong> {examination.diagnosa}</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <h3>Daftar Obat dalam Resep</h3>
        {prescriptionItems.map((item, index) => (
          <div className="prescription-item-row" key={index}>
            <div className="form-group item-medication">
              <label htmlFor={`id_obat_${index}`}>Obat</label>
              <select
                id={`id_obat_${index}`}
                name="id_obat"
                value={item.id_obat}
                onChange={(e) => handleItemChange(index, e)}
                required
              >
                <option value="">Pilih Obat</option>
                {medications.map(med => (
                  <option key={med.id} value={med.id}>
                    {med.nama_obat} (Stok: {med.stok})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group item-quantity">
              <label htmlFor={`jumlah_${index}`}>Jumlah</label>
              <input
                type="number"
                id={`jumlah_${index}`}
                name="jumlah"
                value={item.jumlah}
                onChange={(e) => handleItemChange(index, e)}
                min="1"
                required
              />
            </div>

            <div className="form-group item-usage">
              <label htmlFor={`aturan_pakai_${index}`}>Aturan Pakai</label>
              <select
                id={`aturan_pakai_${index}`}
                name="aturan_pakai"
                value={item.aturan_pakai}
                onChange={(e) => handleItemChange(index, e)}
                required
              >
                <option value="">Pilih Aturan Pakai</option>
                <option value="1x sehari sebelum makan">1x sehari sebelum makan</option>
                <option value="1x sehari sesudah makan">1x sehari sesudah makan</option>
                <option value="2x sehari (pagi dan sore)">2x sehari (pagi dan sore)</option>
                <option value="3x sehari (pagi, siang, sore)">3x sehari (pagi, siang, sore)</option>
                <option value="1x sehari sebelum tidur">1x sehari sebelum tidur</option>
                <option value="Sesuai petunjuk dokter">Sesuai petunjuk dokter</option>
                <option value="Sesuai kebutuhan">Sesuai kebutuhan</option>
              </select>
              <div className="form-note">
                <small>Atau:</small>
              </div>
              <input
                type="text"
                name="aturan_pakai"
                value={item.aturan_pakai}
                onChange={(e) => handleItemChange(index, e)}
                placeholder="Tulis aturan pakai lainnya"
              />
            </div>

            {prescriptionItems.length > 1 && (
              <div className="item-actions">
                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() => removeItem(index)}
                  title="Hapus item ini"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary" onClick={addItem}>
          + Tambah Obat Lain
        </button>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Resep'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/examinations/${examinationIdFromUrl}`)}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;