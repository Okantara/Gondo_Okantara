# Session Persistence Fix - Version 2 (Bug Fix)

## Masalah yang Diperbaiki

### Issue 1: Login Kasir Redirect ke Admin Login

- Saat login kasir berhasil, user di-redirect ke `/kasir/login` (admin login) daripada `/kasir`
- Ini terjadi karena timing issue: `navigate()` dipanggil sebelum profile ter-set di context

### Issue 2: Admin Logout saat Refresh

- Saat admin refresh page, session hilang dan harus login ulang
- Ini terjadi karena profile fetch tidak selesai sebelum ProtectedRoute check

## Root Cause Analysis

**Timing Issue:**

```
1. User submit login form
2. signIn() authenticate via Supabase
3. navigate("/kasir") dipanggil IMMEDIATELY
4. ProtectedRoute check: profile belum ter-set → redirect ke login
5. onAuthStateChange callback baru trigger dan fetch profile
```

## Solusi yang Diterapkan

### 1. **LoginKasir.tsx & LoginPage.tsx** - Tambah Delay

```typescript
// Delay sedikit untuk memastikan profile sudah ter-set di context
setTimeout(() => {
  navigate("/kasir");
}, 100);
```

Ini memberikan waktu untuk:

- `onAuthStateChange` callback trigger
- `fetchProfile()` selesai
- Profile ter-set di context
- Baru kemudian navigate

### 2. **AuthContext.tsx** - Async Profile Fetch

```typescript
supabase.auth.onAuthStateChange(async (_event, session) => {
  setSession(session);
  setUser(session?.user ?? null);

  if (session?.user) {
    await fetchProfile(session.user.id); // WAIT for profile
  } else {
    setProfile(null);
  }
  setLoading(false);
});
```

Memastikan `fetchProfile()` selesai sebelum `setLoading(false)`.

### 3. **ProtectedRoute.tsx** - Remove Location Dependency

Menghapus `location` dari dependency array untuk mencegah infinite loop.

## Flow Diagram

### Sebelum Fix:

```
Login Form Submit
    ↓
signIn() → authenticate
    ↓
navigate("/kasir") ← IMMEDIATE
    ↓
ProtectedRoute check: profile = null ✗
    ↓
Redirect to /kasir/login ✗
    ↓
onAuthStateChange trigger (terlambat)
    ↓
fetchProfile() selesai
```

### Sesudah Fix:

```
Login Form Submit
    ↓
signIn() → authenticate
    ↓
setTimeout(() => navigate("/kasir"), 100) ← DELAY
    ↓
onAuthStateChange trigger
    ↓
fetchProfile() selesai
    ↓
profile ter-set di context ✓
    ↓
setTimeout callback execute: navigate("/kasir")
    ↓
ProtectedRoute check: profile ada ✓, role kasir ✓
    ↓
Render /kasir ✓
```

## Testing Checklist

- [ ] Login kasir → langsung ke `/kasir` (bukan `/kasir/login`)
- [ ] Login admin → langsung ke `/admin` (bukan `/admin/login`)
- [ ] Kasir navigate ke navbar → kembali ke kasir (tidak perlu login)
- [ ] Admin refresh page → tetap authenticated (tidak perlu login)
- [ ] Kasir coba akses `/admin` → redirect ke `/kasir/login`
- [ ] Admin coba akses `/kasir` → redirect ke `/admin/login`
- [ ] Logout → redirect ke login page yang sesuai
- [ ] Akun tidak aktif → redirect ke login

## Files yang Diubah

1. **src/context/AuthContext.tsx**
   - Async profile fetch di onAuthStateChange
   - Proper error handling

2. **src/app/Kasir/LoginKasir.tsx**
   - Tambah 100ms delay sebelum navigate

3. **src/app/admin/LoginPage.tsx**
   - Tambah 100ms delay sebelum navigate

4. **src/app/ProtectedRoute.tsx**
   - Remove location dari dependency array

## Notes

- Delay 100ms adalah minimal untuk memastikan profile ter-set
- Bisa di-adjust jika diperlukan (misal 200ms untuk koneksi lambat)
- Ini adalah solusi temporary yang robust
- Untuk solusi permanent, bisa menggunakan React Query atau SWR untuk caching
