# Session Persistence Fix - Dokumentasi Perubahan

## Masalah yang Diperbaiki

Session hilang saat navigasi antara halaman kasir dan navbar, menyebabkan user harus login kembali. Ini terjadi karena `ProtectedRoute` tidak role-aware dan selalu redirect ke `/admin/login` tanpa mempertimbangkan role pengguna (admin vs kasir).

## Solusi yang Diterapkan

### 1. **AuthContext.tsx** - Tambah Profile State

- Menambahkan `profile` state untuk menyimpan data profil user dari database
- Menambahkan `fetchProfile()` function untuk mengambil profil saat user login
- Profile di-fetch otomatis saat session berubah (login/logout)
- Profile disimpan di context sehingga bisa diakses di seluruh aplikasi

**Keuntungan:**

- Session tetap persisten karena profile di-cache di context
- Role user tersedia untuk validasi di route protection

### 2. **ProtectedRoute.tsx** - Role-Aware Protection

- Menambahkan `requiredRole` prop untuk menentukan role yang dibutuhkan
- Validasi role sebelum render component
- Redirect ke login page yang sesuai dengan role user:
  - Kasir → `/kasir/login`
  - Admin → `/admin/login`
- Cek `is_active` status untuk memastikan akun masih aktif

**Logika:**

```
1. Jika loading → tampilkan loading spinner
2. Jika tidak ada user/profile → redirect ke login sesuai requiredRole
3. Jika ada requiredRole tapi user role tidak sesuai → redirect ke login sesuai user role
4. Jika akun tidak aktif → redirect ke login
5. Jika semua validasi pass → render component
```

### 3. **App.tsx** - Update Route Structure

- Pindahkan kasir route keluar dari LandingLayout
- Tambahkan `requiredRole="kasir"` pada kasir protected route
- Tambahkan `requiredRole="admin"` pada admin protected route
- Kasir dan admin sekarang memiliki route protection yang terpisah

**Struktur Route Baru:**

```
Landing Routes (public)
├── /
├── /katalog
├── /gallery
├── /mitra-kerja
└── /gabung-mitra

Login Routes (public)
├── /admin/login
└── /kasir/login

Protected Routes
├── /kasir (requiredRole="kasir")
└── /admin/* (requiredRole="admin")
```

## Cara Kerja Session Persistence

1. **User Login Kasir:**
   - User submit form di `/kasir/login`
   - `signIn()` authenticate via Supabase
   - Profile disimpan di AuthContext
   - Navigate ke `/kasir`

2. **User Navigate ke Navbar:**
   - Session tetap di Supabase
   - Profile tetap di AuthContext
   - Tidak ada redirect karena user masih authenticated

3. **User Kembali ke Kasir:**
   - `ProtectedRoute` check: user ada ✓, profile ada ✓, role kasir ✓
   - Render `/kasir` tanpa redirect
   - Session tetap persisten

## Testing Checklist

- [ ] Login kasir → navigate ke navbar → kembali ke kasir (tidak perlu login ulang)
- [ ] Login admin → navigate ke dashboard → kembali ke admin (tidak perlu login ulang)
- [ ] Kasir coba akses `/admin` → redirect ke `/kasir/login`
- [ ] Admin coba akses `/kasir` → redirect ke `/admin/login`
- [ ] Logout → redirect ke login page yang sesuai
- [ ] Refresh page saat authenticated → tetap authenticated
- [ ] Akun tidak aktif → redirect ke login

## Files yang Diubah

1. `src/context/AuthContext.tsx`
   - Tambah `profile` state
   - Tambah `fetchProfile()` function
   - Update context value

2. `src/app/ProtectedRoute.tsx`
   - Tambah `requiredRole` prop
   - Update validasi logic
   - Role-aware redirect

3. `src/app/App.tsx`
   - Pindahkan kasir route
   - Tambah `requiredRole` pada protected routes
