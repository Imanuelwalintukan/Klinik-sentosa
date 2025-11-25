// Skrip untuk membuat semua jenis akun di sistem Klinik Sentosa
const bcrypt = require('bcryptjs');
const db = require('./backend/config/database');

// Fungsi untuk membuat hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const createAllUsers = async () => {
  try {
    console.log('Memulai pembuatan semua jenis akun...');

    // 1. Membuat akun admin
    console.log('\n1. Membuat akun admin...');
    const adminPassword = await hashPassword('admin123');
    const existingAdmin = await db.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (existingAdmin.rows.length === 0) {
      await db.query(`
        INSERT INTO users (username, password_hash, role, nama) 
        VALUES ($1, $2, $3, $4)
      `, ['admin', adminPassword, 'admin', 'Administrator']);
      console.log(' ✓ Akun admin berhasil dibuat');
      console.log('   - Username: admin');
      console.log('   - Password: admin123');
    } else {
      console.log(' ✓ Akun admin sudah ada');
    }

    // 2. Membuat akun dokter
    console.log('\n2. Membuat akun dokter...');
    const doctors = [
      { nama: 'Dr. Andi Pratama', spesialis: 'Penyakit Dalam', nomor_telepon: '081511112222' },
      { nama: 'Dr. Sari Lestari', spesialis: 'Anak', nomor_telepon: '081622223333' },
      { nama: 'Dr. Hadi Wijaya', spesialis: 'Bedah', nomor_telepon: '081733334444' },
      { nama: 'Dr. Rina Safitri', spesialis: 'Gigi', nomor_telepon: '081844445555' },
      { nama: 'Dr. Budi Santoso', spesialis: 'Umum', nomor_telepon: '081955556666' }
    ];

    for (const doctor of doctors) {
      // Cek apakah dokter sudah ada di tabel dokter
      let existingDoctor = await db.query('SELECT id FROM dokter WHERE nama = $1', [doctor.nama]);
      let doctorId;

      if (existingDoctor.rows.length === 0) {
        // Buat dokter baru
        const result = await db.query(`
          INSERT INTO dokter (nama, spesialis, nomor_telepon, alamat) 
          VALUES ($1, $2, $3, $4) RETURNING id
        `, [doctor.nama, doctor.spesialis, doctor.nomor_telepon, 'Alamat default']);
        doctorId = result.rows[0].id;
        console.log(`   - Dokter ${doctor.nama} telah dibuat di tabel dokter`);
      } else {
        doctorId = existingDoctor.rows[0].id;
        console.log(`   - Dokter ${doctor.nama} sudah ada di tabel dokter`);
      }

      // Buat akun user untuk dokter
      const username = doctor.nama.toLowerCase().replace(/\s+/g, '');
      const password = await hashPassword('default123');
      
      const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length === 0) {
        await db.query(`
          INSERT INTO users (username, password_hash, role, nama, spesialis, nomor_telepon) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [username, password, 'dokter', doctor.nama, doctor.spesialis, doctor.nomor_telepon]);
        console.log(`   - Akun user untuk ${doctor.nama} berhasil dibuat`);
        console.log(`     Username: ${username}, Password: default123`);
      } else {
        console.log(`   - Akun user untuk ${doctor.nama} sudah ada`);
      }
    }

    // 3. Membuat akun perawat
    console.log('\n3. Membuat akun perawat...');
    const nurses = [
      { nama: 'Suster Rina', nomor_telepon: '082111112222' },
      { nama: 'Suster Maya', nomor_telepon: '082222223333' },
      { nama: 'Suster Dewi', nomor_telepon: '082333334444' }
    ];

    for (const nurse of nurses) {
      const username = nurse.nama.toLowerCase().replace(/\s+/g, '');
      const password = await hashPassword('nurse123');
      
      const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length === 0) {
        await db.query(`
          INSERT INTO users (username, password_hash, role, nama, nomor_telepon) 
          VALUES ($1, $2, $3, $4, $5)
        `, [username, password, 'perawat', nurse.nama, nurse.nomor_telepon]);
        console.log(`   - Akun perawat ${nurse.nama} berhasil dibuat`);
        console.log(`     Username: ${username}, Password: nurse123`);
      } else {
        console.log(`   - Akun perawat ${nurse.nama} sudah ada`);
      }
    }

    // 4. Membuat akun apoteker
    console.log('\n4. Membuat akun apoteker...');
    const pharmacists = [
      { nama: 'Apoteker Budi', nomor_telepon: '083111112222' },
      { nama: 'Apoteker Sari', nomor_telepon: '083222223333' }
    ];

    for (const pharmacist of pharmacists) {
      const username = pharmacist.nama.toLowerCase().replace(/\s+/g, '');
      const password = await hashPassword('apoteker123');
      
      const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length === 0) {
        await db.query(`
          INSERT INTO users (username, password_hash, role, nama, nomor_telepon) 
          VALUES ($1, $2, $3, $4, $5)
        `, [username, password, 'apoteker', pharmacist.nama, pharmacist.nomor_telepon]);
        console.log(`   - Akun apoteker ${pharmacist.nama} berhasil dibuat`);
        console.log(`     Username: ${username}, Password: apoteker123`);
      } else {
        console.log(`   - Akun apoteker ${pharmacist.nama} sudah ada`);
      }
    }

    // 5. Contoh membuat pasien (untuk pengujian login pasien)
    console.log('\n5. Membuat contoh pasien untuk pengujian...');
    const patients = [
      { nama: 'Ahmad Fauzi', tanggal_lahir: '1990-05-15', jenis_kelamin: 'Laki-laki', alamat: 'Jl. Merdeka No. 1', nomor_telepon: '081312345678', nomor_bpjs: '0001234567890' },
      { nama: 'Siti Aminah', tanggal_lahir: '1985-11-20', jenis_kelamin: 'Perempuan', alamat: 'Jl. Sudirman No. 5', nomor_telepon: '085287654321', nomor_bpjs: '0009876543210' }
    ];

    for (const patient of patients) {
      const existingPatient = await db.query('SELECT id FROM pasien WHERE nomor_telepon = $1', [patient.nomor_telepon]);
      if (existingPatient.rows.length === 0) {
        await db.query(`
          INSERT INTO pasien (nama, tanggal_lahir, jenis_kelamin, alamat, nomor_telepon, nomor_bpjs) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [patient.nama, patient.tanggal_lahir, patient.jenis_kelamin, patient.alamat, patient.nomor_telepon, patient.nomor_bpjs]);
        console.log(`   - Data pasien ${patient.nama} berhasil dibuat`);
        console.log(`     Nomor Telepon: ${patient.nomor_telepon}, Nomor BPJS: ${patient.nomor_bpjs}`);
      } else {
        console.log(`   - Data pasien ${patient.nama} sudah ada`);
      }
    }

    console.log('\nSemua akun telah selesai dibuat!');
    console.log('\nInformasi login:');
    console.log('- Admin: username=admin, password=admin123');
    console.log('- Dokter: username=drandipratama, password=default123 (dan seterusnya untuk dokter lainnya)');
    console.log('- Perawat: username=susterrina, password=nurse123 (dan seterusnya)');
    console.log('- Apoteker: username=apotekerbudi, password=apoteker123 (dan seterusnya)');
    console.log('- Pasien: login menggunakan nomor telepon atau BPJS di halaman pasien');

  } catch (error) {
    console.error('Gagal membuat akun:', error.message);
  } finally {
    process.exit(0);
  }
};

createAllUsers();