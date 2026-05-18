# Setup Supabase untuk Gondo Okantara

## 1. Environment Variables ✅

File `.env` sudah dikonfigurasi dengan:
```
VITE_SUPABASE_URL=https://xnxczlhkwqftylxdmxeh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_m2jY1vQff0DiWDulQQL-1A_INDQRb71
```

## 2. Struktur File yang Dibuat

### Core Files
- `src/lib/supabase.ts` - Inisialisasi Supabase client
- `src/context/AuthContext.tsx` - Auth context provider
- `src/lib/database.ts` - Database query functions
- `src/lib/storage.ts` - File storage functions
- `src/hooks/useAuthUser.ts` - Custom hook untuk auth

### Updated Files
- `src/app/App.tsx` - Wrapped dengan AuthProvider
- `src/app/admin/LoginPage.tsx` - Updated untuk Supabase auth
- `src/app/ProtectedRoute.tsx` - Updated untuk auth context

## 3. Setup di Supabase Dashboard

### A. Create Tables

Buat tabel berikut di Supabase:

#### 1. Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy (public read, authenticated write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');
```

#### 3. Slides Table
```sql
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Anyone can view active slides"
  ON slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage slides"
  ON slides FOR ALL
  USING (auth.role() = 'authenticated');
```

#### 4. Mitra Table
```sql
CREATE TABLE mitra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Anyone can view approved mitra"
  ON mitra FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create mitra"
  ON mitra FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### B. Setup Storage Bucket

1. Buka Supabase Dashboard → Storage
2. Create new bucket dengan nama: `gondo-okantara`
3. Set bucket ke public
4. Add policy untuk upload:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gondo-okantara' AND
    auth.role() = 'authenticated'
  );

-- Allow public read
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gondo-okantara');
```

## 4. Cara Menggunakan

### Authentication

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>
          <p>Welcome {user.email}</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Database Operations

```typescript
import { getProducts, createProduct, updateProduct } from '@/lib/database';

// Get all products
const products = await getProducts();

// Create product
const newProduct = await createProduct({
  name: 'Product Name',
  price: 100000,
  description: 'Product description',
  category: 'category',
  stock: 10
});

// Update product
await updateProduct(productId, {
  name: 'Updated Name',
  price: 150000
});
```

### File Upload

```typescript
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/storage';

// Upload single file
const url = await uploadFile(file, 'products/product-1.jpg');

// Upload multiple files
const urls = await uploadMultipleFiles(files, 'products');

// Get public URL
const publicUrl = getPublicUrl('products/product-1.jpg');

// Delete file
await deleteFile('products/product-1.jpg');
```

### Custom Hook

```typescript
import { useAuthUser } from '@/hooks/useAuthUser';

function MyComponent() {
  const { user, isAuthenticated, userId, email } = useAuthUser();

  return (
    <div>
      {isAuthenticated && <p>User: {email}</p>}
    </div>
  );
}
```

## 5. Create Admin User

1. Buka Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Masukkan email dan password
4. User akan bisa login di aplikasi

## 6. Testing

1. Run aplikasi: `npm run dev`
2. Buka http://localhost:5173/admin/login
3. Login dengan email dan password yang sudah dibuat
4. Seharusnya redirect ke dashboard

## 7. Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan `.env` file sudah ada dan berisi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY

### Error: "Invalid login credentials"
- Pastikan user sudah dibuat di Supabase Dashboard
- Pastikan email dan password benar

### Error: "Bucket not found"
- Pastikan bucket `gondo-okantara` sudah dibuat di Storage
- Update nama bucket di `src/lib/storage.ts` jika berbeda

### CORS Error
- Buka Supabase Dashboard → Settings → API
- Pastikan URL aplikasi sudah ditambahkan ke CORS allowed origins

## 8. Next Steps

1. Update database functions di `src/lib/database.ts` sesuai kebutuhan
2. Tambahkan error handling di setiap component
3. Implement loading states
4. Add toast notifications untuk user feedback
5. Setup email verification dan password reset

## 9. Security Tips

- Jangan commit `.env` file ke git
- Gunakan Row Level Security (RLS) untuk semua table
- Validate input di client dan server
- Implement rate limiting untuk auth endpoints
- Use HTTPS di production
- Rotate API keys secara berkala
