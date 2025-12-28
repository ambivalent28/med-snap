# Supabase Setup Guide for MedSnap

This guide will help you set up the required Supabase storage bucket and database tables for MedSnap.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Supabase project created

## 1. Environment Variables

Create a `.env` file in the root of your project with:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under "API".

## 2. Create Storage Bucket

### Step 1: Navigate to Storage
1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar
3. Click "Create a new bucket"

### Step 2: Configure the Bucket
- **Name**: `guidelines`
- **Public bucket**: ❌ **LEAVE UNCHECKED** (keep private for security - clinical data should not be publicly accessible)
- **Allowed MIME types**: Leave empty or add:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`
- **Max file size**: Set to `50MB` or as needed

### Step 3: Set Storage Policies

After creating the bucket, you need to set up the following RLS (Row Level Security) policies:

#### Policy 1: Users Can Upload Their Own Files
```sql
CREATE POLICY "Users can upload own files" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);
```

#### Policy 2: Users Can Read Their Own Files
```sql
CREATE POLICY "Users can read own files" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Users Can Update Their Own Files
```sql
CREATE POLICY "Users can update own files" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Users Can Delete Their Own Files
```sql
CREATE POLICY "Users can delete own files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

To add these policies:
1. Go to "Storage" → "Policies"
2. Click "New Policy"
3. Choose "Create a policy from scratch"
4. Copy and paste each policy above

## 3. Create Database Tables

### Guidelines Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Create guidelines table
CREATE TABLE IF NOT EXISTS guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  source_url TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'word', 'image')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE guidelines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own guidelines
CREATE POLICY "Users can view own guidelines" 
ON guidelines FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own guidelines
CREATE POLICY "Users can insert own guidelines" 
ON guidelines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own guidelines
CREATE POLICY "Users can update own guidelines" 
ON guidelines FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own guidelines
CREATE POLICY "Users can delete own guidelines" 
ON guidelines FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_guidelines_user_id ON guidelines(user_id);
CREATE INDEX idx_guidelines_created_at ON guidelines(created_at DESC);
```

### Profiles Table

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  upload_count INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trialing')),
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, upload_count, subscription_status, subscription_plan)
  VALUES (NEW.id, 0, 'inactive', 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 4. Verify Setup

### Test Storage Bucket
1. Go to "Storage" → "guidelines"
2. Try to manually upload a test file
3. If successful, you can delete the test file

### Test Database Tables
Run this query in the SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('guidelines', 'profiles');
```

You should see both tables listed.

## 5. Common Issues & Solutions

### Issue: "Bucket not found" error
**Solution**: Make sure the bucket name is exactly `guidelines` (lowercase, no spaces)

### Issue: "Permission denied" when uploading
**Solution**: 
- Check that the bucket is set to "Public"
- Verify the storage policies are correctly set up
- Make sure the user is authenticated

### Issue: Files upload but can't be viewed
**Solution**: 
- Make sure the bucket is PRIVATE (not public)
- Check that the "Users can read own files" policy is enabled
- Verify the user is authenticated when trying to view files
- The app uses signed URLs that expire after 1 hour - if you're seeing old URLs, they may have expired

### Issue: Profile not created automatically
**Solution**: 
- Make sure the trigger function is created
- Try creating a new test user
- Manually create a profile for existing users:
```sql
INSERT INTO profiles (user_id, upload_count, subscription_status, subscription_plan)
VALUES ('user-uuid-here', 0, 'inactive', 'free');
```

## 6. Testing the Complete Flow

1. Sign up for a new account through the app
2. Check the `profiles` table - a new row should be created automatically
3. Upload a test file (PDF, Word doc, or image)
4. Check the `guidelines` table - the file metadata should be stored
5. Check the `guidelines` storage bucket - the file should be present
6. Try viewing the file in the app
7. Try deleting the file - it should be removed from both storage and database

## 7. Optional: Set up Database Backups

1. Go to "Database" → "Backups"
2. Enable automatic daily backups
3. Consider downloading manual backups before major changes

## Support

If you encounter issues not covered here:
1. Check the Supabase logs in the dashboard
2. Review browser console for error messages
3. Verify environment variables are correctly set
4. Ensure you're using the latest version of `@supabase/supabase-js`

---

**Note**: Remember to never commit your `.env` file or expose your Supabase keys publicly!

