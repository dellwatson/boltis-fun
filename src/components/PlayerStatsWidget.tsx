import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Target, TrendingUp, User, Crown } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useAuth } from '../hooks/useAuth';

interface PlayerStatsWidgetProps {
  className?: string;
}

const PlayerStatsWidget: React.FC<PlayerStatsWidgetProps> = ({ className = '' }) => {
  const { currentStats, guestPlayer } = usePlayerStore();
  const { user, profile } = useAuth();

  const isGuest = !user && guestPlayer;
  const playerName = user ? (profile?.display_name || profile?.username) : guestPlayer?.name || 'Guest';

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'from-purple-500 to-pink-500';
    if (level >= 15) return 'from-blue-500 to-purple-500';
    if (level >= 10) return 'from-green-500 to-blue-500';
    if (level >= 5) return 'from-yellow-500 to-green-500';
    return 'from-gray-400 to-gray-500';
  };

  const getRankTitle = (level: number) => {
    if (level >= 20) return 'Elemental Master';
    if (level >= 15) return 'Storm Caller';
    if (level >= 10) return 'Element Wielder';
    if (level >= 5) return 'Card Apprentice';
    return 'Novice Player';
  };

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Player Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className={`w-12 h-12 bg-gradient-to-br ${getLevelColor(currentStats.level)} rounded-full flex items-center justify-center relative`}
          whileHover={{ scale: 1.05 }}
        >
          {isGuest ? (
            <User className="w-6 h-6 text-white" />
          ) : (
            <Crown className="w-6 h-6 text-white" />
          )}
          
          {/* Level Badge */}
          <div className="absolute -bottom-1 -right-1 bg-white text-gray-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
            {currentStats.level}
          </div>
        </motion.div>
        
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">{playerName}</h3>
          <p className="text-white/70 text-sm">{getRankTitle(currentStats.level)}</p>
          {isGuest && (
            <p className="text-yellow-400 text-xs">Guest Player</p>
          )}
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm font-medium">Level {currentStats.level}</span>
          <span className="text-white/80 text-sm">
            {currentStats.currentXP}/{currentStats.currentXP + currentStats.xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className={`bg-gradient-to-r ${getLevelColor(currentStats.level)} h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={{ 
              width: `${(currentStats.currentXP / (currentStats.currentXP + currentStats.xpToNextLevel)) * 100}%` 
            }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-white/60 text-xs mt-1">
          {currentStats.xpToNextLevel} XP to next level
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-white font-bold text-lg">{currentStats.totalWins}</div>
          <div className="text-white/70 text-xs">Wins</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-white font-bold text-lg">{currentStats.totalMatches}</div>
          <div className="text-white/70 text-xs">Matches</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-white font-bold text-lg">{currentStats.winRate.toFixed(1)}%</div>
          <div className="text-white/70 text-xs">Win Rate</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-white font-bold text-lg">{currentStats.xp}</div>
          <div className="text-white/70 text-xs">Total XP</div>
        </div>
      </div>

      {/* Guest Player Note */}
      {isGuest && (
        <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
          <p className="text-yellow-200 text-xs text-center">
            Sign up to save your progress and compete on leaderboards!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerStatsWidget;