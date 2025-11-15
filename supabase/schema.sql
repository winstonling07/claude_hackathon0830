-- SprintNotes User Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the users table

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  birthday DATE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mentor', 'mentee')),
  subjects TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for filtering mentors/mentees
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create index on subjects using GIN for array searches
CREATE INDEX IF NOT EXISTS idx_users_subjects ON users USING GIN(subjects);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own data
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Create policy: Users can update their own data
CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Create policy: Allow anonymous users to insert (for signup)
-- Note: This allows anyone to create an account. In production, you might want to add additional checks.
CREATE POLICY "Allow anonymous signup"
    ON users
    FOR INSERT
    WITH CHECK (true);

-- Optional: Create a view for public user profiles (without sensitive data)
CREATE OR REPLACE VIEW public_user_profiles AS
SELECT 
  id,
  email,
  role,
  subjects,
  created_at
FROM users;

-- Grant access to the view
GRANT SELECT ON public_user_profiles TO anon, authenticated;

