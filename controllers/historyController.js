const BookingHistory = require('../models/historyModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

// Helper untuk mencatat riwayat
const recordHistory = async ({ booking, user, action, message, meta }) => {
  try {
    await BookingHistory.create({ booking, user, action, message, meta });
  } catch (e) {
    // Jangan mematikan request utama kalau pencatatan gagal
    console.error('Gagal mencatat history:', e.message);
  }
};

// GET /api/history/my - riwayat milik user
const getMyHistory = async (req, res) => {
  try {
    const items = await BookingHistory.find({ user: req.user._id })
      .populate('booking', 'kode_booking tanggal_booking jam_mulai jam_selesai')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// GET /api/history/booking/:bookingId - riwayat satu booking (admin atau pemilik)
const getHistoryByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const filter = { booking: bookingId };
    // Admin boleh lihat semua, user seharusnya hanya lihat miliknya sendiri; validasi ownership diserahkan ke use case/opsional
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    }
    const items = await BookingHistory.find(filter)
      .populate('booking', 'kode_booking tanggal_booking jam_mulai jam_selesai')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = { recordHistory, getMyHistory, getHistoryByBooking };
 
// ========== ADMIN ENDPOINTS ==========
// GET /api/history/admin/all
// Query opsional: userId, userName, no_hp, action, bookingCode, start, end, page, limit
const adminGetAllHistory = async (req, res) => {
  try {
    const {
      userId,
      userName,
      no_hp,
      action,
      bookingCode,
      start,
      end,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Action filter
    if (action) filter.action = action;

    // Date range on history creation time
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    // Filter by user
    if (userId || userName || no_hp) {
      const userQuery = {};
      if (userId) userQuery._id = userId;
      if (userName) userQuery.nama = new RegExp(userName, 'i');
      if (no_hp) userQuery.no_hp = new RegExp(no_hp, 'i');
      const users = await User.find(userQuery).select('_id');
      const ids = users.map((u) => u._id);
      // Jika tidak ada user yang cocok, hasil pasti kosong
      if (ids.length === 0) {
        return res.json({ total: 0, page: Number(page), pages: 0, items: [] });
      }
      filter.user = { $in: ids };
    }

    // Filter by booking code
    if (bookingCode) {
      const bookings = await Booking.find({
        kode_booking: new RegExp(bookingCode, 'i'),
      }).select('_id');
      const bIds = bookings.map((b) => b._id);
      if (bIds.length === 0) {
        return res.json({ total: 0, page: Number(page), pages: 0, items: [] });
      }
      filter.booking = { $in: bIds };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      BookingHistory.countDocuments(filter),
      BookingHistory.find(filter)
        .populate('user', 'nama no_hp')
        .populate('booking', 'kode_booking tanggal_booking')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      items,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// GET /api/history/admin/by-user/:userId
const adminGetHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: userId };
    const [total, items] = await Promise.all([
      BookingHistory.countDocuments(filter),
      BookingHistory.find(filter)
        .populate('user', 'nama no_hp')
        .populate('booking', 'kode_booking tanggal_booking')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      items,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports.adminGetAllHistory = adminGetAllHistory;
module.exports.adminGetHistoryByUser = adminGetHistoryByUser;
