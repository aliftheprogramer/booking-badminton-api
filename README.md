# Booking Badminton API

API untuk manajemen pengguna, lapangan, dan booking badminton dengan autentikasi JWT serta role-based access (user/admin).

Base URL default: http://localhost:5000

## Fitur
- Register & Login via no_hp + password
- Role: user dan admin
- CRUD Lapangan (admin), lihat lapangan (user/admin)
- Booking lapangan (user), riwayat booking (user), lihat semua booking (admin)

## Environment Variables (.env)
Wajib menyiapkan file `.env` di root project:
- MONGO_URI= mongodb connection string (Atlas/Local)
- JWT_SECRET= secret untuk signing JWT
- Optional: PORT, HOST

Contoh (lihat `.env` di repo ini):
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority&appName=<app>
JWT_SECRET=your_jwt_secret_key
```

## Menjalankan Aplikasi
- Install dependencies: npm install
- Jalankan server development: npm run dev
- Jalankan server production: npm start

## Seed Data (opsional)
- Menambah data awal Users & Lapangan: npm run seed
- Menghapus semua data: npm run seed:destroy

Akun default dari seed:
- Admin: no_hp 081234567890, password passwordadmin
- User: no_hp 089876543210, password passworduser

## Autentikasi
Gunakan header Authorization pada endpoint yang dilindungi:
- Authorization: Bearer <JWT_TOKEN>

Cara mendapatkan token: Login terlebih dahulu.

---

## Endpoints

### 1) Auth

1. Register
- Method: POST
- URL: /api/auth/register
- Body (JSON):
```
{
	"nama": "Nama User",
	"no_hp": "081234567891",
	"password": "passworduser",
	"alamat": "Alamat User (opsional)"
}
```
- Akses: Public
- Catatan: Tidak bisa registrasi sebagai admin via API (role akan default 'user').

2. Login
- Method: POST
- URL: /api/auth/login
- Body (JSON):
```
{
	"no_hp": "089876543210",
	"password": "passworduser"
}
```
- Akses: Public
- Response: Berisi token JWT yang digunakan untuk header Authorization.

---

### 2) Lapangan
Semua endpoint lapangan di-rute-kan dengan middleware `protect` (butuh token). User melihat hanya lapangan berstatus `tersedia`, Admin melihat semua.

1. List Lapangan
- Method: GET
- URL: /api/lapangan
- Header: Authorization: Bearer <token>
- Akses: user, admin
- Response: Array data lapangan (user: hanya status=tersedia; admin: semua).

2. Detail Lapangan
- Method: GET
- URL: /api/lapangan/:id
- Header: Authorization: Bearer <token>
- Akses: user, admin
- Response: Detail lapangan by id.

3. Tambah Lapangan (Admin)
- Method: POST
- URL: /api/lapangan
- Header: Authorization: Bearer <token_admin>
- Body (JSON):
```
{
	"nama": "Lapangan A",
	"deskripsi": "Lapangan sintetis",
	"harga_per_jam": 80000,
	"foto": ["https://..."],
	"status": "tersedia"
}
```
- Field wajib: nama, harga_per_jam
- status: "tersedia" | "dalam perbaikan" | "tidak tersedia"
- Akses: admin

4. Update Lapangan (Admin)
- Method: PUT
- URL: /api/lapangan/:id
- Header: Authorization: Bearer <token_admin>
- Body (JSON) opsional field:
```
{
	"nama": "Lapangan A+",
	"deskripsi": "Deskripsi baru",
	"harga_per_jam": 90000,
	"foto": ["https://..."],
	"status": "dalam perbaikan"
}
```
- Akses: admin

5. Hapus Lapangan (Admin)
- Method: DELETE
- URL: /api/lapangan/:id
- Header: Authorization: Bearer <token_admin>
- Akses: admin

---

### 3) Booking

1. Buat Booking (User)
- Method: POST
- URL: /api/bookings
- Header: Authorization: Bearer <token_user>
- Body (JSON):
```
{
	"lapanganId": "<id_lapangan>",
	"tanggal_booking": "2025-10-05",
	"jam_mulai": 14,
	"jam_selesai": 16
}
```
- Aturan:
	- Semua field wajib
	- jam_mulai < jam_selesai (format 24 jam integer)
	- Sistem cek bentrok melalui koleksi Jadwal
- Response: Data booking beserta total_harga, durasi, dll.
- Akses: user

2. Riwayat Booking Saya (User)
- Method: GET
- URL: /api/bookings/my-history
- Header: Authorization: Bearer <token_user>
- Akses: user
- Response: List booking milik user (terbaru dulu) dengan populate nama lapangan.

3. Lihat Semua Booking (Admin)
- Method: GET
- URL: /api/bookings/all
- Header: Authorization: Bearer <token_admin>
- Akses: admin
- Response: List seluruh booking (populate user dan lapangan).

---

### 4) History
History menyimpan kejadian penting terkait booking, misalnya saat booking dibuat/diperbarui/dibatalkan.

User:
- GET /api/history/my — riwayat milik user yang login.
- GET /api/history/booking/:bookingId — riwayat satu booking; user hanya melihat miliknya.

Admin:
- GET /api/history/admin/all — list riwayat dengan filter dan pagination.
	- Query opsional:
		- userId, userName, no_hp
		- action (booking_created|booking_updated|booking_cancelled|payment_updated)
		- bookingCode (cari by kode_booking)
		- start, end (ISO date untuk rentang waktu createdAt)
		- page, limit (default 1, 20)
- GET /api/history/admin/by-user/:userId — list riwayat khusus user tertentu (pagination via page, limit)

Catatan: History otomatis dicatat saat booking dibuat (action=booking_created). Tambahkan pemanggilan `recordHistory` di alur update/cancel/payment untuk melengkapi riwayat.

## Role & Akses Singkat
- Public: Register, Login
- user: 
	- GET /api/lapangan
	- GET /api/lapangan/:id
	- POST /api/bookings
	- GET /api/bookings/my-history
- admin:
	- Semua akses user, ditambah
	- POST /api/lapangan
	- PUT /api/lapangan/:id
	- DELETE /api/lapangan/:id
	- GET /api/bookings/all

## Format Error Umum
Response error menggunakan HTTP status dan properti message, contoh:
```
{ "message": "Not authorized, no token" }
```

## Catatan & Troubleshooting
- Jika koneksi MongoDB Atlas gagal dengan error DNS (queryTxt ETIMEOUT), pastikan:
	- IP address Anda di-whitelist di Atlas (Network Access)
	- DNS di jaringan Anda tidak memblokir SRV/TXT lookup; atau gunakan connection string non-SRV (mongodb://) dari Atlas Driver setup.
- Pastikan JWT_SECRET di .env terisi.

## History
History menyimpan kejadian penting terkait booking, misalnya saat booking dibuat/diperbarui/dibatalkan.

Endpoint:
- GET /api/history/my (user) — riwayat milik user yang login.
- GET /api/history/booking/:bookingId (user/admin) — riwayat untuk satu booking; admin bisa melihat semua, user hanya miliknya.

Catatan: History otomatis dicatat ketika booking dibuat (action=booking_created). Anda dapat menambahkan pencatatan tambahan pada update/cancel pembayaran dengan memanggil helper `recordHistory` di controller terkait.

## Berkas Terkait
- Routes: `routes/authRoutes.js`, `routes/lapanganRoutes.js`, `routes/bookingRoutes.js`, `routes/historyRoutes.js`
- Controllers: `controllers/authController.js`, `controllers/lapanganController.js`, `controllers/bookingController.js`, `controllers/historyController.js`
- Middleware: `middlewares/authMiddleware.js`
- Models: `models/userModel.js`, `models/lapanganModel.js`, `models/bookingModel.js`, `models/jadwalModel.js`, `models/historyModel.js`

