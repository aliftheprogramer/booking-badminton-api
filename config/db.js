// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // `await` akan menunggu koneksi selesai, lalu hasilnya dimasukkan ke `conn`.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Jika baris di atas berhasil, kode ini akan berjalan.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Jika `await` gagal, akan langsung loncat ke blok `catch` ini.
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;