# Supabase Storage Setup Checklist

## 🔧 Storage Bucket Setup (Required for Image Upload)

### 1. Create Storage Bucket
1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** → **Buckets**
3. Click **Create a new bucket**
4. Set the bucket name to: `katalog`
5. **IMPORTANT**: Make sure to set it as **Public** (not private)
6. Click **Create bucket**

### 2. Set Bucket Policies (RLS)
After creating the bucket, go to **Policies** tab and add these policies:

#### Policy 1: Allow Public Read
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'katalog');
```

#### Policy 2: Allow Authenticated Upload
```sql
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'katalog' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Allow Authenticated Delete
```sql
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'katalog' 
  AND auth.role() = 'authenticated'
);
```

### 3. Create `katalog` Table (Database)
Go to **SQL Editor** and run:

```sql
CREATE TABLE katalog (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE katalog ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow public read"
  ON katalog FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert"
  ON katalog FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update"
  ON katalog FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete"
  ON katalog FOR DELETE
  USING (auth.role() = 'authenticated');
```

## ✅ Verification Checklist

- [ ] Bucket `katalog` exists in Storage
- [ ] Bucket is set to **Public**
- [ ] Storage policies are created
- [ ] `katalog` table exists in database
- [ ] Table RLS policies are created
- [ ] You can see the bucket in Supabase dashboard

## 🧪 Testing Upload

1. Go to Admin Dashboard → Katalog
2. Click **Upload** button
3. Select an image file
4. Fill in Judul, Deskripsi, and Kategori
5. Click **Simpan**

### If Upload Fails:
1. **Open Browser Console** (F12)
2. Look for error messages in the console
3. Check these common issues:
   - Bucket name is exactly `katalog` (lowercase)
   - Bucket is set to **Public**
   - You are logged in (authenticated)
   - File size is reasonable (< 10MB)
   - File format is image (jpg, png, gif, etc.)

### Error Messages Guide:
- **"Upload gagal: Bucket not found"** → Create the `katalog` bucket
- **"Upload gagal: Unauthorized"** → Check bucket is public or policies are set
- **"Upload gagal: Invalid file"** → Check file format and size
- **"Gagal mendapatkan public URL"** → Bucket exists but public URL generation failed

## 📝 Environment Variables
Your `.env` file already has:
```
VITE_SUPABASE_URL=https://xnxczlhkwqftylxdmxeh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_m2jY1vQff0DiWDulQQL-1A_INDQRb71
```

These are correct and don't need changes.

## 🚀 Next Steps

1. Complete the checklist above
2. Restart your dev server: `npm run dev`
3. Test the upload functionality
4. If still having issues, check browser console for detailed error logs

