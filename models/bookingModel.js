const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    kode_booking: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referensi ke model User
    },
    lapangan: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Lapangan', // Referensi ke model Lapangan
    },
    tanggal_booking: {
      type: Date,
      required: true,
    },
    jam_mulai: {
      type: Number, // Format 24 jam, contoh: 14 untuk jam 2 siang
      required: true,
    },
    jam_selesai: {
      type: Number, // Format 24 jam, contoh: 16 untuk jam 4 sore
      required: true,
    },
    durasi: {
      type: Number, // Dalam jam
      required: true,
    },
    total_harga: {
      type: Number,
      required: true,
    },
    status_pembayaran: {
      type: String,
      required: true,
      enum: ['pending', 'lunas', 'dibatalkan'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;