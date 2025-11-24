import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const ExaminationIntegration = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchExaminations();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchExaminations = async () => {
    try {
      // Ambil semua pemeriksaan
      const examinationResponse = await axios.get('/pemeriksaan');
      const allExaminations = examinationResponse.data.data;
      
      // Ambil semua resep untuk menghubungkan ke pemeriksaan
      const prescriptions = {};
      for (const exam of allExaminations) {
        try {
          const prescrResponse = await axios.get(`/resep/pemeriksaan/${exam.id}`);
          prescriptions[exam.id] = prescrResponse.data.data;
        } catch (err) {
          // Jika tidak ada resep untuk pemeriksaan ini, biarkan kosong
          prescriptions[exam.id] = [];
        }
      }
      
      // Gabungkan informasi pemeriksaan dengan resep
      const examinationsWithPrescriptions = allExaminations.map(exam => ({
        ...exam,
        resep: prescriptions[exam.id] || []
      }));
      
      setExaminations(examinationsWithPrescriptions);
    } catch (err) {
      setError('Gagal mengambil data pemeriksaan');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (examId) => {
    setExpandedExam(expandedExam === examId ? null : examId);
  };

  if (loading) return <div className="loading">Memuat data pemeriksaan...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="examination-integration">
      <h2>Integrasi Pemeriksaan dan Resep</h2>
      <p>Daftar pemeriksaan lengkap dengan resep dan status pemberian obatnya</p>

      {examinations.length === 0 ? (
        <div className="no-data">
          <p>Belum ada data pemeriksaan.</p>
        </div>
      ) : (
        <div className="integration-list">
          {examinations.map((exam) => (
            <div key={exam.id} className={`integration-card ${expandedExam === exam.id ? 'expanded' : ''}`}>
              <div className="integration-header" onClick={() => toggleExpand(exam.id)}>
                <div className="header-info">
                  <h3>Pemeriksaan #{exam.id}</h3>
                  <div className="exam-details">
                    <div className="detail">
                      <span className="label">Pasien:</span>
                      <span className="value">{exam.nama_pasien}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Dokter:</span>
                      <span className="value">{exam.nama_dokter}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Tanggal:</span>
                      <span className="value">{new Date(exam.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Status Resep:</span>
                      <span className={`status ${exam.status_resep?.toLowerCase() || 'pending'}`}>
                        {exam.status_resep || 'Belum Ditentukan'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedExam === exam.id ? '▲' : '▼'}
                </div>
              </div>

              {expandedExam === exam.id && (
                <div className="integration-details">
                  <div className="exam-info">
                    <h4>Info Pemeriksaan</h4>
                    <p><strong>Keluhan:</strong> {exam.keluhan || '-'}</p>
                    <p><strong>Diagnosis:</strong> {exam.diagnosa || '-'}</p>
                    <p><strong>Rekomendasi Pengobatan:</strong> {exam.rekomendasi_pengobatan || '-'}</p>
                  </div>

                  <div className="prescription-section">
                    <h4>Resep Obat</h4>
                    {exam.resep && exam.resep.length > 0 ? (
                      <table className="prescription-table">
                        <thead>
                          <tr>
                            <th>Nama Obat</th>
                            <th>Jumlah</th>
                            <th>Aturan Pakai</th>
                            <th>Harga Satuan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.resep.map((resep) => (
                            <tr key={resep.id}>
                              <td>{resep.nama_obat}</td>
                              <td>{resep.jumlah}</td>
                              <td>{resep.aturan_pakai}</td>
                              <td>Rp {Number(resep.harga).toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-prescription">Belum ada resep untuk pemeriksaan ini.</p>
                    )}
                  </div>

                  <div className="integration-status">
                    <h4>Status Integrasi</h4>
                    <div className="status-indicators">
                      <div className={`status-item ${exam.status_resep === 'Selesai' ? 'completed' : 'pending'}`}>
                        <span className="status-icon">{exam.status_resep === 'Selesai' ? '✓' : '○'}</span>
                        <span className="status-label">Obat sudah diberikan</span>
                      </div>
                      <div className={`status-item ${exam.resep.length > 0 ? 'completed' : 'pending'}`}>
                        <span className="status-icon">{exam.resep.length > 0 ? '✓' : '○'}</span>
                        <span className="status-label">Resep telah dibuat</span>
                      </div>
                      <div className="status-item completed">
                        <span className="status-icon">✓</span>
                        <span className="status-label">Pemeriksaan selesai</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExaminationIntegration;