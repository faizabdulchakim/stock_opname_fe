# 📦 Stock Opname Frontend (Pure React.js)

Aplikasi web Frontend untuk manajemen **Stock Opname & Async Inventory Reconciliation** yang dibangun menggunakan **React.js murni (Create React App / `react-scripts`), Pure React Hooks (Context API), Vanilla CSS Modern, dan Jest Testing Library**.

---

## 🚀 Fitur Utama (Fase 1: Authentication & Role Experience)

- 🔐 **Autentikasi Terintegrasi**: Terhubung ke Backend API (`http://localhost:3000/api/auth/login`).
- ⚡ **1-Click Demo Fill**: Tombol praktis untuk mengisi otomatis akun demo **Manager Gudang** atau **Staf Gudang**.
- 🛡️ **Role-Differentiated Landing View**: Menampilkan visual identitas dan hak akses yang berbeda antara:
  - **`WAREHOUSE_MANAGER`**: Inisiasi audit, review variance, dan approval.
  - **`WAREHOUSE_STAFF`**: Melihat sesi audit dan memasukkan hitungan fisik barang batch.
- 🧪 **Unit Testing (Jest + React Testing Library)**: Pengujian form input, validasi error, dan integrasi AuthContext.

---

## 📁 Struktur Direktori

```
stock_opname_fe/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── api/
│   │   ├── client.js           # Fetch API wrapper dengan Authorization Bearer Token
│   │   └── auth.api.js         # Endpoint Login & Profile API callers
│   ├── context/
│   │   └── AuthContext.jsx     # Context State Management (user, token, login, logout)
│   ├── components/
│   │   ├── LoginForm.jsx       # Form Login modern interaktif
│   │   ├── Navbar.jsx          # Bar navigasi dengan badge role & tombol logout
│   │   └── DashboardHome.jsx   # Beranda dashboard spesifik per role
│   ├── styles/
│   │   ├── App.css             # Styling layout, form, & card
│   │   └── index.css           # Styling dasar, CSS variables, typography
│   ├── tests/
│   │   ├── LoginForm.test.jsx  # Unit test Form Login & validasi
│   │   └── App.test.jsx        # Unit test render root App
│   ├── App.jsx                 # Root component
│   ├── index.js                # React DOM render entry
│   └── setupTests.js           # Jest DOM matchers
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Cara Menjalankan Frontend

### 1. Pastikan Backend API Aktif
Pastikan Backend di folder `stock_opname` sudah berjalan di port 3000 (`http://localhost:3000`).

### 2. Jalankan Frontend
```bash
# 1. Pindah ke direktori frontend
cd C:\Users\user\Documents\test\stock_opname_fe

# 2. Jalankan development server
npm start
```
Aplikasi akan otomatis terbuka di browser pada `http://localhost:3001` (atau `http://localhost:3000`).

---

## 🧪 Menjalankan Unit Tests

Untuk menjalankan unit test Jest bawaan React:
```bash
npm test
```
