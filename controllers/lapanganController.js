const Lapangan = require('../models/lapanganModel');
const cloudinary = require('../config/cloudinary');

// Helper: upload Buffer ke Cloudinary
const uploadToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'lapangan',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });

// Helper: normalisasi URL foto yang dikirim via body (JSON array atau comma-separated)
const normalizeBodyFotos = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (_) {}
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * @desc    Membuat lapangan baru (Hanya Admin)
 * @route   POST /api/lapangan
 * @access  Private/Admin
 */
const createLapangan = async (req, res) => {
  const { nama, deskripsi, harga_per_jam, status } = req.body;

  if (!nama || !harga_per_jam) {
    return res.status(400).json({ message: 'Nama dan harga per jam wajib diisi' });
  }

  try {
    // Kumpulkan URL foto dari body (jika ada)
    let fotoUrls = normalizeBodyFotos(req.body?.foto);

    // Upload file gambar ke Cloudinary (jika ada file terlampir)
    if (req.files && req.files.length > 0) {
      const uploaded = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, file.originalname))
      );
      fotoUrls = [...fotoUrls, ...uploaded];
    }

    const lapangan = new Lapangan({
      nama,
      deskripsi,
      harga_per_jam,
      foto: fotoUrls,
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
  const { nama, deskripsi, harga_per_jam, status, keep_existing_photos } = req.body;

  try {
    const lapangan = await Lapangan.findById(req.params.id);

    if (lapangan) {
      // URL foto yang dikirim via body
      const fotoFromBody = normalizeBodyFotos(req.body?.foto);

      // Upload file baru (jika ada)
      let newUploads = [];
      if (req.files && req.files.length > 0) {
        newUploads = await Promise.all(
          req.files.map((file) => uploadToCloudinary(file.buffer, file.originalname))
        );
      }

      // Tentukan array foto final
      let finalFotos = lapangan.foto;
      if (keep_existing_photos === 'true') {
        finalFotos = [...lapangan.foto, ...fotoFromBody, ...newUploads];
      } else if (fotoFromBody.length > 0 || newUploads.length > 0) {
        finalFotos = [...fotoFromBody, ...newUploads];
      }

      // Update fields
      lapangan.nama = nama || lapangan.nama;
      lapangan.deskripsi = deskripsi || lapangan.deskripsi;
      lapangan.harga_per_jam = harga_per_jam || lapangan.harga_per_jam;
      lapangan.foto = finalFotos;
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