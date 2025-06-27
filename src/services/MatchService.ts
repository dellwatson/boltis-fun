import { supabase, Match, MatchParticipant } from '../lib/supabase';
import { GameState, Player } from '../types/game';

export class MatchService {
  static async createMatch(gameState: GameState, userId?: string, guestPlayer?: any): Promise<{ matchId: string | null; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { matchId: null, error: new Error('Supabase not available') };
      }

      // For guest players, create a guest profile first
      let effectiveUserId = userId;
      if (!userId && guestPlayer) {
        const { guestUserId, error: guestError } = await this.createGuestProfile(guestPlayer);
        if (guestError) {
          console.warn('Could not create guest profile:', guestError);
          // Continue without user ID - match will be anonymous
        } else {
          effectiveUserId = guestUserId;
        }
      }

      // Create the match record
      const matchData: any = {
        game_mode: gameState.settings.gameMode.mode,
        timer_mode: gameState.settings.gameMode.timerMode,
        max_players: gameState.players.length,
        match_duration: gameState.matchDuration,
        is_bot_match: gameState.players.some(p => p.playerType === 'bot'),
        is_ranked: true,
        status: 'in_progress'
      };

      // Add user_id if available (authenticated or guest)
      if (effectiveUserId) {
        matchData.user_id = effectiveUserId;
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

  static async createGuestProfile(guestPlayer: any): Promise<{ guestUserId: string | null; error: any }> {
    try {
      // Check if guest profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', guestPlayer.name)
        .eq('id', guestPlayer.id)
        .single();

      if (existingProfile) {
        return { guestUserId: existingProfile.id, error: null };
      }

      // Create new guest profile
      const guestProfileData = {
        id: guestPlayer.id, // Use the guest ID from localStorage
        username: guestPlayer.name,
        display_name: guestPlayer.name,
        created_at: new Date(guestPlayer.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
        
        // Initialize with current guest stats
        total_matches: guestPlayer.gamesPlayed || 0,
        total_wins: guestPlayer.wins || 0,
        total_losses: guestPlayer.losses || 0,
        
        // All matches for guests are bot matches
        bot_matches: guestPlayer.gamesPlayed || 0,
        bot_wins: guestPlayer.wins || 0,
        bot_losses: guestPlayer.losses || 0,
        
        // No player matches for guests
        player_matches: 0,
        player_wins: 0,
        player_losses: 0,
        
        // Initialize other stats
        total_points_scored: 0,
        total_points_lost: 0,
        highest_losing_score: 0,
        perfect_games: 0,
        comeback_wins: 0,
        
        preferred_game_mode: 'classic',
        email_notifications: false
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(guestProfileData)
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating guest profile:', createError);
        return { guestUserId: null, error: createError };
      }

      console.log('✅ Guest profile created:', newProfile.id);
      return { guestUserId: newProfile.id, error: null };
    } catch (error) {
      console.error('Error in createGuestProfile:', error);
      return { guestUserId: null, error };
    }
  }

  static async completeMatch(
    matchId: string,
    gameState: GameState,
    winnerId?: string,
    guestPlayer?: any
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { success: false, error: new Error('Supabase not available') };
      }

      // Calculate match statistics
      const totalCardsPlayed = gameState.allDiscardedCards.length;
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
          user_id: player.playerType === 'human' ? (winnerId || guestPlayer?.id) : null,
          player_name: player.name,
          player_type: player.playerType,
          bot_difficulty: player.difficulty,
          final_position: position,
          final_score: finalScore,
          cards_remaining: player.cards.length,
          cards_played: 7 - player.cards.length, // Assuming 7 starting cards
          special_cards_used: 0, // TODO: Track during gameplay
          void_cards_used: 0, // TODO: Track during gameplay
          stack_cards_used: 0, // TODO: Track during gameplay
        };
      });

      const { error: participantsError } = await supabase
        .from('match_participants')
        .insert(participants);

      if (participantsError) {
        console.error('Error creating participants:', participantsError);
        return { success: false, error: participantsError };
      }

      // Update guest player stats in localStorage if applicable
      if (guestPlayer && gameState.rankings) {
        const humanRanking = gameState.rankings.find(r => r.player.playerType === 'human');
        if (humanRanking) {
          const won = humanRanking.rank === 1;
          this.updateGuestStatsInStorage(guestPlayer.id, won, finalScore);
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in completeMatch:', error);
      return { success: false, error };
    }
  }

  static updateGuestStatsInStorage(guestId: string, won: boolean, finalScore: number): void {
    try {
      const storageKey = 'boltis-player-storage';
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;

      const playerData = JSON.parse(stored);
      if (!playerData.state?.guestPlayer || playerData.state.guestPlayer.id !== guestId) return;

      const guest = playerData.state.guestPlayer;
      
      // Update guest stats
      guest.gamesPlayed = (guest.gamesPlayed || 0) + 1;
      guest.wins = (guest.wins || 0) + (won ? 1 : 0);
      guest.losses = (guest.losses || 0) + (won ? 0 : 1);
      guest.winRate = guest.gamesPlayed > 0 ? (guest.wins / guest.gamesPlayed) * 100 : 0;
      guest.lastPlayed = Date.now();

      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(playerData));
      
      console.log('✅ Guest stats updated in localStorage');
    } catch (error) {
      console.error('Error updating guest stats in storage:', error);
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