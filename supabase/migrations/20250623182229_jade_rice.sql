/*
  # Fix matches table RLS policies

  1. Security Updates
    - Update RLS policies for matches table to allow match creation
    - Allow both authenticated and unauthenticated users to create matches
    - Allow reading completed matches

  2. Changes
    - Drop existing restrictive INSERT policy
    - Create new policy allowing authenticated users to insert matches
    - Update SELECT policy to allow reading completed matches
    - Update UPDATE policy for match participants
*/

-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can read completed matches" ON matches;
DROP POLICY IF EXISTS "Users can read all completed matches" ON matches;
DROP POLICY IF EXISTS "Participants can update matches" ON matches;

-- Create a simple policy that allows authenticated users to create matches
CREATE POLICY "Allow match creation" 
  ON matches 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow anonymous users to also create matches (for offline play)
CREATE POLICY "Allow anonymous match creation" 
  ON matches 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Allow reading completed matches for everyone
CREATE POLICY "Allow reading completed matches" 
  ON matches 
  FOR SELECT 
  TO authenticated, anon
  USING (status = 'completed');

-- Allow participants to update their matches
CREATE POLICY "Allow participants to update matches" 
  ON matches 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM match_participants
      WHERE match_participants.match_id = matches.id
        AND match_participants.user_id = auth.uid()
    )
  );