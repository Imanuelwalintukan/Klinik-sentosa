import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './EMR.css';

const EMRPasien = () => {
  const { id: pasienId } = useParams();
  const [rekamMedis, setRekamMedis] = useState([]);
  const [riwayatAlergi, setRiwayatAlergi] = useState([]);
  const [pemeriksaanPenunjang, setPemeriksaanPenunjang] = useState([]);
  const [riwayatImunisasi, setRiwayatImunisasi] = useState([]);
  const [pemeriksaan, setPemeriksaan] = useState([]);
  const [resepObat, setResepObat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (pasienId && isAuthenticated) { // Hanya fetch jika ada pasienId dan sudah terautentikasi
      fetchEMRData();
    } else if (!isAuthenticated) {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [pasienId, isAuthenticated]);

  const fetchEMRData = async () => {
    try {
      setLoading(true);
      console.log("Memulai pengambilan data EMR untuk pasien ID:", pasienId);

      // Ambil semua data EMR sekaligus
      const [
        rekamMedisRes,
        alergiRes,
        penunjangRes,
        imunisasiRes,
        pemeriksaanRes
      ] = await Promise.allSettled([
        axios.get(`/emr/rekam-medis/pasien/${pasienId}`),
        axios.get(`/emr/alergi/pasien/${pasienId}`),
        axios.get(`/emr/pemeriksaan-penunjang/pasien/${pasienId}`),
        axios.get(`/emr/imunisasi/pasien/${pasienId}`),
        axios.get(`/pemeriksaan/pasien/${pasienId}`)
      ]);

      console.log("Hasil permintaan:", {
        rekamMedisRes,
        alergiRes,
        penunjangRes,
        imunisasiRes,
        pemeriksaanRes
      });

      if (rekamMedisRes.status === 'fulfilled' && rekamMedisRes.value.data.success) {
        console.log("Rekam medis:", rekamMedisRes.value.data.data);
        setRekamMedis(rekamMedisRes.value.data.data);
      } else {
        console.error("Error rekam medis:", rekamMedisRes.status === 'rejected' ? rekamMedisRes.reason : rekamMedisRes.value?.data?.message);
        // Tetap tampilkan pesan bahwa tidak ada data, bukan error
      }

      if (alergiRes.status === 'fulfilled' && alergiRes.value.data.success) {
        console.log("Riwayat alergi:", alergiRes.value.data.data);
        setRiwayatAlergi(alergiRes.value.data.data);
      } else {
        console.error("Error alergi:", alergiRes.status === 'rejected' ? alergiRes.reason : alergiRes.value?.data?.message);
      }

      if (penunjangRes.status === 'fulfilled' && penunjangRes.value.data.success) {
        console.log("Pemeriksaan penunjang:", penunjangRes.value.data.data);
        setPemeriksaanPenunjang(penunjangRes.value.data.data);
      } else {
        console.error("Error pemeriksaan penunjang:", penunjangRes.status === 'rejected' ? penunjangRes.reason : penunjangRes.value?.data?.message);
      }

      if (imunisasiRes.status === 'fulfilled' && imunisasiRes.value.data.success) {
        console.log("Riwayat imunisasi:", imunisasiRes.value.data.data);
        setRiwayatImunisasi(imunisasiRes.value.data.data);
      } else {
        console.error("Error riwayat imunisasi:", imunisasiRes.status === 'rejected' ? imunisasiRes.reason : imunisasiRes.value?.data?.message);
      }

      if (pemeriksaanRes.status === 'fulfilled' && pemeriksaanRes.value.data.success) {
        console.log("Pemeriksaan:", pemeriksaanRes.value.data.data);
        setPemeriksaan(pemeriksaanRes.value.data.data);

        // Ambil resep untuk setiap pemeriksaan
        const pemeriksaanData = pemeriksaanRes.value.data.data;
        if (pemeriksaanData && pemeriksaanData.length > 0) {
          console.log("Mengambil resep untuk", pemeriksaanData.length, "pemeriksaan");
          const resepPromises = pemeriksaanData.map(pemeriksaan =>
            axios.get(`/resep/pemeriksaan/${pemeriksaan.id}`)
          );

          try {
            const resepResults = await Promise.allSettled(resepPromises);
            const allResep = [];
            resepResults.forEach((result, index) => {
              if (result.status === 'fulfilled' && result.value.data.success) {
                console.log(`Resep untuk pemeriksaan ${pemeriksaanData[index].id}:`, result.value.data.data);
                allResep.push(...result.value.data.data.map(resep => ({
                  ...resep,
                  tanggal_pemeriksaan: pemeriksaanData[index].tanggal_pemeriksaan
                })));
              } else {
                console.error(`Error resep untuk pemeriksaan ${pemeriksaanData[index].id}:`, result.status === 'rejected' ? result.reason : result.value?.data?.message);
              }
            });
            console.log("Semua resep:", allResep);
            setResepObat(allResep);
          } catch (resepError) {
            console.error("Error fetching resep:", resepError);
          }
        }
      } else {
        console.error("Error pemeriksaan:", pemeriksaanRes.status === 'rejected' ? pemeriksaanRes.reason : pemeriksaanRes.value?.data?.message);
      }
    } catch (err) {
      console.error("Error keseluruhan:", err);
      setError('Gagal mengambil data rekam medis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Memuat rekam medis...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="emr-pasien">
      <h2>Rekam Medis Pasien</h2>

      {/* Hasil Pemeriksaan Medis dan Diagnosa */}
      <section className="section">
        <h3>📋 Pemeriksaan Medis & Diagnosa</h3>
        {pemeriksaan.length > 0 ? (
          pemeriksaan.map((pem) => (
            <div key={pem.id} className="pemeriksaan-record">
              <div className="pemeriksaan-header">
                <h4>📅 {new Date(pem.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</h4>
                <span className="dokter-name">{pem.nama_dokter}</span>
              </div>

              <div className="pemeriksaan-details">
                <div className="detail-row">
                  <strong>🩺 Keluhan Utama:</strong>
                  <span>{pem.keluhan_utama || '-'}</span>
                </div>

                <div className="detail-row">
                  <strong>🩺 Pemeriksaan Fisik:</strong>
                  <span>{pem.pemeriksaan_fisik || '-'}</span>
                </div>

                <div className="detail-row">
                  <strong>❤️ Tekanan Darah:</strong>
                  <span>{pem.tekanan_darah || '-'}</span>
                </div>

                <div className="detail-row">
                  <strong>🌡️ Suhu:</strong>
                  <span>{pem.suhu || '-'} °C</span>
                </div>

                <div className="detail-row">
                  <strong>⚖️ Berat Badan:</strong>
                  <span>{pem.berat_badan || '-'} kg</span>
                </div>

                <div className="detail-row">
                  <strong>📏 Tinggi Badan:</strong>
                  <span>{pem.tinggi_badan || '-'} cm</span>
                </div>

                <div className="detail-row">
                  <strong>🔍 Diagnosa:</strong>
                  <span>{pem.diagnosa || '-'}</span>
                </div>

                <div className="detail-row">
                  <strong>💊 Terapi:</strong>
                  <span>{pem.terapi || '-'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Belum ada hasil pemeriksaan medis untuk pasien ini.</p>
        )}
      </section>

      {/* Resep Obat */}
      <section className="section">
        <h3>💊 Resep Obat</h3>
        {resepObat.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nama Obat</th>
                <th>Dosis</th>
                <th>Jumlah</th>
                <th>Catatan</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {resepObat.map((resep) => (
                <tr key={resep.id}>
                  <td>{resep.nama_obat}</td>
                  <td>{resep.dosis}</td>
                  <td>{resep.jumlah}</td>
                  <td>{resep.catatan}</td>
                  <td>{resep.tanggal_pemeriksaan ? new Date(resep.tanggal_pemeriksaan).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Belum ada resep obat untuk pasien ini.</p>
        )}
      </section>

      {/* Riwayat Kunjungan */}
      <section className="section">
        <h3>🏥 Riwayat Pemeriksaan</h3>
        {pemeriksaan.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Dokter</th>
                <th>Diagnosa</th>
                <th>Terapi</th>
              </tr>
            </thead>
            <tbody>
              {pemeriksaan.map((pemeriksaanItem) => (
                <tr key={pemeriksaanItem.id}>
                  <td>{new Date(pemeriksaanItem.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</td>
                  <td>{pemeriksaanItem.nama_dokter}</td>
                  <td>{pemeriksaanItem.diagnosa || '-'}</td>
                  <td>{pemeriksaanItem.terapi || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Tidak ada riwayat pemeriksaan untuk pasien ini.</p>
        )}
      </section>

      {/* Ringkasan Kondisi Pasien */}
      <section className="section">
        <h3>📋 Ringkasan Kondisi Pasien</h3>
        {rekamMedis.length > 0 ? (
          rekamMedis.map((rm) => (
            <div key={rm.id} className="summary-card">
              <div className="summary-row">
                <span className="label">📅 Tanggal:</span>
                <span className="value">{new Date(rm.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="summary-row">
                <span className="label">👨‍⚕️ Dokter:</span>
                <span className="value">{rm.nama_dokter}</span>
              </div>
              {rm.ringkasan_kondisi_pasien && (
                <div className="summary-row">
                  <span className="label">📝 Ringkasan:</span>
                  <span className="value">{rm.ringkasan_kondisi_pasien}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-data">Belum ada ringkasan kondisi pasien.</p>
        )}
      </section>

      {/* Riwayat Alergi */}
      <section className="section">
        <h3>⚠️ Riwayat Alergi</h3>
        {riwayatAlergi.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Jenis Alergi</th>
                <th>Nama Alergen</th>
                <th>Tingkat Keparahan</th>
                <th>Tanggal Konfirmasi</th>
                <th>Gejala</th>
              </tr>
            </thead>
            <tbody>
              {riwayatAlergi.map((alergi) => (
                <tr key={alergi.id}>
                  <td>{alergi.jenis_alergi}</td>
                  <td>{alergi.nama_alergen}</td>
                  <td>
                    <span className={`severity-badge ${alergi.tingkat_keparahan?.toLowerCase()}`}>
                      {alergi.tingkat_keparahan}
                    </span>
                  </td>
                  <td>{alergi.tanggal_konfirmasi ? new Date(alergi.tanggal_konfirmasi).toLocaleDateString('id-ID') : '-'}</td>
                  <td>{alergi.gejala_yang_muncul}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Tidak ada catatan alergi.</p>
        )}
      </section>

      {/* Pemeriksaan Penunjang */}
      <section className="section">
        <h3>🧪 Hasil Pemeriksaan Penunjang</h3>
        {pemeriksaanPenunjang.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Jenis Pemeriksaan</th>
                <th>Nama Pemeriksaan</th>
                <th>Hasil</th>
                <th>Nilai Normal</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {pemeriksaanPenunjang.map((pemeriksaan) => (
                <tr key={pemeriksaan.id}>
                  <td>{pemeriksaan.jenis_pemeriksaan}</td>
                  <td>{pemeriksaan.nama_pemeriksaan}</td>
                  <td>{pemeriksaan.hasil_pemeriksaan}</td>
                  <td>{pemeriksaan.nilai_normal}</td>
                  <td>{pemeriksaan.tanggal_pemeriksaan ? new Date(pemeriksaan.tanggal_pemeriksaan).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Tidak ada hasil pemeriksaan penunjang.</p>
        )}
      </section>

      {/* Riwayat Imunisasi */}
      <section className="section">
        <h3>💉 Riwayat Imunisasi</h3>
        {riwayatImunisasi.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Jenis Imunisasi</th>
                <th>Tanggal</th>
                <th>Dosis Ke-</th>
                <th>Batch Vaksin</th>
              </tr>
            </thead>
            <tbody>
              {riwayatImunisasi.map((imunisasi) => (
                <tr key={imunisasi.id}>
                  <td>{imunisasi.jenis_imunisasi}</td>
                  <td>{new Date(imunisasi.tanggal_imunisasi).toLocaleDateString('id-ID')}</td>
                  <td>{imunisasi.dosis_ke}</td>
                  <td>{imunisasi.batch_vaksin || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Tidak ada catatan imunisasi.</p>
        )}
      </section>
    </div>
  );
};

export default EMRPasien;