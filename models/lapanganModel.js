// models/lapanganModel.js
const mongoose = require('mongoose');

const lapanganSchema = mongoose.Schema(
  {
    nama: { type: String, required: true },
    deskripsi: { type: String },
    harga_per_jam: { type: Number, required: true },
    foto: [{ type: String }],
    status: {
      type: String,
      required: true,
      enum: ['tersedia', 'dalam perbaikan', 'tidak tersedia'],
      default: 'tersedia',
    },
  },
  { timestamps: true }
);

const Lapangan = mongoose.model('Lapangan', lapanganSchema);
module.exports = Lapangan;