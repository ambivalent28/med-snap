-- Create guidelines table to store metadata about uploaded files
-- This table works alongside the storage bucket to track user uploads

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.guidelines CASCADE;

CREATE TABLE public.guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  source_url TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_guidelines_user_id ON public.guidelines(user_id);

-- Create index for faster queries by category
CREATE INDEX IF NOT EXISTS idx_guidelines_category ON public.guidelines(category);

-- Enable Row Level Security
ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own guidelines" ON public.guidelines;
DROP POLICY IF EXISTS "Users can select own guidelines" ON public.guidelines;
DROP POLICY IF EXISTS "Users can update own guidelines" ON public.guidelines;
DROP POLICY IF EXISTS "Users can delete own guidelines" ON public.guidelines;

-- Policy: Users can insert their own guidelines
CREATE POLICY "Users can insert own guidelines" 
ON public.guidelines FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can select their own guidelines
CREATE POLICY "Users can select own guidelines" 
ON public.guidelines FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own guidelines
CREATE POLICY "Users can update own guidelines" 
ON public.guidelines FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete their own guidelines
CREATE POLICY "Users can delete own guidelines" 
ON public.guidelines FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
