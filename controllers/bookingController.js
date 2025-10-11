const Booking = require('../models/bookingModel');
const Lapangan = require('../models/lapanganModel');
const Jadwal = require('../models/jadwalModel');
const { recordHistory } = require('./historyController');

/**
 * @desc    Membuat booking baru (Hanya User)
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  const { lapanganId, tanggal_booking, jam_mulai, jam_selesai } = req.body;

  try {
    if (!lapanganId || !tanggal_booking || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    if (jam_mulai >= jam_selesai) {
      return res.status(400).json({ message: 'Jam selesai harus setelah jam mulai' });
    }

    const lapangan = await Lapangan.findById(lapanganId);
    if (!lapangan || lapangan.status !== 'tersedia') {
      return res.status(404).json({ message: 'Lapangan tidak ditemukan atau sedang tidak tersedia' });
    }

    const tanggal = new Date(new Date(tanggal_booking).setHours(0, 0, 0, 0));
    const jadwal = await Jadwal.findOne({ lapangan: lapanganId, tanggal });

    if (jadwal) {
      const isBentrok = jadwal.slot_terisi.some(
        slot => jam_mulai < slot.jam_selesai && jam_selesai > slot.jam_mulai
      );
      if (isBentrok) {
        return res.status(400).json({ message: 'Jadwal pada jam tersebut sudah terisi (bentrok)' });
      }
    }

    const durasi = jam_selesai - jam_mulai;
    const total_harga = durasi * lapangan.harga_per_jam;
    const kode_booking = `BKG-${Date.now()}`;

    const booking = await Booking.create({
      kode_booking,
      user: req.user._id,
      lapangan: lapanganId,
      tanggal_booking: tanggal,
      jam_mulai,
      jam_selesai,
      durasi,
      total_harga,
    });

    if (jadwal) {
      jadwal.slot_terisi.push({ jam_mulai, jam_selesai, booking: booking._id });
      await jadwal.save();
    } else {
      await Jadwal.create({
        lapangan: lapanganId,
        tanggal,
        slot_terisi: [{ jam_mulai, jam_selesai, booking: booking._id }],
      });
    }

    // Catat history booking dibuat
    recordHistory({
      booking: booking._id,
      user: req.user._id,
      action: 'booking_created',
      message: `Booking dibuat untuk lapangan ${lapangan.nama} ${tanggal.toISOString().slice(0,10)} ${jam_mulai}-${jam_selesai}`,
      meta: { jam_mulai, jam_selesai, total_harga },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Melihat riwayat booking (Hanya User)
 * @route   GET /api/bookings/my-history
 * @access  Private
 */
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
          .populate('lapangan', 'nama')
          .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
}

/**
 * @desc    Melihat daftar semua bookingan (Hanya Admin)
 * @route   GET /api/bookings/all
 * @access  Private/Admin
 */
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
          .populate('user', 'nama no_hp')
          .populate('lapangan', 'nama')
          .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
}

module.exports = { createBooking, getMyBookings, getAllBookings };