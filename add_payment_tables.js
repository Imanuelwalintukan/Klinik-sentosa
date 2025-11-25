// add_payment_tables.js
const db = require('./backend/config/database');

const addPaymentTables = async () => {
  try {
    console.log('Menambahkan tabel-tabel untuk sistem pembayaran...');
    
    const queries = [
      // Tambahkan tabel metode_pembayaran
      `CREATE TABLE IF NOT EXISTS metode_pembayaran (
        id SERIAL PRIMARY KEY,
        nama_metode VARCHAR(100) NOT NULL UNIQUE,
        deskripsi TEXT,
        jenis_pembayaran VARCHAR(50) CHECK (jenis_pembayaran IN ('tunai', 'non_tunai', 'jaminan')), -- tunai, transfer, kartu, bpjs, dll
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Tambahkan tabel pembayaran
      `CREATE TABLE IF NOT EXISTS pembayaran (
        id SERIAL PRIMARY KEY,
        id_resep INTEGER REFERENCES resep(id) ON DELETE CASCADE, -- pembayaran terkait dengan resep
        id_metode_pembayaran INTEGER REFERENCES metode_pembayaran(id),
        jumlah_pembayaran DECIMAL(10,2) NOT NULL,
        jumlah_dibayarkan DECIMAL(10,2) DEFAULT 0,
        jumlah_kembalian DECIMAL(10,2) DEFAULT 0,
        status_pembayaran VARCHAR(50) DEFAULT 'belum_lunas' CHECK (status_pembayaran IN ('belum_lunas', 'lunas', 'ditunda')),
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Tambahkan kolom ke tabel resep untuk relasi pembayaran
      `ALTER TABLE resep ADD COLUMN IF NOT EXISTS id_pembayaran INTEGER REFERENCES pembayaran(id);`
    ];

    for (const sqlQuery of queries) {
      await db.query(sqlQuery);
    }

    console.log('Tabel-tabel pembayaran berhasil ditambahkan.');

    // Tambahkan beberapa data metode pembayaran default
    console.log('Menambahkan data metode pembayaran default...');

    // Cek apakah sudah ada data
    const countResult = await db.query('SELECT COUNT(*) FROM metode_pembayaran');
    const count = parseInt(countResult.rows[0].count);

    if (count === 0) {
      const defaultMethods = [
        { nama_metode: 'Tunai', deskripsi: 'Pembayaran dengan uang tunai', jenis_pembayaran: 'tunai' },
        { nama_metode: 'Transfer Bank', deskripsi: 'Pembayaran melalui transfer antar bank', jenis_pembayaran: 'non_tunai' },
        { nama_metode: 'Kartu Debit', deskripsi: 'Pembayaran menggunakan kartu debit', jenis_pembayaran: 'non_tunai' },
        { nama_metode: 'Kartu Kredit', deskripsi: 'Pembayaran menggunakan kartu kredit', jenis_pembayaran: 'non_tunai' },
        { nama_metode: 'BPJS Kesehatan', deskripsi: 'Pembayaran melalui program BPJS Kesehatan', jenis_pembayaran: 'jaminan' },
        { nama_metode: 'Asuransi Swasta', deskripsi: 'Pembayaran melalui asuransi kesehatan swasta', jenis_pembayaran: 'jaminan' }
      ];

      for (const method of defaultMethods) {
        await db.query(
          'INSERT INTO metode_pembayaran (nama_metode, deskripsi, jenis_pembayaran) VALUES ($1, $2, $3)',
          [method.nama_metode, method.deskripsi, method.jenis_pembayaran]
        );
      }

      console.log('Data metode pembayaran default berhasil ditambahkan.');
    } else {
      console.log('Data metode pembayaran sudah ada, melewati penambahan data default.');
    }

  } catch (error) {
    console.error('Gagal menambahkan tabel pembayaran:', error.message);
  } finally {
    process.exit(0);
  }
};

addPaymentTables();