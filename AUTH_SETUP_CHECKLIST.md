# Authentication Setup Checklist

## ✅ Code Setup (Already Done)
- [x] AuthContext created with username-based login
- [x] LoginPage component created
- [x] ProtectedRoute component created
- [x] useAuthUser hook created
- [x] Supabase client configured

## 🔧 Supabase Database Setup (You Need to Do This)

### 1. Create `profiles` Table
Go to your Supabase dashboard and create a table with these columns:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Enable Row Level Security (RLS)
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles (needed for login with username)
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow anyone to insert (for signup)
CREATE POLICY "Anyone can insert profile"
  ON profiles FOR INSERT
  WITH CHECK (true);
```

### 3. Create a Test User
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Create a user with:
   - Email: `test@example.com`
   - Password: `TestPassword123!`

4. Then insert into profiles table:
```sql
INSERT INTO profiles (id, username, email)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'testuser',
  'test@example.com'
);
```

## 🚀 Testing the Login

1. **Restart your dev server** (this is critical!)
   ```cmd
   npm run dev
   ```

2. Go to `http://localhost:5173/admin/login`

3. Login with:
   - Username: `testuser`
   - Password: `TestPassword123!`

## 🐛 Troubleshooting

### White Screen / supabaseKey is required
- **Solution**: Restart your dev server after updating .env
- The dev server only reads .env on startup

### Username not found
- Check that the profiles table exists
- Verify the username is lowercase in the database
- Check RLS policies are correct

### Password wrong
- Verify the user exists in auth.users
- Make sure the email in profiles matches auth.users email
- Check the password is correct

### Still having issues?
Check browser console (F12) for detailed error messages. The improved error handling will show you exactly what's failing.

## 📋 Environment Variables
Your .env file should have:
```
VITE_SUPABASE_URL=https://xnxczlhkwqftylxdmxeh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_m2jY1vQff0DiWDulQQL-1A_INDQRb71
```

These are already set in your project.
