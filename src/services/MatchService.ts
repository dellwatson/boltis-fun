import { supabase, Match, MatchParticipant } from '../lib/supabase';
import { GameState, Player } from '../types/game';

export class MatchService {
  static async createMatch(gameState: GameState, userId?: string): Promise<{ matchId: string | null; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { matchId: null, error: new Error('Supabase not available') };
      }

      // Create the match record with user_id
      const matchData: any = {
        game_mode: gameState.settings.gameMode.mode,
        timer_mode: gameState.settings.gameMode.timerMode,
        max_players: gameState.players.length,
        match_duration: gameState.matchDuration,
        is_bot_match: gameState.players.some(p => p.playerType === 'bot'),
        is_ranked: true,
        status: 'in_progress'
      };

      // Add user_id if provided
      if (userId) {
        matchData.user_id = userId;
      }

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();

      if (matchError) {
        console.error('Error creating match:', matchError);
        return { matchId: null, error: matchError };
      }

      return { matchId: match.id, error: null };
    } catch (error) {
      console.error('Error in createMatch:', error);
      return { matchId: null, error };
    }
  }

  static async completeMatch(
    matchId: string,
    gameState: GameState,
    winnerId?: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { success: false, error: new Error('Supabase not available') };
      }

      // Calculate match statistics
      const totalCardsPlayed = gameState.discardPile.length + 1; // +1 for top card
      const scores = gameState.players.map(p => 
        p.cards.reduce((sum, card) => {
          if (card.type === 'number') return sum + (card.value || 0);
          if (card.type === 'void') return sum + 50;
          return sum + 20; // special cards
        }, 0)
      );

      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);

      // Update match as completed
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          winner_id: winnerId,
          total_duration: Math.floor((Date.now() - gameState.gameStartTime) / 1000),
          total_cards_played: totalCardsPlayed,
          highest_score: highestScore,
          lowest_score: lowestScore
        })
        .eq('id', matchId);

      if (matchError) {
        console.error('Error updating match:', matchError);
        return { success: false, error: matchError };
      }

      // Create participant records
      const participants = gameState.players.map((player, index) => {
        const finalScore = scores[index];
        const position = gameState.rankings?.find(r => r.player.id === player.id)?.rank || index + 1;

        return {
          match_id: matchId,
          user_id: player.playerType === 'human' ? player.id : null,
          player_name: player.name,
          player_type: player.playerType,
          bot_difficulty: player.difficulty,
          final_position: position,
          final_score: finalScore,
          cards_remaining: player.cards.length,
          cards_played: 7 - player.cards.length, // Assuming 7 starting cards
          // TODO: Add more detailed statistics tracking during gameplay
        };
      });

      const { error: participantsError } = await supabase
        .from('match_participants')
        .insert(participants);

      if (participantsError) {
        console.error('Error creating participants:', participantsError);
        return { success: false, error: participantsError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in completeMatch:', error);
      return { success: false, error };
    }
  }

  static async getMatchHistory(userId: string, limit = 20): Promise<{ matches: any[]; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { matches: [], error: new Error('Supabase not available') };
      }

      const { data, error } = await supabase
        .from('match_participants')
        .select(`
          *,
          matches:match_id (
            id,
            created_at,
            completed_at,
            game_mode,
            timer_mode,
            status,
            total_duration,
            is_bot_match,
            highest_score,
            lowest_score
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching match history:', error);
        return { matches: [], error };
      }

      return { matches: data || [], error: null };
    } catch (error) {
      console.error('Error in getMatchHistory:', error);
      return { matches: [], error };
    }
  }

  static async getLeaderboard(
    type: 'overall' | 'bot_games' | 'player_games' = 'overall',
    limit = 50
  ): Promise<{ leaderboard: any[]; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { leaderboard: [], error: new Error('Supabase not available') };
      }

      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profile:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('leaderboard_type', type)
        .order('win_rate', { ascending: false })
        .order('total_wins', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return { leaderboard: [], error };
      }

      // Add rank positions
      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank_position: index + 1
      }));

      return { leaderboard: rankedData, error: null };
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return { leaderboard: [], error };
    }
  }
}