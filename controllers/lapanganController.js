const Lapangan = require('../models/lapanganModel');

/**
 * @desc    Membuat lapangan baru (Hanya Admin)
 * @route   POST /api/lapangan
 * @access  Private/Admin
 */
const createLapangan = async (req, res) => {
  const { nama, deskripsi, harga_per_jam, foto, status } = req.body;

  if (!nama || !harga_per_jam) {
    return res.status(400).json({ message: 'Nama dan harga per jam wajib diisi' });
  }

  try {
    const lapangan = new Lapangan({
      nama,
      deskripsi,
      harga_per_jam,
      foto,
      status,
    });

    const createdLapangan = await lapangan.save();
    res.status(201).json(createdLapangan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Mendapatkan semua data lapangan (Untuk User & Admin)
 * @route   GET /api/lapangan
 * @access  Public
 */
const getAllLapangan = async (req, res) => {
  try {
    const query = req.user && req.user.role === 'admin' ? {} : { status: 'tersedia' };
    const lapangan = await Lapangan.find(query);
    res.json(lapangan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Mendapatkan detail satu lapangan by ID (Untuk User & Admin)
 * @route   GET /api/lapangan/:id
 * @access  Public
 */
const getLapanganById = async (req, res) => {
  try {
    const lapangan = await Lapangan.findById(req.params.id);

    if (lapangan) {
      res.json(lapangan);
    } else {
      res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Update data lapangan (Hanya Admin)
 * @route   PUT /api/lapangan/:id
 * @access  Private/Admin
 */
const updateLapangan = async (req, res) => {
  const { nama, deskripsi, harga_per_jam, foto, status } = req.body;

  try {
    const lapangan = await Lapangan.findById(req.params.id);

    if (lapangan) {
      lapangan.nama = nama || lapangan.nama;
      lapangan.deskripsi = deskripsi || lapangan.deskripsi;
      lapangan.harga_per_jam = harga_per_jam || lapangan.harga_per_jam;
      lapangan.foto = foto || lapangan.foto;
      lapangan.status = status || lapangan.status;

      const updatedLapangan = await lapangan.save();
      res.json(updatedLapangan);
    } else {
      res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Menghapus lapangan (Hanya Admin)
 * @route   DELETE /api/lapangan/:id
 * @access  Private/Admin
 */
const deleteLapangan = async (req, res) => {
  try {
    const lapangan = await Lapangan.findById(req.params.id);

    if (lapangan) {
      await lapangan.deleteOne();
      res.json({ message: 'Lapangan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


module.exports = {
  createLapangan,
  getAllLapangan,
  getLapanganById,
  updateLapangan,
  deleteLapangan
};