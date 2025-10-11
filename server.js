const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const lapanganRoutes = require('./routes/lapanganRoutes');
const bookingsRoutes = require('./routes/bookingRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/lapangan', lapanganRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/history', historyRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;

app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode at http://${displayHost}:${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});