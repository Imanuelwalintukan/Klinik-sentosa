const resepModel = require('./backend/models/Resep');

const testResepById = async () => {
  try {
    console.log('Testing getResepById function...');
    
    const id = 24; // ID dari error log
    
    console.log('Mencoba getResepById dengan ID:', id);
    
    const result = await resepModel.getResepById(id);
    
    if (result) {
      console.log('Data resep ditemukan:');
      console.log(result);
    } else {
      console.log('Data resep tidak ditemukan dengan ID:', id);
    }
  } catch (error) {
    console.error('Error saat mengambil resep by ID:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
};

testResepById();