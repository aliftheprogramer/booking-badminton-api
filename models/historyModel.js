// models/historyModel.js
const mongoose = require('mongoose');

const bookingHistorySchema = mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: ['booking_created', 'booking_updated', 'booking_cancelled', 'payment_updated'],
    },
    message: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }, // detail tambahan opsional
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

bookingHistorySchema.index({ booking: 1, createdAt: -1 });

const BookingHistory = mongoose.model('BookingHistory', bookingHistorySchema);
module.exports = BookingHistory;
