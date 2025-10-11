const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');

// == RUTE UNTUK USER ==
// POST /api/bookings -> Membuat booking baru
router.post('/', protect, createBooking); 

// GET /api/bookings/my-history -> Melihat riwayat booking user
router.get('/my-history', protect, getMyBookings);

// == RUTE UNTUK ADMIN ==
// GET /api/bookings/all -> Melihat semua bookingan
router.get('/all', protect, admin, getAllBookings);

module.exports = router;