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

// Rute untuk melihat data lapangan (bisa diakses user biasa dan admin)
router.route('/').get(protect, getAllLapangan);
router.route('/:id').get(protect, getLapanganById);

// Rute khusus Admin untuk CUD (Create, Update, Delete)
router.route('/').post(protect, admin, createLapangan);
router.route('/:id').put(protect, admin, updateLapangan);
router.route('/:id').delete(protect, admin, deleteLapangan);

module.exports = router;