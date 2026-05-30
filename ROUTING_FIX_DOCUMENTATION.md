# Dokumentasi Perbaikan Routing Admin & Kasir

## Masalah yang Diperbaiki

1. **Login Admin dan Kasir Tidak Terpisah** - Sebelumnya tidak ada validasi role saat login
2. **Admin Bisa Redirect ke Kasir** - ProtectedRoute tidak cukup ketat dalam validasi role
3. **Kasir Bisa Redirect ke Admin** - Sebaliknya juga bisa terjadi
4. **Tidak Ada Logout Button** - User tidak bisa logout dengan mudah

## Solusi yang Diterapkan

### 1. UnifiedLoginPage (`src/app/auth/UnifiedLoginPage.tsx`)

- **Dibuat file baru** untuk menangani login terpadu
- **Mode login**: `admin`, `kasir`, atau `auto`
- **Validasi role ketat**:
  - Jika login di `/admin/login`, hanya akun admin yang bisa login
  - Jika login di `/kasir/login`, hanya akun kasir yang bisa login
  - Jika login gagal validasi role, tampilkan error message
- **Auto-redirect**: Jika sudah login, langsung redirect ke dashboard yang sesuai

### 2. ProtectedRoute (`src/app/ProtectedRoute.tsx`)

- **Validasi role lebih ketat**:
  - Jika user kasir mencoba akses `/admin`, redirect ke `/kasir/login`
  - Jika user admin mencoba akses `/kasir`, redirect ke `/admin/login`
  - Tidak lagi redirect ke dashboard, tapi ke login page yang sesuai
- **Alasan**: Memastikan user tidak bisa "masuk" ke area yang bukan miliknya

### 3. Navbar (`src/app/landing/Navbar.tsx`)

- **Tambah logout button** untuk user yang sudah login
- **Smart Kasir link**:
  - Jika user sudah login sebagai kasir: link ke `/kasir` (dashboard)
  - Jika user belum login: link ke `/kasir/login` (login page)
- **Logout hanya tampil** jika user sudah login

### 4. Order (Kasir) (`src/app/Kasir/Order.tsx`)

- **Tambah top bar** dengan logout button
- **Logout button** di atas halaman kasir untuk kemudahan akses

### 5. App.tsx

- **Reorganisasi routes**:
  - Login pages di luar LandingLayout
  - Kasir protected route di luar LandingLayout
  - Admin protected route tetap terpisah
- **Alasan**: Memastikan routing lebih jelas dan tidak ada konflik

## Flow Login yang Benar

### Admin Login

```
1. User klik "Login Admin" atau akses /admin/login
2. Masuk ke UnifiedLoginPage dengan mode="admin"
3. Input username & password
4. Validasi: Hanya akun dengan role="admin" yang bisa login
5. Jika berhasil → Redirect ke /admin (Dashboard Admin)
6. Jika gagal → Tampilkan error message
```

### Kasir Login

```
1. User klik icon Kasir di navbar atau akses /kasir/login
2. Masuk ke UnifiedLoginPage dengan mode="kasir"
3. Input username & password
4. Validasi: Hanya akun dengan role="kasir" yang bisa login
5. Jika berhasil → Redirect ke /kasir (Order Page)
6. Jika gagal → Tampilkan error message
```

### Logout

```
1. Admin: Klik "Logout" di sidebar dashboard
2. Kasir: Klik "Logout" di top bar order page
3. Navbar: Klik "Logout" button (jika sudah login)
4. Redirect ke login page yang sesuai dengan role
```

## Keamanan

- **Role Validation**: Setiap login divalidasi berdasarkan role
- **Protected Routes**: Hanya user dengan role yang tepat bisa akses area tertentu
- **Session Management**: Logout membersihkan session dan redirect ke login
- **No Cross-Role Access**: Admin tidak bisa akses kasir dan sebaliknya

## Testing Checklist

- [ ] Admin login dengan akun admin → Berhasil masuk dashboard
- [ ] Admin login dengan akun kasir → Error message
- [ ] Kasir login dengan akun kasir → Berhasil masuk order page
- [ ] Kasir login dengan akun admin → Error message
- [ ] Admin logout → Redirect ke /admin/login
- [ ] Kasir logout → Redirect ke /kasir/login
- [ ] Admin akses /kasir → Redirect ke /admin/login
- [ ] Kasir akses /admin → Redirect ke /kasir/login
- [ ] Navbar logout button → Logout dan redirect ke home
- [ ] Kasir icon di navbar (logged in) → Ke /kasir
- [ ] Kasir icon di navbar (not logged in) → Ke /kasir/login
