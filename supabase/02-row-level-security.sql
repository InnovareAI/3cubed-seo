-- Implement Row Level Security for multi-tenant access
-- This ensures users can only see their own submissions

-- Enable RLS on submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own submissions
CREATE POLICY "Users see own submissions" ON submissions
  FOR SELECT USING (
    submitter_email = (auth.jwt() ->> 'email') OR
    seo_reviewer_email = (auth.jwt() ->> 'email') OR
    client_reviewer_email = (auth.jwt() ->> 'email') OR
    mlr_reviewer_email = (auth.jwt() ->> 'email')
  );

-- Policy: Users can update only their own submissions  
CREATE POLICY "Users update own submissions" ON submissions
  FOR UPDATE USING (
    submitter_email = (auth.jwt() ->> 'email') OR
    seo_reviewer_email = (auth.jwt() ->> 'email') OR
    client_reviewer_email = (auth.jwt() ->> 'email') OR
    mlr_reviewer_email = (auth.jwt() ->> 'email')
  );

-- Policy: Authenticated users can insert submissions
CREATE POLICY "Authenticated users can insert" ON submissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Service role has full access (for N8N automation)
CREATE POLICY "Service role full access" ON submissions
  FOR ALL USING (auth.role() = 'service_role');

-- Create user roles and permissions
CREATE TYPE user_role AS ENUM ('admin', 'seo_reviewer', 'client_reviewer', 'mlr_reviewer', 'viewer');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  organization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own profile
CREATE POLICY "Users see own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users update own profile" ON user_profiles  
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admin users can see all profiles
CREATE POLICY "Admins see all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();