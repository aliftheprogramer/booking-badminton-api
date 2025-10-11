const express = require('express');
const router = express.Router();
const {
  createLapangan,
  getAllLapangan,
  getLapanganById,
  updateLapangan,
  deleteLapangan,
} = require('../controllers/lapanganController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Rute untuk melihat data lapangan (bisa diakses user biasa dan admin)
router.route('/').get(protect, getAllLapangan);
router.route('/:id').get(protect, getLapanganById);

// Rute khusus Admin untuk CUD (Create, Update, Delete)
router.route('/').post(protect, admin, upload.array('foto', 5), createLapangan);
router.route('/:id').put(protect, admin, upload.array('foto', 5), updateLapangan);
router.route('/:id').delete(protect, admin, deleteLapangan);

module.exports = router;