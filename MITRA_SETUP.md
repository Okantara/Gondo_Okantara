# Setup Database untuk Fitur Mitra

## Langkah-langkah Setup

### 1. Buat Tabel `mitra` di Supabase

Jalankan SQL query berikut di Supabase SQL Editor:

```sql
-- Buat tabel mitra
CREATE TABLE mitra (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  foto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat index untuk performa
CREATE INDEX idx_mitra_created_at ON mitra(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;

-- Policy untuk SELECT (public read)
CREATE POLICY "Allow public read" ON mitra
  FOR SELECT USING (true);

-- Policy untuk INSERT (authenticated users only)
CREATE POLICY "Allow authenticated insert" ON mitra
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy untuk UPDATE (authenticated users only)
CREATE POLICY "Allow authenticated update" ON mitra
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy untuk DELETE (authenticated users only)
CREATE POLICY "Allow authenticated delete" ON mitra
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 2. Setup Storage Bucket untuk Gambar

1. Buka Supabase Dashboard
2. Pergi ke Storage → Buckets
3. Buat bucket baru dengan nama `images` (jika belum ada)
4. Konfigurasi permissions:
   - Public read access
   - Authenticated write access

### 3. Struktur Data

Tabel `mitra` memiliki kolom:

- `id`: Primary key (auto-increment)
- `nama`: Nama mitra (string, required)
- `foto`: URL foto mitra (string, required)
- `created_at`: Timestamp pembuatan (auto)
- `updated_at`: Timestamp update terakhir (auto)

## Fitur yang Tersedia

### Create (Tambah Mitra)

- Admin dapat menambah mitra baru
- Upload foto melalui drag-and-drop atau file picker
- Foto disimpan di Supabase Storage

### Read (Lihat Mitra)

- Menampilkan semua mitra dalam grid layout
- Loading state saat fetch data
- Empty state jika belum ada mitra

### Update (Edit Mitra)

- Admin dapat mengedit nama dan foto mitra
- Preview foto sebelum disimpan
- Konfirmasi perubahan

### Delete (Hapus Mitra)

- Admin dapat menghapus mitra
- Konfirmasi sebelum penghapusan
- Error handling jika gagal

## Komponen yang Digunakan

- `Mitra.tsx`: Komponen utama dengan CRUD functionality
- `MitraPage.tsx`: Wrapper page untuk dashboard

## Error Handling

- Validasi input (nama dan foto harus diisi)
- Error message yang user-friendly
- Loading states untuk UX yang lebih baik
- Retry logic untuk operasi yang gagal

## Catatan

- Pastikan Supabase client sudah dikonfigurasi di `src/lib/supabase.ts`
- Pastikan user sudah authenticated sebelum mengakses fitur ini
- Gambar akan disimpan di folder `mitra/` di bucket `images`
