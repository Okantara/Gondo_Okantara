# Debugging Guide - Image & Loading Issues

## Masalah 1: Landing Tidak Ada Gambar

### Penyebab Kemungkinan:

1. **Storage bucket tidak public** - Supabase storage bucket harus di-set public
2. **Path gambar salah** - Path di database tidak sesuai dengan struktur folder di storage
3. **Bucket name salah** - Nama bucket di `imageUtils.ts` tidak sesuai dengan nama di Supabase

### Cara Debug:

#### Step 1: Cek Supabase Storage Settings

1. Buka Supabase Dashboard
2. Pergi ke Storage → Buckets
3. Cari bucket `gondo-okantara`
4. Pastikan **Access Control** = **Public**
5. Jika private, ubah ke public

#### Step 2: Cek Path Gambar di Database

1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Jalankan query:

```sql
SELECT id, image_url FROM slides WHERE is_active = true;
SELECT id, gambar FROM keunggulan;
```

4. Lihat path gambar yang disimpan
5. Contoh path yang benar: `slides/hero-1.jpg` atau `keunggulan/bergizi.png`

#### Step 3: Cek Browser Console

1. Buka browser DevTools (F12)
2. Pergi ke Console tab
3. Lihat error messages
4. Cari log dari `getImageUrl()` function

#### Step 4: Test Image URL Langsung

1. Buka browser console
2. Jalankan:

```javascript
// Ganti dengan path dari database
const path = "slides/hero-1.jpg";
const url = supabase.storage.from("gondo-okantara").getPublicUrl(path)
  .data.publicUrl;
console.log(url);
// Copy URL dan buka di browser baru
```

### Solusi:

**Jika bucket private:**

```
Supabase Dashboard → Storage → gondo-okantara → Settings → Access Control → Public
```

**Jika path salah:**

- Pastikan path di database sesuai dengan struktur folder di storage
- Contoh: Jika file ada di `storage/gondo-okantara/slides/hero.jpg`, path di database harus `slides/hero.jpg`

**Jika bucket name salah:**

- Edit `src/lib/imageUtils.ts`
- Ganti `"gondo-okantara"` dengan nama bucket yang benar

---

## Masalah 2: Loading Lama Saat Login

### Penyebab Kemungkinan:

1. **Supabase connection lambat** - Network latency ke Supabase server
2. **Query tidak optimal** - Multiple queries atau query yang kompleks
3. **Profile fetch terlalu lama** - Database query lambat

### Cara Debug:

#### Step 1: Cek Network Speed

1. Buka browser DevTools (F12)
2. Pergi ke Network tab
3. Refresh page
4. Lihat request ke Supabase:
   - `auth.supabase.co` - Auth request
   - `xnxczlhkwqftylxdmxeh.supabase.co` - Database request
5. Lihat berapa lama setiap request (Time column)

#### Step 2: Cek Console Logs

1. Buka browser console
2. Lihat timing logs:

```
[Auth] Session loaded: XXms
[Auth] Profile fetched: XXms
[Auth] Total: XXms
```

#### Step 3: Cek Database Query Performance

1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Jalankan query:

```sql
-- Cek apakah ada index pada kolom yang di-query
SELECT * FROM profiles WHERE id = 'user-id-here';
```

4. Lihat execution time

### Solusi yang Sudah Diterapkan:

1. **Profile Caching** - Profile di-cache di memory agar tidak fetch berkali-kali
2. **Async/Await** - Memastikan profile fetch selesai sebelum loading selesai
3. **Error Handling** - Menambahkan error handling untuk debug lebih mudah

### Optimasi Tambahan:

#### Jika masih lambat, coba:

1. **Tambah Index di Database**

```sql
-- Jalankan di Supabase SQL Editor
CREATE INDEX idx_profiles_id ON profiles(id);
CREATE INDEX idx_profiles_username ON profiles(username);
```

2. **Reduce Query Columns**

```typescript
// Hanya ambil kolom yang dibutuhkan
.select("id, username, email, role, is_active")
// Jangan gunakan .select("*")
```

3. **Add Timeout**

```typescript
// Jika query lebih dari 5 detik, timeout
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Query timeout")), 5000),
);
```

---

## Monitoring Performance

### Tambah Performance Logging:

Edit `src/context/AuthContext.tsx`:

```typescript
const startTime = performance.now();

// ... fetch profile ...

const endTime = performance.now();
console.log(`Profile fetch took ${endTime - startTime}ms`);
```

### Cek Supabase Logs:

1. Supabase Dashboard → Logs
2. Lihat query yang lambat
3. Optimize query atau tambah index

---

## Checklist Debugging

- [ ] Cek Supabase storage bucket public
- [ ] Cek path gambar di database
- [ ] Cek browser console untuk errors
- [ ] Test image URL langsung di browser
- [ ] Cek network speed di DevTools
- [ ] Cek database query performance
- [ ] Cek Supabase logs untuk slow queries
- [ ] Tambah index jika diperlukan
- [ ] Monitor performance dengan console logs

---

## Quick Fixes

### Gambar tidak muncul:

```bash
# 1. Buka Supabase Dashboard
# 2. Storage → gondo-okantara → Settings → Access Control → Public
# 3. Refresh browser
```

### Loading lama:

```bash
# 1. Cek network speed (DevTools → Network)
# 2. Jika lambat, tambah index di database
# 3. Reduce query columns
# 4. Cek Supabase server status
```

### Masih tidak bisa?

```bash
# Cek console logs untuk error messages
# Buka browser DevTools (F12) → Console
# Lihat error yang muncul
# Share error message untuk debugging lebih lanjut
```
