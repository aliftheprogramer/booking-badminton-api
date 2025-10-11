const express = require('express');
const router = express.Router();
const { getMyHistory, getHistoryByBooking, adminGetAllHistory, adminGetHistoryByUser } = require('../controllers/historyController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Riwayat milik user yang login
router.get('/my', protect, getMyHistory);

// Riwayat per booking: admin bisa lihat semua, user hanya miliknya (divalidasi di controller)
router.get('/booking/:bookingId', protect, getHistoryByBooking);

// ========== ADMIN ONLY ========== 
router.get('/admin/all', protect, admin, adminGetAllHistory);
router.get('/admin/by-user/:userId', protect, admin, adminGetHistoryByUser);

module.exports = router;
