// DispensePage.jsx - Komponen untuk menampilkan dan menyelesaikan pemberian resep
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './Prescription.css';

const DispensePage = () => {
  const { pemeriksaanId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [examination, setExamination] = useState(null);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [availableMedications, setAvailableMedications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch examination details
        const examRes = await axios.get(`/pemeriksaan/${pemeriksaanId}`);
        setExamination(examRes.data.data);

        // Fetch prescription items
        const resepRes = await axios.get(`/resep/pemeriksaan/${pemeriksaanId}`);
        setPrescriptionItems(resepRes.data.data);

        // Fetch all medications to check stock and prices
        const medicationRes = await axios.get('/obat');
        setAvailableMedications(medicationRes.data.data);

      } catch (err) {
        setError('Gagal mengambil data resep: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [pemeriksaanId, isAuthenticated]);

  // Check stock availability
  const checkStockAvailability = () => {
    const unavailableItems = [];
    const insufficientStockItems = [];

    for (const item of prescriptionItems) {
      const medication = availableMedications.find(med => med.id === item.obat_id);
      if (!medication) {
        unavailableItems.push(item.nama_obat);
      } else if (medication && medication.stok < item.jumlah) {
        insufficientStockItems.push({
          nama_obat: item.nama_obat,
          stok: medication.stok,
          dibutuhkan: item.jumlah
        });
      }
    }

    return { unavailableItems, insufficientStockItems };
  };

  const handleDispense = async () => {
    const { unavailableItems, insufficientStockItems } = checkStockAvailability();

    if (unavailableItems.length > 0 || insufficientStockItems.length > 0) {
      let errorMessage = 'Terdapat masalah stok:\n\n';

      if (unavailableItems.length > 0) {
        errorMessage += `• Obat tidak ditemukan: ${unavailableItems.join(', ')}\n`;
      }

      if (insufficientStockItems.length > 0) {
        errorMessage += '• Stok tidak mencukupi:\n';
        insufficientStockItems.forEach(item => {
          errorMessage += `  - ${item.nama_obat}: Tersedia ${item.stok}, Dibutuhkan ${item.dibutuhkan}\n`;
        });
      }

      setError(errorMessage);
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menyelesaikan dan memberikan resep ini? Stok obat akan dikurangi.')) {
      setIsDispensing(true);
      setError(null);
      try {
        const response = await axios.post(`/resep/dispense/${pemeriksaanId}`);
        if (response.data.success) {
          alert('Resep berhasil diberikan!');
          navigate('/prescriptions'); // Kembali ke antrian resep
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        setError('Gagal memberikan resep: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsDispensing(false);
      }
    }
  };

  if (loading) return <div className="dispense-page"><h2>Memuat...</h2></div>;
  if (error && !examination) return <div className="dispense-page alert alert-danger">{error}</div>;

  return (
    <div className="dispense-page">
      <h2>Proses Pemberian Resep</h2>

      {examination && (
        <div className="dispense-context">
          <p><strong>No Pemeriksaan:</strong> #{pemeriksaanId}</p>
          <p><strong>Pasien:</strong> {examination.nama_pasien}</p>
          <p><strong>Dokter:</strong> {examination.nama_dokter}</p>
          <p><strong>Tanggal:</strong> {new Date(examination.tanggal_pemeriksaan).toLocaleString('id-ID')}</p>
        </div>
      )}

      <h3>Obat yang Akan Diberikan:</h3>
      {prescriptionItems.length > 0 ? (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Obat</th>
                <th>Jumlah</th>
                <th>Aturan Pakai</th>
                <th>Harga Satuan (Rp)</th>
                <th>Subtotal (Rp)</th>
                <th>Stok Tersedia</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionItems.map(item => {
                const medication = availableMedications.find(med => med.id === item.obat_id);
                const isAvailable = medication && medication.stok >= item.jumlah;
                const hargaSatuan = medication ? (medication.harga || medication.harga_jual || 0) : 0;
                const subtotal = item.jumlah * hargaSatuan;

                return (
                  <tr key={item.id}>
                    <td>{item.nama_obat}</td>
                    <td>{item.jumlah}</td>
                    <td>{item.aturan_pakai}</td>
                    <td>Rp {hargaSatuan?.toLocaleString('id-ID') || '0'}</td>
                    <td>Rp {subtotal?.toLocaleString('id-ID') || '0'}</td>
                    <td>{medication ? medication.stok : 'Tidak ditemukan'}</td>
                    <td>
                      <span className={`status-badge ${isAvailable ? 'status-pending' : 'status-dispensed'}`}>
                        {isAvailable ? 'Tersedia' : 'Stok Kurang'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Menampilkan total biaya */}
          <div className="total-section">
            <div className="total-line">
              <strong>Total Biaya:</strong>
              <span className="total-amount">
                Rp {
                  prescriptionItems.reduce((total, item) => {
                    const medication = availableMedications.find(med => med.id === item.obat_id);
                    const hargaSatuan = medication ? (medication.harga || medication.harga_jual || 0) : 0;
                    return total + (item.jumlah * hargaSatuan);
                  }, 0).toLocaleString('id-ID')
                }
              </span>
            </div>
          </div>
        </>
      ) : (
        <p>Tidak ada item obat dalam resep ini.</p>
      )}

      {error && <div className="alert alert-danger" style={{marginTop: '20px'}}>{error}</div>}

      <div className="dispense-actions">
        <button
          onClick={handleDispense}
          className="btn btn-success btn-lg"
          disabled={isDispensing || prescriptionItems.length === 0}
        >
          {isDispensing ? 'Memproses...' : 'Konfirmasi & Berikan Resep'}
        </button>
        <button
          onClick={() => navigate('/prescriptions')}
          className="btn btn-secondary btn-lg"
        >
          Kembali ke Antrian
        </button>
      </div>

      {examination && examination.status_resep === 'telah_diberikan' && (
        <div className="alert alert-warning" style={{marginTop: '20px'}}>
          Catatan: Resep ini mungkin sudah pernah diberikan sebelumnya.
        </div>
      )}

      {(currentUser?.role !== 'apoteker' && currentUser?.role !== 'admin') && (
        <div className="alert alert-info" style={{marginTop: '20px'}}>
          Hanya apoteker atau admin yang dapat memberikan resep.
        </div>
      )}
    </div>
  );
};

export default DispensePage;