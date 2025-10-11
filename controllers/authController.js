const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Fungsi untuk generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  // Ambil semua data dari body, termasuk 'role' jika ada
  const { nama, password, no_hp, alamat, role } = req.body;

  // --- LOGIKA VALIDASI BARU ---
  // Jika ada yang mencoba mengirimkan 'role' bernilai 'admin' di body, tolak.
  if (role && role === 'admin') {
    return res.status(400).json({ message: 'Registrasi sebagai admin tidak diizinkan melalui API.' });
  }
  // --- AKHIR LOGIKA VALIDASI ---

  if (!nama || !password || !no_hp) {
    return res.status(400).json({ message: 'Nama, no_hp, dan password wajib diisi' });
  }

  try {
    const userExists = await User.findOne({ no_hp });

    if (userExists) {
      return res.status(400).json({ message: 'No HP sudah terdaftar' });
    }

    // Buat user baru, 'role' tidak diambil dari input agar selalu default 'user'
    const user = await User.create({
      nama,
      password,
      no_hp,
      alamat,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nama: user.nama,
        no_hp: user.no_hp,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Data user tidak valid' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { no_hp, password } = req.body;

  if (!no_hp || !password) {
    return res.status(400).json({ message: 'no_hp dan password wajib diisi' });
  }

  try {
    const user = await User.findOne({ no_hp });
    if (!user) {
      return res.status(401).json({ message: 'No HP atau password salah' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'No HP atau password salah' });
    }
    res.json({
      _id: user._id,
      nama: user.nama,
      no_hp: user.no_hp,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser, loginUser };