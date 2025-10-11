// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    nama: { type: String, required: true },
      // Removed email field: primary identifier is `no_hp`
    password: { type: String, required: true },
    no_hp: { type: String, required: true, unique: true },
    alamat: { type: String },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Enkripsi password sebelum disimpan
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method untuk mencocokkan password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;