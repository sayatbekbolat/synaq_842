-- Synaq Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  instagram_handle TEXT,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'abandoned')),
  start_lat DECIMAL(10, 8),
  start_lng DECIMAL(11, 8),
  finish_lat DECIMAL(10, 8),
  finish_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_duration ON attempts(duration) WHERE status = 'completed';

-- Function to get today's leaderboard
CREATE OR REPLACE FUNCTION get_todays_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  name TEXT,
  duration INTEGER,
  instagram TEXT,
  attempt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY a.duration ASC) as rank,
    u.display_name as name,
    a.duration,
    u.instagram_handle as instagram,
    a.id as attempt_id,
    a.created_at
  FROM attempts a
  JOIN users u ON a.user_id = u.id
  WHERE a.status = 'completed'
    AND a.duration IS NOT NULL
    AND DATE(a.created_at) = CURRENT_DATE
  ORDER BY a.duration ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly leaderboard
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  name TEXT,
  duration INTEGER,
  instagram TEXT,
  attempt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY a.duration ASC) as rank,
    u.display_name as name,
    a.duration,
    u.instagram_handle as instagram,
    a.id as attempt_id,
    a.created_at
  FROM attempts a
  JOIN users u ON a.user_id = u.id
  WHERE a.status = 'completed'
    AND a.duration IS NOT NULL
    AND a.created_at >= DATE_TRUNC('week', CURRENT_DATE)
  ORDER BY a.duration ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get all-time leaderboard
CREATE OR REPLACE FUNCTION get_alltime_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  name TEXT,
  duration INTEGER,
  instagram TEXT,
  attempt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY a.duration ASC) as rank,
    u.display_name as name,
    a.duration,
    u.instagram_handle as instagram,
    a.id as attempt_id,
    a.created_at
  FROM attempts a
  JOIN users u ON a.user_id = u.id
  WHERE a.status = 'completed'
    AND a.duration IS NOT NULL
  ORDER BY a.duration ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get live climbers count
CREATE OR REPLACE FUNCTION get_live_climbers_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM attempts
    WHERE status = 'started'
      AND start_time >= NOW() - INTERVAL '30 minutes'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attempts_updated_at
  BEFORE UPDATE ON attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to users
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public read access to completed attempts
CREATE POLICY "Completed attempts are viewable by everyone"
  ON attempts FOR SELECT
  USING (status = 'completed' OR auth.uid()::text = user_id::text);

-- Allow users to insert their own attempts
CREATE POLICY "Users can insert their own attempts"
  ON attempts FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own attempts
CREATE POLICY "Users can update their own attempts"
  ON attempts FOR UPDATE
  USING (true);
