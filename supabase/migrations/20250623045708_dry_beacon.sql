/*
  # Complete BOLTIS Database Schema

  1. New Tables
    - `profiles` - User profiles with game stats
    - `matches` - Individual match records
    - `match_participants` - Player participation in matches
    - `leaderboards` - Aggregated leaderboard data
    - `feedback` - User feedback submissions
    - `email_subscriptions` - Newsletter subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for leaderboards

  3. Functions
    - Update leaderboard stats after match completion
    - Calculate ranking positions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Game Statistics
  total_matches integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  total_losses integer DEFAULT 0,
  
  -- Bot Game Stats
  bot_matches integer DEFAULT 0,
  bot_wins integer DEFAULT 0,
  bot_losses integer DEFAULT 0,
  
  -- Player Game Stats  
  player_matches integer DEFAULT 0,
  player_wins integer DEFAULT 0,
  player_losses integer DEFAULT 0,
  
  -- Point Statistics
  total_points_scored integer DEFAULT 0,
  total_points_lost integer DEFAULT 0,
  lowest_winning_score integer,
  highest_losing_score integer DEFAULT 0,
  
  -- Achievements
  perfect_games integer DEFAULT 0, -- Won with 0 points
  comeback_wins integer DEFAULT 0, -- Won from behind
  
  -- Preferences
  preferred_game_mode text DEFAULT 'classic',
  email_notifications boolean DEFAULT true,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  
  -- Match Configuration
  game_mode text NOT NULL DEFAULT 'classic',
  timer_mode text NOT NULL DEFAULT 'turn-based',
  max_players integer NOT NULL DEFAULT 4,
  match_duration integer DEFAULT 0, -- seconds, 0 = infinite
  
  -- Match Results
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  winner_id uuid REFERENCES profiles(id),
  total_duration integer, -- actual match duration in seconds
  
  -- Match Statistics
  total_cards_played integer DEFAULT 0,
  total_special_cards_used integer DEFAULT 0,
  highest_score integer DEFAULT 0,
  lowest_score integer DEFAULT 0,
  
  -- Match Type
  is_bot_match boolean DEFAULT true,
  is_ranked boolean DEFAULT true
);

-- Match participants table
CREATE TABLE IF NOT EXISTS match_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id), -- NULL for bot players
  
  -- Player Info
  player_name text NOT NULL,
  player_type text NOT NULL CHECK (player_type IN ('human', 'bot')),
  bot_difficulty text CHECK (bot_difficulty IN ('easy', 'medium', 'hard')),
  
  -- Final Results
  final_position integer NOT NULL, -- 1 = winner, 2 = second, etc.
  final_score integer NOT NULL DEFAULT 0,
  cards_remaining integer NOT NULL DEFAULT 0,
  
  -- Game Statistics
  cards_played integer DEFAULT 0,
  special_cards_used integer DEFAULT 0,
  void_cards_used integer DEFAULT 0,
  stack_cards_used integer DEFAULT 0,
  
  -- Time Statistics (for time-bank mode)
  time_bank_used integer DEFAULT 0, -- seconds used from time bank
  timeouts integer DEFAULT 0, -- number of timeouts
  
  -- Performance Metrics
  average_turn_time real DEFAULT 0,
  fastest_turn_time real DEFAULT 0,
  slowest_turn_time real DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- Leaderboards table (aggregated data for performance)
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leaderboard_type text NOT NULL CHECK (leaderboard_type IN ('overall', 'bot_games', 'player_games', 'monthly', 'weekly')),
  
  -- Ranking Data
  rank_position integer,
  total_matches integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  win_rate real DEFAULT 0,
  
  -- Point Statistics
  total_points_scored integer DEFAULT 0,
  average_score real DEFAULT 0,
  best_score integer,
  
  -- Time Period (for monthly/weekly leaderboards)
  period_start timestamptz,
  period_end timestamptz,
  
  -- Metadata
  last_updated timestamptz DEFAULT now(),
  
  UNIQUE(user_id, leaderboard_type, period_start)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id), -- NULL for anonymous feedback
  
  -- Feedback Content
  type text NOT NULL CHECK (type IN ('bug_report', 'feature_request', 'general', 'complaint', 'praise')),
  subject text NOT NULL,
  message text NOT NULL,
  
  -- Additional Data
  user_agent text,
  page_url text,
  game_state jsonb, -- Can store game state for bug reports
  
  -- Status
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT message_length CHECK (char_length(message) >= 10 AND char_length(message) <= 2000)
);

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id), -- NULL for non-registered users
  
  -- Subscription Preferences
  newsletter boolean DEFAULT true,
  game_updates boolean DEFAULT true,
  tournament_notifications boolean DEFAULT false,
  
  -- Status
  is_active boolean DEFAULT true,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  
  -- Metadata
  source text DEFAULT 'website', -- where they subscribed from
  ip_address inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can read all completed matches"
  ON matches FOR SELECT
  TO authenticated
  USING (status = 'completed');

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM match_participants 
      WHERE match_id = matches.id AND user_id = auth.uid()
    )
  );

-- Match participants policies
CREATE POLICY "Users can read match participants"
  ON match_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert match participants"
  ON match_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Leaderboards policies (public read)
CREATE POLICY "Anyone can read leaderboards"
  ON leaderboards FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can update leaderboards"
  ON leaderboards FOR ALL
  TO authenticated
  USING (true);

-- Feedback policies
CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create feedback"
  ON feedback FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Email subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON email_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can subscribe"
  ON email_subscriptions FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own subscriptions"
  ON email_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update leaderboards after match completion
CREATE OR REPLACE FUNCTION update_leaderboards_after_match()
RETURNS trigger AS $$
BEGIN
  -- Only process completed matches
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update profiles for all human participants
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
      
    -- Refresh leaderboard rankings (simplified version)
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

-- Trigger for leaderboard updates
DROP TRIGGER IF EXISTS on_match_completed ON matches;
CREATE TRIGGER on_match_completed
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_leaderboards_after_match();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_rank ON leaderboards(leaderboard_type, rank_position);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);