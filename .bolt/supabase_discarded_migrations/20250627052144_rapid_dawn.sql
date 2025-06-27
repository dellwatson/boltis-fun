/*
  # Enable guest profiles support

  1. Changes
    - Change profiles.id from uuid to text to support guest IDs
    - Update all related tables to use text for user_id columns
    - Add policies to support guest profile creation and updates
    - Update trigger functions to handle guest profiles

  2. Security
    - Maintain RLS policies for both authenticated and guest users
    - Allow guest profiles with 'guest-' prefix
    - Preserve existing security for authenticated users
*/

-- First, drop ALL RLS policies that reference the id column
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert guest profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can update guest profiles" ON profiles;

-- Drop policies on other tables that reference user_id
DROP POLICY IF EXISTS "Users can read own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON email_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON email_subscriptions;

-- Drop foreign key constraints that reference profiles.id
ALTER TABLE leaderboards DROP CONSTRAINT IF EXISTS leaderboards_user_id_fkey;
ALTER TABLE match_participants DROP CONSTRAINT IF EXISTS match_participants_user_id_fkey;
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE email_subscriptions DROP CONSTRAINT IF EXISTS email_subscriptions_user_id_fkey;

-- Drop the existing foreign key constraint from auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now we can safely change the column types
ALTER TABLE profiles ALTER COLUMN id TYPE text;
ALTER TABLE leaderboards ALTER COLUMN user_id TYPE text;
ALTER TABLE match_participants ALTER COLUMN user_id TYPE text;
ALTER TABLE feedback ALTER COLUMN user_id TYPE text;
ALTER TABLE email_subscriptions ALTER COLUMN user_id TYPE text;
ALTER TABLE matches ALTER COLUMN winner_id TYPE text;

-- Add a simple check constraint for guest IDs (no subquery)
ALTER TABLE profiles ADD CONSTRAINT profiles_id_format_check 
  CHECK (
    id LIKE 'guest-%' OR 
    (char_length(id) = 36 AND id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  );

-- Recreate RLS policies with text column support

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Anyone can insert guest profiles"
  ON profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (id LIKE 'guest-%');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Anyone can update guest profiles"
  ON profiles FOR UPDATE
  TO anon, authenticated
  USING (id LIKE 'guest-%')
  WITH CHECK (id LIKE 'guest-%');

-- Update match participants to allow guest user references
DROP POLICY IF EXISTS "Users can insert match participants" ON match_participants;
DROP POLICY IF EXISTS "Anyone can insert match participants" ON match_participants;
CREATE POLICY "Anyone can insert match participants"
  ON match_participants FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure leaderboards can include guest users
DROP POLICY IF EXISTS "System can update leaderboards" ON leaderboards;
DROP POLICY IF EXISTS "Anyone can update leaderboards" ON leaderboards;
CREATE POLICY "System can update leaderboards"
  ON leaderboards FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Recreate feedback policies with text user_id
CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Recreate email subscription policies with text user_id
CREATE POLICY "Users can read own subscriptions"
  ON email_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subscriptions"
  ON email_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_guest_id 
  ON profiles(id) WHERE id LIKE 'guest-%';

CREATE INDEX IF NOT EXISTS idx_profiles_auth_id 
  ON profiles(id) WHERE id NOT LIKE 'guest-%';

-- Update the trigger function to handle guest profiles
CREATE OR REPLACE FUNCTION update_leaderboards_after_match()
RETURNS trigger AS $$
BEGIN
  -- Only process completed matches
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update profiles for all participants (including guests)
    UPDATE profiles SET
      total_matches = total_matches + 1,
      total_wins = total_wins + CASE WHEN mp.final_position = 1 THEN 1 ELSE 0 END,
      total_losses = total_losses + CASE WHEN mp.final_position > 1 THEN 1 ELSE 0 END,
      bot_matches = bot_matches + CASE WHEN NEW.is_bot_match THEN 1 ELSE 0 END,
      bot_wins = bot_wins + CASE WHEN NEW.is_bot_match AND mp.final_position = 1 THEN 1 ELSE 0 END,
      bot_losses = bot_losses + CASE WHEN NEW.is_bot_match AND mp.final_position > 1 THEN 1 ELSE 0 END,
      player_matches = player_matches + CASE WHEN NOT NEW.is_bot_match THEN 1 ELSE 0 END,
      player_wins = player_wins + CASE WHEN NOT NEW.is_bot_match AND mp.final_position = 1 THEN 1 ELSE 0 END,
      player_losses = player_losses + CASE WHEN NOT NEW.is_bot_match AND mp.final_position > 1 THEN 1 ELSE 0 END,
      total_points_scored = total_points_scored + mp.final_score,
      total_points_lost = total_points_lost + CASE WHEN mp.final_position > 1 THEN mp.final_score ELSE 0 END,
      lowest_winning_score = CASE 
        WHEN mp.final_position = 1 THEN LEAST(COALESCE(lowest_winning_score, mp.final_score), mp.final_score)
        ELSE lowest_winning_score
      END,
      highest_losing_score = CASE 
        WHEN mp.final_position > 1 THEN GREATEST(highest_losing_score, mp.final_score)
        ELSE highest_losing_score
      END,
      perfect_games = perfect_games + CASE WHEN mp.final_position = 1 AND mp.final_score = 0 THEN 1 ELSE 0 END,
      updated_at = now()
    FROM match_participants mp
    WHERE mp.match_id = NEW.id 
      AND mp.user_id = profiles.id 
      AND mp.player_type = 'human';
      
    -- Refresh leaderboard rankings (including guests)
    INSERT INTO leaderboards (user_id, leaderboard_type, total_matches, total_wins, win_rate, total_points_scored, average_score, best_score)
    SELECT 
      p.id,
      'overall',
      p.total_matches,
      p.total_wins,
      CASE WHEN p.total_matches > 0 THEN p.total_wins::real / p.total_matches ELSE 0 END,
      p.total_points_scored,
      CASE WHEN p.total_matches > 0 THEN p.total_points_scored::real / p.total_matches ELSE 0 END,
      p.lowest_winning_score
    FROM profiles p
    WHERE EXISTS (
      SELECT 1 FROM match_participants mp 
      WHERE mp.match_id = NEW.id AND mp.user_id = p.id
    )
    ON CONFLICT (user_id, leaderboard_type, period_start) 
    DO UPDATE SET
      total_matches = EXCLUDED.total_matches,
      total_wins = EXCLUDED.total_wins,
      win_rate = EXCLUDED.win_rate,
      total_points_scored = EXCLUDED.total_points_scored,
      average_score = EXCLUDED.average_score,
      best_score = LEAST(COALESCE(leaderboards.best_score, EXCLUDED.best_score), EXCLUDED.best_score),
      last_updated = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to work with text IDs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;