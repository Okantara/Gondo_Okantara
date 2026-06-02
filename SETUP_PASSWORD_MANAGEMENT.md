# Setup Password Management - Menggunakan Tabel Profiles

Tabel `profiles` sudah ada di Supabase Anda. Kita hanya perlu membuat RLS policy agar bisa diakses.

## 1. Enable RLS dan Buat Policy untuk Tabel Profiles

Jalankan SQL query berikut di Supabase SQL Editor:

```sql
-- Enable RLS jika belum
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin bisa melihat semua profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE user_role = 'admin'
    )
  );

-- Policy 2: Users bisa melihat profile mereka sendiri
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 3: Admin bisa update profiles
CREATE POLICY "Admin can update profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE user_role = 'admin'
    )
  );

-- Policy 4: Users bisa update profile mereka sendiri
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## 2. Buat Edge Function untuk Update Password

Di Supabase Dashboard, buat Edge Function baru:

1. Pergi ke **Functions** → **Create a new function**
2. Beri nama: `update-user-password`
3. Pilih TypeScript
4. Copy-paste code berikut:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, newPassword } = await req.json();

    // Verify the request is from an authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: corsHeaders },
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    // Verify the user making the request is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from("profiles")
      .select("user_role")
      .eq("id", userData.user.id)
      .single();

    if (adminCheck?.user_role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can update passwords" }),
        { status: 403, headers: corsHeaders },
      );
    }

    // Update the password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword },
    );

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({ message: "Password updated successfully" }),
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

## 3. Verifikasi Struktur Tabel Profiles

Pastikan tabel profiles memiliki kolom:

- `id` (UUID, Primary Key, Foreign Key ke auth.users)
- `email` (text)
- `user_role` (text) - nilai: 'admin' atau 'kasir'
- `created_at` (timestamp)

Jika kolom `email` belum ada, tambahkan dengan:

```sql
ALTER TABLE profiles ADD COLUMN email TEXT;
```

## 4. Testing

Setelah setup selesai:

1. Login sebagai admin
2. Pergi ke menu "Manajemen Password"
3. Anda seharusnya bisa melihat daftar users
4. Klik "Ubah Password" untuk mengubah password user

## Troubleshooting

### Error: "Tidak ada akun yang ditemukan"

- Pastikan RLS policy sudah dibuat
- Pastikan Anda login sebagai admin
- Cek bahwa kolom `user_role` memiliki nilai 'admin' atau 'kasir'

### Error: "Gagal memperbarui password"

- Pastikan Edge Function "update-user-password" sudah dibuat
- Cek logs di Supabase untuk error details
- Pastikan service role key sudah dikonfigurasi di Edge Function

### Error: "Unauthorized"

- Pastikan Anda sudah login
- Pastikan user Anda memiliki role 'admin'
