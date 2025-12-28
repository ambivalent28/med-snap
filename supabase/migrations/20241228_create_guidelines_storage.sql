-- Create storage bucket for guidelines (private)
-- This migration sets up secure, private storage for clinical guidelines

-- Create the guidelines bucket (private, not public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guidelines', 
  'guidelines', 
  false,  -- PRIVATE bucket for security
  52428800,  -- 50MB max file size
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,  -- Ensure it stays private
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Policy 1: Users can upload their own files
-- Files must be uploaded to a folder named with the user's ID
CREATE POLICY IF NOT EXISTS "Users can upload own files" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can read their own files
-- Users can only access files in their own folder
CREATE POLICY IF NOT EXISTS "Users can read own files" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own files
CREATE POLICY IF NOT EXISTS "Users can update own files" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own files" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'guidelines' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

