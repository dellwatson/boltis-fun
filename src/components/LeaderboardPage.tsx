import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Target, 
  Users, 
  Bot, 
  TrendingUp,
  ArrowLeft,
  Star,
  Zap,
  Calendar
} from 'lucide-react';
import { MatchService } from '../services/MatchService';
import { LeaderboardEntry } from '../lib/supabase';

interface LeaderboardPageProps {
  onBack: () => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onBack }) => {
  const [leaderboardType, setLeaderboardType] = useState<'overall' | 'bot_games' | 'player_games'>('overall');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { leaderboard: data, error } = await MatchService.getLeaderboard(leaderboardType);
    if (!error) {
      setLeaderboard(data);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-400/30';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <motion.div
        className="max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
          <motion.button
            onClick={onBack}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Leaderboards
            </h1>
            <p className="text-white/80">Compete with the best BOLTIS players</p>
          </div>
        </motion.div>

        {/* Leaderboard Type Selector */}
        <motion.div 
          className="flex gap-2 mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-2"
          variants={itemVariants}
        >
          {[
            { id: 'overall', label: 'Overall', icon: Target, desc: 'All matches combined' },
            { id: 'bot_games', label: 'vs Bots', icon: Bot, desc: 'Bot matches only' },
            { id: 'player_games', label: 'vs Players', icon: Users, desc: 'Player matches only' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setLeaderboardType(tab.id as any)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 px-4 rounded-md transition-all duration-200 ${
                leaderboardType === tab.id 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs opacity-70">{tab.desc}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Leaderboard Content */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/50 to-blue-600/50 p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white mb-2">
              {leaderboardType === 'overall' && 'Overall Rankings'}
              {leaderboardType === 'bot_games' && 'Bot Game Champions'}
              {leaderboardType === 'player_games' && 'Player vs Player Elite'}
            </h2>
            <p className="text-white/80">
              Rankings based on win rate and total victories
            </p>
          </div>

          {/* Leaderboard List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/70">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getRankColor(entry.rank_position || index + 1)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ 
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank_position || index + 1)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">
                          {entry.profile?.display_name || entry.profile?.username || 'Unknown Player'}
                        </h3>
                        {(entry.rank_position || index + 1) <= 3 && (
                          <Star className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-white/70 text-sm">
                        @{entry.profile?.username || 'unknown'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-right">
                      {/* Win Rate */}
                      <div>
                        <div className="text-white font-bold text-lg">
                          {entry.win_rate.toFixed(1)}%
                        </div>
                        <div className="text-white/60 text-xs">Win Rate</div>
                      </div>

                      {/* Total Wins */}
                      <div>
                        <div className="text-green-400 font-bold text-lg">
                          {entry.total_wins}
                        </div>
                        <div className="text-white/60 text-xs">Wins</div>
                      </div>

                      {/* Total Matches */}
                      <div>
                        <div className="text-blue-400 font-bold text-lg">
                          {entry.total_matches}
                        </div>
                        <div className="text-white/60 text-xs">Matches</div>
                      </div>

                      {/* Average Score */}
                      <div>
                        <div className="text-purple-400 font-bold text-lg">
                          {entry.average_score.toFixed(1)}
                        </div>
                        <div className="text-white/60 text-xs">Avg Score</div>
                      </div>

                      {/* Best Score */}
                      {entry.best_score !== null && (
                        <div>
                          <div className="text-yellow-400 font-bold text-lg">
                            {entry.best_score}
                          </div>
                          <div className="text-white/60 text-xs">Best</div>
                        </div>
                      )}
                    </div>

                    {/* Rank Change Indicator */}
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-white/30">
                        #{entry.rank_position || index + 1}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
                <p className="text-white/70 mb-6">
                  Be the first to appear on the {leaderboardType.replace('_', ' ')} leaderboard!
                </p>
                <motion.button
                  onClick={onBack}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Playing
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            variants={itemVariants}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">
                {Math.max(...leaderboard.map(e => e.win_rate)).toFixed(1)}%
              </h3>
              <p className="text-white/70">Highest Win Rate</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">
                {Math.max(...leaderboard.map(e => e.total_wins))}
              </h3>
              <p className="text-white/70">Most Wins</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">
                {Math.min(...leaderboard.filter(e => e.best_score !== null).map(e => e.best_score!))}
              </h3>
              <p className="text-white/70">Best Winning Score</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;