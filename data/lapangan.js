// Seed data untuk koleksi Lapangan (sesuai models/lapanganModel.js)
const lapangan = [
  {
    nama: 'Lapangan A',
    deskripsi: 'Lapangan sintetis standar turnamen',
    harga_per_jam: 80000,
    foto: [
      'https://example.com/lapangan-a-1.jpg',
      'https://example.com/lapangan-a-2.jpg',
    ],
    status: 'tersedia',
  },
  {
    nama: 'Lapangan B',
    deskripsi: 'Lantai kayu dengan pencahayaan bagus',
    harga_per_jam: 90000,
    foto: [
      'https://example.com/lapangan-b-1.jpg',
    ],
    status: 'tersedia',
  },
  {
    nama: 'Lapangan Outdoor',
    deskripsi: 'Lantai semen halus, untuk permainan santai.',
    harga_per_jam: 50000,
    foto: [],
    status: 'tersedia',
  },
  {
    nama: 'Lapangan VIP',
    deskripsi: 'Fasilitas premium termasuk ruang ganti pribadi.',
    harga_per_jam: 125000,
    foto: [],
    status: 'dalam perbaikan',
  },
];

module.exports = lapangan;
