import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  
  // Game Statistics
  total_matches: number;
  total_wins: number;
  total_losses: number;
  
  // Bot Game Stats
  bot_matches: number;
  bot_wins: number;
  bot_losses: number;
  
  // Player Game Stats
  player_matches: number;
  player_wins: number;
  player_losses: number;
  
  // Point Statistics
  total_points_scored: number;
  total_points_lost: number;
  lowest_winning_score?: number;
  highest_losing_score: number;
  
  // Achievements
  perfect_games: number;
  comeback_wins: number;
  
  // Preferences
  preferred_game_mode: string;
  email_notifications: boolean;
}

export interface Match {
  id: string;
  created_at: string;
  completed_at?: string;
  
  // User association
  user_id?: string;
  
  // Match Configuration
  game_mode: string;
  timer_mode: string;
  max_players: number;
  match_duration: number;
  
  // Match Results
  status: 'in_progress' | 'completed' | 'abandoned';
  winner_id?: string;
  total_duration?: number;
  
  // Match Statistics
  total_cards_played: number;
  total_special_cards_used: number;
  highest_score: number;
  lowest_score: number;
  
  // Match Type
  is_bot_match: boolean;
  is_ranked: boolean;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  user_id?: string;
  
  // Player Info
  player_name: string;
  player_type: 'human' | 'bot';
  bot_difficulty?: 'easy' | 'medium' | 'hard';
  
  // Final Results
  final_position: number;
  final_score: number;
  cards_remaining: number;
  
  // Game Statistics
  cards_played: number;
  special_cards_used: number;
  void_cards_used: number;
  stack_cards_used: number;
  
  // Time Statistics
  time_bank_used: number;
  timeouts: number;
  
  // Performance Metrics
  average_turn_time: number;
  fastest_turn_time: number;
  slowest_turn_time: number;
  
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  leaderboard_type: 'overall' | 'bot_games' | 'player_games' | 'monthly' | 'weekly';
  
  // Ranking Data
  rank_position?: number;
  total_matches: number;
  total_wins: number;
  win_rate: number;
  
  // Point Statistics
  total_points_scored: number;
  average_score: number;
  best_score?: number;
  
  // Time Period
  period_start?: string;
  period_end?: string;
  
  last_updated: string;
  
  // Joined data
  profile?: Profile;
}

export interface Feedback {
  id: string;
  user_id?: string;
  
  type: 'bug_report' | 'feature_request' | 'general' | 'complaint' | 'praise';
  subject: string;
  message: string;
  
  user_agent?: string;
  page_url?: string;
  game_state?: any;
  
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EmailSubscription {
  id: string;
  email: string;
  user_id?: string;
  
  newsletter: boolean;
  game_updates: boolean;
  tournament_notifications: boolean;
  
  is_active: boolean;
  confirmed_at?: string;
  unsubscribed_at?: string;
  
  source: string;
  created_at: string;
}