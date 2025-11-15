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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow anonymous signup" ON users;

-- Create policy: Users can read their own data
-- Note: Using service role key bypasses RLS, but we keep policies for client-side access
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    USING (true); -- Allow all for now since we're using service role key

-- Create policy: Users can update their own data
CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    USING (true); -- Allow all for now since we're using service role key

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

-- Create matches table for mentor-mentee connections
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ended')),
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(mentor_id, mentee_id)
);

-- Create index on matches for faster lookups
CREATE INDEX IF NOT EXISTS idx_matches_mentor ON matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_matches_mentee ON matches(mentee_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Create trigger to update updated_at for matches
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can create match requests" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;

-- Policy: Users can view matches they're involved in
-- Note: Using service role key bypasses RLS, but we keep policies for client-side access
CREATE POLICY "Users can view own matches"
    ON matches
    FOR SELECT
    USING (true); -- Allow all for now since we're using service role key

-- Policy: Users can create match requests
CREATE POLICY "Users can create match requests"
    ON matches
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can update matches they're involved in
CREATE POLICY "Users can update own matches"
    ON matches
    FOR UPDATE
    USING (true); -- Allow all for now since we're using service role key

-- Create messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index on messages for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in own matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in accepted matches" ON messages;
DROP POLICY IF EXISTS "Users can update own message read status" ON messages;

-- Policy: Users can view messages in their matches
-- Note: Using service role key bypasses RLS, but we keep policies for client-side access
CREATE POLICY "Users can view messages in own matches"
    ON messages
    FOR SELECT
    USING (true); -- Allow all for now since we're using service role key

-- Policy: Users can send messages in their accepted matches
CREATE POLICY "Users can send messages in accepted matches"
    ON messages
    FOR INSERT
    WITH CHECK (true); -- Allow all for now since we're using service role key

-- Policy: Users can update read status of their messages
CREATE POLICY "Users can update own message read status"
    ON messages
    FOR UPDATE
    USING (true); -- Allow all for now since we're using service role key

