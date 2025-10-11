const mongoose = require('mongoose');

const jadwalSchema = mongoose.Schema(
  {
    lapangan: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Lapangan',
    },
    tanggal: {
      type: Date,
      required: true,
    },
    // Array ini akan menyimpan semua slot yang sudah dibooking pada tanggal tersebut
    slot_terisi: [
      {
        jam_mulai: { type: Number, required: true },
        jam_selesai: { type: Number, required: true },
        booking: { // Menghubungkan slot ini ke ID booking yang bersangkutan
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Booking',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Membuat index komposit untuk memastikan setiap lapangan hanya punya satu dokumen jadwal per tanggal
jadwalSchema.index({ lapangan: 1, tanggal: 1 }, { unique: true });

const Jadwal = mongoose.model('Jadwal', jadwalSchema);

module.exports = Jadwal;