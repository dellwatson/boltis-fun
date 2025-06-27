/*
  # Fix matches table RLS policy

  1. Security Updates
    - Update RLS policy for matches table to allow authenticated users to create matches
    - Ensure proper permissions for match creation and updates

  2. Changes
    - Drop existing restrictive INSERT policy if it exists
    - Create new policy allowing authenticated users to insert matches
    - Maintain existing SELECT and UPDATE policies
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create matches" ON matches;

-- Create new INSERT policy that allows authenticated users to create matches
CREATE POLICY "Authenticated users can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the existing SELECT policy allows reading completed matches
DROP POLICY IF EXISTS "Users can read all completed matches" ON matches;
CREATE POLICY "Users can read completed matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (status = 'completed');

-- Ensure the existing UPDATE policy allows participants to update their matches
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;
CREATE POLICY "Participants can update matches"
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