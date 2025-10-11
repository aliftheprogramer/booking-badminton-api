const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const path = require('path');

// Impor Model
const User = require('./models/userModel');
const Lapangan = require('./models/lapanganModel');
const Booking = require('./models/bookingModel');
const Jadwal = require('./models/jadwalModel');

// Impor Data dengan path absolut agar lebih andal
const usersData = require(path.join(__dirname, 'data', 'users.js'));
const lapanganData = require(path.join(__dirname, 'data', 'lapangan.js'));

// Normalisasi data users (mendukung export default, atau { users: [...] })
const users = Array.isArray(usersData)
  ? usersData
  : Array.isArray(usersData?.default)
    ? usersData.default
    : Array.isArray(usersData?.users)
      ? usersData.users
      : null;

dotenv.config();
connectDB();

// Fungsi untuk memasukkan data (seeding)
const importData = async () => {
  try {
    if (!Array.isArray(users)) {
      throw new Error('Seed users harus berupa array. Periksa file ./data/users.js export-nya.');
    }
    // 1. Hapus semua data yang ada sebelumnya
    await Booking.deleteMany();
    await Jadwal.deleteMany();
    await Lapangan.deleteMany();
    await User.deleteMany();

    // 2. Hash password user sebelum insertMany
    const usersWithHashedPassword = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );
    await User.insertMany(usersWithHashedPassword);

    // 3. Masukkan data lapangan
    await Lapangan.insertMany(lapanganData);

    console.log('✅ Data berhasil di-import!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Fungsi untuk menghapus semua data
const destroyData = async () => {
  try {
    // Hapus semua data di koleksi
    await Booking.deleteMany();
    await Jadwal.deleteMany();
    await Lapangan.deleteMany();
    await User.deleteMany();

    console.log('✅ Data berhasil di-destroy!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Logika untuk menjalankan fungsi via command line
// Contoh: 'node seeder -d' akan menjalankan destroyData
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}