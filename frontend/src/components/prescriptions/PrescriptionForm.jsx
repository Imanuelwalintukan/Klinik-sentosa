import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './PrescriptionForm.css';

const PrescriptionForm = () => {
  const [searchParams] = useSearchParams();
  const examinationId = searchParams.get('examinationId');
  const navigate = useNavigate();
  
  const [examination, setExamination] = useState(null);
  const [medications, setMedications] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([
    { id_obat: '', jumlah: 1, aturan_pakai: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  // Fetch examination context and all available medications
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (!examinationId) {
      setError('ID Pemeriksaan tidak ditemukan di URL. Silakan kembali ke halaman pemeriksaan untuk membuat resep.');
      return;
    }

    setLoading(true);
    // Fetch examination details
    axios.get(`/pemeriksaan/${examinationId}`)
      .then(res => setExamination(res.data.data))
      .catch(() => setError('Gagal mengambil data pemeriksaan.'));

    // Fetch all medications for dropdowns
    axios.get('/obat')
      .then(res => setMedications(res.data.data))
      .catch(() => setError('Gagal mengambil data obat.'))
      .finally(() => setLoading(false));

  }, [examinationId, isAuthenticated]);

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
    if (prescriptionItems.length <= 1) return; // Must have at least one item
    const items = [...prescriptionItems];
    items.splice(index, 1);
    setPrescriptionItems(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out empty items
    const validItems = prescriptionItems.filter(item => item.id_obat && item.jumlah > 0 && item.aturan_pakai);
    if (validItems.length === 0) {
      setError('Harap isi setidaknya satu item resep dengan lengkap.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/resep/bulk', {
        examinationId: examinationId,
        items: validItems
      });
      alert('Resep berhasil disimpan!');
      navigate(`/examinations/${examinationId}`); // Redirect to examination detail
    } catch (err) {
      setError('Gagal menyimpan resep: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !examination) {
    return <div className="prescription-form"><h2>Memuat...</h2></div>;
  }

  return (
    <div className="prescription-form">
      <h2>Buat Resep</h2>
      {examination && (
        <div className="examination-context">
          <p><strong>Pasien:</strong> {examination.nama_pasien}</p>
          <p><strong>Tanggal:</strong> {new Date(examination.tanggal_pemeriksaan).toLocaleString('id-ID')}</p>
          <p><strong>Diagnosa:</strong> {examination.diagnosa}</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
          {!examinationId && (
            <div style={{ marginTop: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/examinations')}
              >
                Kembali ke Daftar Pemeriksaan
              </button>
            </div>
          )}
        </div>
      )}

      {!error && !examinationId ? null : (
        <form onSubmit={handleSubmit}>
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
                <input
                  type="text"
                  id={`aturan_pakai_${index}`}
                  name="aturan_pakai"
                  value={item.aturan_pakai}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Contoh: 3x sehari setelah makan"
                  required
                />
              </div>

              <div className="item-actions">
                <button type="button" className="btn-remove-item" onClick={() => removeItem(index)}>&times;</button>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline-primary" onClick={addItem}>
            + Tambah Obat Lain
          </button>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Resep'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/examinations/${examinationId}`)}>
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PrescriptionForm;