# Dokumentasi Perbaikan Routing Admin & Kasir - V2

## Masalah yang Diperbaiki

1. **Login Admin dan Kasir Tidak Terpisah** - Tidak ada validasi role saat login
2. **Admin Bisa Redirect ke Kasir** - ProtectedRoute tidak cukup ketat
3. **Kasir Bisa Redirect ke Admin** - Sebaliknya juga bisa terjadi
4. **Tidak Ada Logout Button** - User tidak bisa logout dengan mudah
5. **Login Ganda dengan Role Berbeda** - User bisa login sebagai admin di window 1 dan kasir di window 2 dalam 1 browser (MASALAH UTAMA)

## Solusi yang Diterapkan

### 1. UnifiedLoginPage - Konfirmasi Logout Sebelum Login Baru

**File**: `src/app/auth/UnifiedLoginPage.tsx`

**Fitur Baru**:

- Deteksi jika user sudah login dengan role berbeda
- Muncul dialog konfirmasi: "Anda sudah login sebagai [role]. Apakah Anda ingin logout dan login sebagai [role baru]?"
- Jika user konfirmasi: Logout session lama, login dengan akun baru
- Jika user batal: Tetap login dengan session lama

**Contoh Skenario**:

```
1. User login sebagai admin di window 1
2. Buka window 2, akses /kasir/login
3. Input username & password kasir
4. Dialog muncul: "Anda sudah login sebagai admin. Apakah Anda ingin logout dan login sebagai kasir?"
5. Jika ya: Admin logout, kasir login berhasil
6. Jika tidak: Tetap login sebagai admin, window 2 tetap di login page
```

### 2. ProtectedRoute - Logout Otomatis Jika Role Mismatch

**File**: `src/app/ProtectedRoute.tsx`

**Fitur Baru**:

- Deteksi jika user mencoba akses area dengan role berbeda
- Logout otomatis
- Redirect ke login page yang sesuai dengan role user

**Contoh Skenario**:

```
1. User login sebagai admin di window 1
2. Buka window 2, akses /kasir
3. ProtectedRoute mendeteksi: user adalah admin, tapi route membutuhkan kasir
4. Logout otomatis
5. Redirect ke /kasir/login
```

### 3. Navbar - Smart Logout Button

**File**: `src/app/landing/Navbar.tsx`

**Fitur**:

- Logout button hanya tampil jika user sudah login
- Kasir link smart: ke `/kasir` jika sudah login, ke `/kasir/login` jika belum

### 4. Order (Kasir) - Top Bar dengan Logout

**File**: `src/app/Kasir/Order.tsx`

**Fitur**:

- Top bar dengan logout button
- Logout button di atas halaman untuk kemudahan akses

### 5. App.tsx - Reorganisasi Routes

**File**: `src/app/App.tsx`

**Perubahan**:

- Login pages di luar LandingLayout
- Kasir protected route di luar LandingLayout
- Admin protected route tetap terpisah

## Flow Login yang Benar

### Skenario 1: Login Admin Pertama Kali

```
1. Akses /admin/login
2. Input username & password admin
3. Validasi: Hanya akun admin yang bisa login
4. Berhasil → Redirect ke /admin (Dashboard Admin)
```

### Skenario 2: Login Kasir Pertama Kali

```
1. Akses /kasir/login
2. Input username & password kasir
3. Validasi: Hanya akun kasir yang bisa login
4. Berhasil → Redirect ke /kasir (Order Page)
```

### Skenario 3: Login Admin, Kemudian Login Kasir (PENTING)

```
1. Login sebagai admin di window 1
2. Buka window 2, akses /kasir/login
3. Input username & password kasir
4. Dialog: "Anda sudah login sebagai admin. Apakah Anda ingin logout dan login sebagai kasir?"
5. Jika ya:
   - Admin logout
   - Kasir login berhasil
   - Window 1 redirect ke /admin/login (karena session admin sudah logout)
   - Window 2 redirect ke /kasir (kasir dashboard)
6. Jika tidak:
   - Tetap login sebagai admin
   - Window 2 tetap di /kasir/login
```

### Skenario 4: Login Admin, Akses /kasir di Window 2 (PENTING)

```
1. Login sebagai admin di window 1
2. Buka window 2, akses /kasir
3. ProtectedRoute mendeteksi role mismatch
4. Logout otomatis
5. Redirect ke /kasir/login
6. Window 1 juga redirect ke /admin/login (karena session admin sudah logout)
```

### Skenario 5: Logout

```
1. Admin: Klik "Logout" di sidebar dashboard
2. Kasir: Klik "Logout" di top bar order page
3. Navbar: Klik "Logout" button
4. Redirect ke login page yang sesuai
```

## Keamanan

✅ **Role Validation**: Setiap login divalidasi berdasarkan role
✅ **Protected Routes**: Hanya user dengan role yang tepat bisa akses area tertentu
✅ **Session Management**: Logout membersihkan session dan redirect ke login
✅ **No Cross-Role Access**: Admin tidak bisa akses kasir dan sebaliknya
✅ **Single Role Per Browser**: Hanya 1 role yang bisa aktif per browser
✅ **Konfirmasi Logout**: User diminta konfirmasi sebelum logout dan login dengan role berbeda
✅ **Logout Otomatis**: Jika mencoba akses area dengan role berbeda, logout otomatis

## Testing Checklist

### Login Tests

- [ ] Admin login dengan akun admin → Berhasil masuk dashboard
- [ ] Admin login dengan akun kasir → Error message
- [ ] Kasir login dengan akun kasir → Berhasil masuk order page
- [ ] Kasir login dengan akun admin → Error message

### Logout Tests

- [ ] Admin logout → Redirect ke /admin/login
- [ ] Kasir logout → Redirect ke /kasir/login
- [ ] Navbar logout button → Logout dan redirect ke home

### Cross-Role Access Tests

- [ ] Admin akses /kasir → Logout otomatis, redirect ke /kasir/login
- [ ] Kasir akses /admin → Logout otomatis, redirect ke /admin/login

### Multi-Window Tests (PENTING)

- [ ] Login admin window 1, login kasir window 2 → Dialog konfirmasi muncul
- [ ] Konfirmasi logout → Admin logout, kasir login berhasil, window 1 redirect ke /admin/login
- [ ] Batal logout → Tetap login sebagai admin, window 2 tetap di /kasir/login
- [ ] Login admin window 1, akses /kasir window 2 → Logout otomatis, redirect ke /kasir/login
- [ ] Login kasir window 1, akses /admin window 2 → Logout otomatis, redirect ke /admin/login

### Navigation Tests

- [ ] Kasir icon di navbar (logged in) → Ke /kasir
- [ ] Kasir icon di navbar (not logged in) → Ke /kasir/login
- [ ] Logout button di navbar (logged in) → Logout dan redirect ke home
- [ ] Logout button di navbar (not logged in) → Tidak tampil

## Catatan Penting

1. **Session Shared Across Windows**: Karena session disimpan di browser level, logout di 1 window akan mempengaruhi window lain
2. **Dialog Konfirmasi**: User akan diminta konfirmasi sebelum logout dan login dengan role berbeda
3. **Logout Otomatis**: Jika user mencoba akses area dengan role berbeda, logout otomatis tanpa konfirmasi
4. **Role Validation**: Setiap login divalidasi berdasarkan role, tidak bisa login dengan role yang salah
