import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface GuestPlayer {
  id: string;
  name: string;
  xp: number;
  level: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  createdAt: number;
  lastPlayed: number;
}

export interface PlayerStats {
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  xp: number;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

interface PlayerStore {
  // Guest player data
  guestPlayer: GuestPlayer | null;
  
  // Current player stats (guest or authenticated)
  currentStats: PlayerStats;
  
  // Actions
  initializeGuestPlayer: () => void;
  updateGuestStats: (won: boolean, xpGained: number) => void;
  calculateLevel: (xp: number) => { level: number; currentXP: number; xpToNextLevel: number };
  generateGuestName: () => string;
  resetGuestPlayer: () => void;
}

const XP_PER_LEVEL = 100;
const BASE_XP_GAIN = 50;
const WIN_XP_BONUS = 25;

export const usePlayerStore = create<PlayerStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      guestPlayer: null,
      currentStats: {
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        xp: 0,
        level: 1,
        currentXP: 0,
        xpToNextLevel: XP_PER_LEVEL
      },

      generateGuestName: () => {
        const adjectives = ['Swift', 'Mighty', 'Clever', 'Bold', 'Fierce', 'Noble', 'Wise', 'Quick'];
        const elements = ['Fire', 'Water', 'Plant', 'Thunder', 'Storm', 'Flame', 'Wave', 'Leaf'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        const randomNumber = Math.floor(Math.random() * 999) + 1;
        return `${randomAdjective}${randomElement}${randomNumber}`;
      },

      calculateLevel: (xp: number) => {
        const level = Math.floor(xp / XP_PER_LEVEL) + 1;
        const currentXP = xp % XP_PER_LEVEL;
        const xpToNextLevel = XP_PER_LEVEL - currentXP;
        return { level, currentXP, xpToNextLevel };
      },

      initializeGuestPlayer: () => {
        const existing = get().guestPlayer;
        if (existing) {
          // Update current stats from existing guest player
          const levelInfo = get().calculateLevel(existing.xp);
          set({
            currentStats: {
              totalMatches: existing.gamesPlayed,
              totalWins: existing.wins,
              totalLosses: existing.losses,
              winRate: existing.winRate,
              xp: existing.xp,
              level: levelInfo.level,
              currentXP: levelInfo.currentXP,
              xpToNextLevel: levelInfo.xpToNextLevel
            }
          });
          return;
        }

        const guestName = get().generateGuestName();
        const newGuest: GuestPlayer = {
          id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: guestName,
          xp: 0,
          level: 1,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          createdAt: Date.now(),
          lastPlayed: Date.now()
        };

        set({ 
          guestPlayer: newGuest,
          currentStats: {
            totalMatches: 0,
            totalWins: 0,
            totalLosses: 0,
            winRate: 0,
            xp: 0,
            level: 1,
            currentXP: 0,
            xpToNextLevel: XP_PER_LEVEL
          }
        });
      },

      updateGuestStats: (won: boolean, xpGained: number) => {
        const guest = get().guestPlayer;
        if (!guest) return;

        const newXP = guest.xp + xpGained;
        const newGamesPlayed = guest.gamesPlayed + 1;
        const newWins = guest.wins + (won ? 1 : 0);
        const newLosses = guest.losses + (won ? 0 : 1);
        const newWinRate = newGamesPlayed > 0 ? (newWins / newGamesPlayed) * 100 : 0;
        const levelInfo = get().calculateLevel(newXP);

        const updatedGuest: GuestPlayer = {
          ...guest,
          xp: newXP,
          level: levelInfo.level,
          gamesPlayed: newGamesPlayed,
          wins: newWins,
          losses: newLosses,
          winRate: newWinRate,
          lastPlayed: Date.now()
        };

        set({
          guestPlayer: updatedGuest,
          currentStats: {
            totalMatches: newGamesPlayed,
            totalWins: newWins,
            totalLosses: newLosses,
            winRate: newWinRate,
            xp: newXP,
            level: levelInfo.level,
            currentXP: levelInfo.currentXP,
            xpToNextLevel: levelInfo.xpToNextLevel
          }
        });
      },

      resetGuestPlayer: () => {
        set({ 
          guestPlayer: null,
          currentStats: {
            totalMatches: 0,
            totalWins: 0,
            totalLosses: 0,
            winRate: 0,
            xp: 0,
            level: 1,
            currentXP: 0,
            xpToNextLevel: XP_PER_LEVEL
          }
        });
      }
    })),
    {
      name: 'boltis-player-storage',
      partialize: (state) => ({ guestPlayer: state.guestPlayer })
    }
  )
);

// Calculate XP gained from a match
export const calculateXPGain = (won: boolean, matchDuration: number, opponentCount: number): number => {
  let xp = BASE_XP_GAIN;
  
  if (won) {
    xp += WIN_XP_BONUS;
  }
  
  // Bonus for longer matches
  if (matchDuration > 300) { // 5+ minutes
    xp += 10;
  }
  
  // Bonus for more opponents
  xp += (opponentCount - 1) * 5;
  
  return Math.floor(xp);
};