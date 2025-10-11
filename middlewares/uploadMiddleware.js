const multer = require('multer');
const path = require('path');

// Menggunakan MemoryStorage untuk menyimpan file sebagai buffer di memori
const storage = multer.memoryStorage();

// Fungsi untuk memfilter tipe file (hanya menerima gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif)'));
};

// Inisialisasi Multer dengan konfigurasi storage dan file filter
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
  fileFilter,
});

module.exports = upload;