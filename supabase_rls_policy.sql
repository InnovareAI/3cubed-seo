-- Enable RLS on submissions table (if not already enabled)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Enable insert for all users" ON submissions;

-- Create policy to allow anyone to insert into submissions table
CREATE POLICY "Enable insert for all users" 
ON submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Optional: If you also want to allow users to select their own submissions
-- DROP POLICY IF EXISTS "Enable read for all users" ON submissions;
-- CREATE POLICY "Enable read for all users" 
-- ON submissions 
-- FOR SELECT 
-- TO anon, authenticated
-- USING (true);

-- Optional: If you want to restrict updates/deletes to authenticated users only
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON submissions;
-- CREATE POLICY "Enable update for authenticated users only" 
-- ON submissions 
-- FOR UPDATE 
-- TO authenticated
-- USING (auth.uid() IS NOT NULL)
-- WITH CHECK (auth.uid() IS NOT NULL);

-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON submissions;
-- CREATE POLICY "Enable delete for authenticated users only" 
-- ON submissions 
-- FOR DELETE 
-- TO authenticated
-- USING (auth.uid() IS NOT NULL);
