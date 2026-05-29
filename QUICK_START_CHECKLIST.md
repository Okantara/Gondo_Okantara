# Quick Start Checklist - Setelah Optimization

## Sebelum Testing

### 1. Pastikan Supabase Storage Public

```
1. Buka https://app.supabase.com
2. Pilih project Anda
3. Pergi ke Storage → Buckets
4. Cari bucket "gondo-okantara"
5. Klik Settings (gear icon)
6. Pastikan "Access Control" = "Public"
7. Jika "Private", ubah ke "Public"
8. Refresh browser
```

### 2. Pastikan Data di Database

```sql
-- Jalankan di Supabase SQL Editor
-- Cek slides
SELECT id, image_url, title, is_active FROM slides LIMIT 5;

-- Cek keunggulan
SELECT id, gambar, title FROM keunggulan LIMIT 5;

-- Cek profiles
SELECT id, username, email, role, is_active FROM profiles LIMIT 5;
```

---

## Testing Checklist

### Test 1: Landing Page - Gambar

- [ ] Buka http://localhost:5173 (atau URL project Anda)
- [ ] Lihat Hero section (bagian atas)
- [ ] Pastikan gambar muncul (bukan blank/error)
- [ ] Jika tidak muncul, buka DevTools (F12) → Console
- [ ] Lihat error messages
- [ ] Cek apakah bucket public (lihat Step 1 di atas)

### Test 2: Landing Page - Features

- [ ] Scroll ke bawah
- [ ] Lihat Features section
- [ ] Pastikan gambar/icon muncul
- [ ] Jika tidak muncul, cek console untuk errors

### Test 3: Login Kasir

- [ ] Buka http://localhost:5173/kasir/login
- [ ] Buka DevTools (F12) → Console
- [ ] Masukkan username kasir
- [ ] Masukkan password
- [ ] Klik "Login Kasir"
- [ ] Lihat console log: `Login took XXXms`
- [ ] Pastikan loading tidak lebih dari 5 detik
- [ ] Setelah login, harus langsung ke `/kasir` (bukan `/kasir/login`)
- [ ] Jika redirect ke `/kasir/login`, ada error di console

### Test 4: Login Admin

- [ ] Buka http://localhost:5173/admin/login
- [ ] Buka DevTools (F12) → Console
- [ ] Masukkan username admin
- [ ] Masukkan password
- [ ] Klik "Login"
- [ ] Lihat console log: `Login took XXXms`
- [ ] Pastikan loading tidak lebih dari 5 detik
- [ ] Setelah login, harus langsung ke `/admin` (bukan `/admin/login`)

### Test 5: Session Persistence - Kasir

- [ ] Login kasir (sudah di `/kasir`)
- [ ] Buka navbar (klik menu)
- [ ] Navigate ke halaman lain (misal `/katalog`)
- [ ] Kembali ke `/kasir`
- [ ] Pastikan tidak perlu login ulang
- [ ] Refresh page
- [ ] Pastikan masih authenticated (tidak redirect ke login)

### Test 6: Session Persistence - Admin

- [ ] Login admin (sudah di `/admin`)
- [ ] Navigate ke halaman lain (misal `/admin/profile`)
- [ ] Kembali ke `/admin`
- [ ] Pastikan tidak perlu login ulang
- [ ] Refresh page
- [ ] Pastikan masih authenticated (tidak redirect ke login)

### Test 7: Role Protection

- [ ] Login kasir
- [ ] Coba akses `/admin` (ketik di URL bar)
- [ ] Harus redirect ke `/kasir/login` (bukan `/admin/login`)
- [ ] Login admin
- [ ] Coba akses `/kasir` (ketik di URL bar)
- [ ] Harus redirect ke `/admin/login` (bukan `/kasir/login`)

### Test 8: Logout

- [ ] Login kasir
- [ ] Logout (cari tombol logout)
- [ ] Harus redirect ke `/kasir/login`
- [ ] Login admin
- [ ] Logout
- [ ] Harus redirect ke `/admin/login`

---

## Performance Monitoring

### Cek Loading Time

1. Buka DevTools (F12) → Console
2. Login
3. Lihat log: `Login took XXXms`
4. Catat waktu:
   - **< 1 detik**: Excellent ✓
   - **1-2 detik**: Good ✓
   - **2-3 detik**: Acceptable ✓
   - **> 3 detik**: Slow ⚠️

### Cek Network Speed

1. DevTools → Network tab
2. Refresh page
3. Lihat request ke Supabase:
   - `auth.supabase.co` - Auth request
   - `xnxczlhkwqftylxdmxeh.supabase.co` - Database request
4. Catat waktu setiap request

### Cek Image Loading

1. DevTools → Network tab
2. Filter: `img`
3. Lihat image requests
4. Catat waktu loading
5. Jika > 2 detik, kemungkinan image size terlalu besar

---

## Troubleshooting

### Gambar Tidak Muncul

```
1. Cek Supabase Storage bucket public (lihat Step 1)
2. Cek path gambar di database (lihat Step 2)
3. Buka DevTools → Console
4. Lihat error messages
5. Cek image URL langsung di browser
```

### Loading Lama

```
1. Cek network speed (DevTools → Network)
2. Jika > 2 detik, kemungkinan network issue
3. Cek Supabase server status
4. Coba login lagi (mungkin cache membantu)
5. Jika masih lambat, tambah index di database
```

### Login Redirect Salah

```
1. Buka DevTools → Console
2. Lihat error messages
3. Cek apakah profile ter-fetch
4. Cek apakah role sesuai (admin/kasir)
5. Cek ProtectedRoute logic
```

### Session Hilang Saat Refresh

```
1. Buka DevTools → Application → Cookies
2. Cek apakah session cookie ada
3. Cek apakah localStorage ada
4. Cek Supabase auth session
5. Cek browser console untuk errors
```

---

## Debug Commands

### Di Browser Console:

```javascript
// Cek current user
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Current user:", user);

// Cek session
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Current session:", session);

// Cek profile
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
console.log("Profile:", profile);

// Test image URL
const imageUrl = supabase.storage
  .from("gondo-okantara")
  .getPublicUrl("slides/hero.jpg").data.publicUrl;
console.log("Image URL:", imageUrl);
```

---

## Files untuk Reference

- `DEBUGGING_GUIDE.md` - Detailed debugging guide
- `OPTIMIZATION_SUMMARY.md` - Optimization details
- `SESSION_FIX_V2.md` - Session fix documentation

---

## Jika Masih Ada Issue

1. **Buka DevTools (F12)**
2. **Pergi ke Console tab**
3. **Catat semua error messages**
4. **Pergi ke Network tab**
5. **Catat request time ke Supabase**
6. **Share error messages dan network timing**

---

## Success Indicators ✓

- [ ] Landing page gambar muncul
- [ ] Login kasir < 3 detik
- [ ] Login admin < 3 detik
- [ ] Kasir session persisten saat navigate
- [ ] Admin session persisten saat refresh
- [ ] Role protection bekerja
- [ ] Logout bekerja
- [ ] Console tidak ada error

Jika semua checklist ✓, optimization berhasil!
