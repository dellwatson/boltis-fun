import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Calendar,
  ArrowLeft,
  Settings,
  Mail,
  Star,
  Zap,
  Users,
  Bot,
  Crown,
  Medal,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MatchService } from '../services/MatchService';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { profile, user, updateProfile } = useAuth();
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements' | 'settings'>('overview');

  useEffect(() => {
    if (user) {
      loadMatchHistory();
    }
  }, [user]);

  const loadMatchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const { matches, error } = await MatchService.getMatchHistory(user.id);
    if (!error) {
      setMatchHistory(matches);
    }
    setLoading(false);
  };

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-spin">⚡</div>
          <h1 className="text-2xl font-bold">Loading Profile...</h1>
        </div>
      </div>
    );
  }

  const winRate = profile.total_matches > 0 ? (profile.total_wins / profile.total_matches) * 100 : 0;
  const botWinRate = profile.bot_matches > 0 ? (profile.bot_wins / profile.bot_matches) * 100 : 0;
  const playerWinRate = profile.player_matches > 0 ? (profile.player_wins / profile.player_matches) * 100 : 0;
  const averageScore = profile.total_matches > 0 ? profile.total_points_scored / profile.total_matches : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <motion.div
        className="max-w-6xl mx-auto px-4 py-8"
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
            <h1 className="text-4xl font-bold text-white">{profile.display_name || profile.username}</h1>
            <p className="text-white/80">@{profile.username}</p>
          </div>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Avatar & Basic Info */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{profile.display_name || profile.username}</h3>
              <p className="text-white/70">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>

            {/* Overall Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3">Overall Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-white/90">
                  <span>Total Matches:</span>
                  <span className="font-bold">{profile.total_matches}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Wins:</span>
                  <span className="font-bold text-green-400">{profile.total_wins}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Win Rate:</span>
                  <span className="font-bold">{winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Avg Score:</span>
                  <span className="font-bold">{averageScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Bot Games */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                vs Bots
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-white/90">
                  <span>Matches:</span>
                  <span className="font-bold">{profile.bot_matches}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Wins:</span>
                  <span className="font-bold text-green-400">{profile.bot_wins}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Win Rate:</span>
                  <span className="font-bold">{botWinRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Best Score:</span>
                  <span className="font-bold text-yellow-400">{profile.lowest_winning_score || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Player Games */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                vs Players
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-white/90">
                  <span>Matches:</span>
                  <span className="font-bold">{profile.player_matches}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Wins:</span>
                  <span className="font-bold text-green-400">{profile.player_wins}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Win Rate:</span>
                  <span className="font-bold">{playerWinRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Perfect Games:</span>
                  <span className="font-bold text-purple-400">{profile.perfect_games}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex gap-2 mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-2"
          variants={itemVariants}
        >
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'history', label: 'Match History', icon: Clock },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Achievement Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Perfect Games</h3>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400 mb-2">{profile.perfect_games}</p>
                  <p className="text-white/70">Won with 0 points</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Best Winning Score</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-400 mb-2">{profile.lowest_winning_score || 'N/A'}</p>
                  <p className="text-white/70">Lowest points to win</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-8 h-8 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Comeback Wins</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-400 mb-2">{profile.comeback_wins}</p>
                  <p className="text-white/70">Won from behind</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Recent Matches
                </h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/70">Loading matches...</p>
                  </div>
                ) : matchHistory.length > 0 ? (
                  <div className="space-y-3">
                    {matchHistory.slice(0, 5).map((match, index) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            match.final_position === 1 ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span className="text-white font-medium">
                            {match.matches.is_bot_match ? 'vs Bots' : 'vs Players'}
                          </span>
                          <span className="text-white/70">
                            {match.matches.game_mode}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {match.final_position === 1 ? 'WIN' : `#${match.final_position}`}
                          </p>
                          <p className="text-white/70 text-sm">
                            {match.final_score} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">No matches played yet</p>
                    <p className="text-white/50 text-sm">Start playing to see your history!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Complete Match History
              </h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/70">Loading match history...</p>
                </div>
              ) : matchHistory.length > 0 ? (
                <div className="space-y-3">
                  {matchHistory.map((match, index) => (
                    <motion.div
                      key={match.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          match.final_position === 1 ? 'bg-green-400' : 
                          match.final_position === 2 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {match.matches.is_bot_match ? 'vs Bots' : 'vs Players'}
                            </span>
                            <span className="text-white/50">•</span>
                            <span className="text-white/70 capitalize">
                              {match.matches.game_mode}
                            </span>
                          </div>
                          <p className="text-white/50 text-sm">
                            {new Date(match.matches.completed_at || match.matches.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {match.final_position === 1 ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <Crown className="w-4 h-4" />
                              WIN
                            </span>
                          ) : match.final_position === 2 ? (
                            <span className="text-yellow-400 flex items-center gap-1">
                              <Medal className="w-4 h-4" />
                              2nd
                            </span>
                          ) : (
                            `#${match.final_position}`
                          )}
                        </p>
                        <p className="text-white/70 text-sm">
                          {match.final_score} points
                        </p>
                        {match.matches.total_duration && (
                          <p className="text-white/50 text-xs">
                            {Math.floor(match.matches.total_duration / 60)}:{(match.matches.total_duration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">No Matches Yet</h4>
                  <p className="text-white/70 mb-6">Start playing to build your match history!</p>
                  <motion.button
                    onClick={onBack}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Your First Game
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Achievement Cards */}
                {[
                  {
                    title: 'First Victory',
                    description: 'Win your first match',
                    icon: Trophy,
                    unlocked: profile.total_wins > 0,
                    progress: Math.min(profile.total_wins, 1),
                    max: 1,
                    color: 'text-yellow-400'
                  },
                  {
                    title: 'Perfect Player',
                    description: 'Win a match with 0 points',
                    icon: Star,
                    unlocked: profile.perfect_games > 0,
                    progress: Math.min(profile.perfect_games, 1),
                    max: 1,
                    color: 'text-purple-400'
                  },
                  {
                    title: 'Bot Slayer',
                    description: 'Win 10 matches against bots',
                    icon: Bot,
                    unlocked: profile.bot_wins >= 10,
                    progress: Math.min(profile.bot_wins, 10),
                    max: 10,
                    color: 'text-green-400'
                  },
                  {
                    title: 'Veteran Player',
                    description: 'Play 50 total matches',
                    icon: Award,
                    unlocked: profile.total_matches >= 50,
                    progress: Math.min(profile.total_matches, 50),
                    max: 50,
                    color: 'text-blue-400'
                  },
                  {
                    title: 'Comeback King',
                    description: 'Win 5 comeback victories',
                    icon: TrendingUp,
                    unlocked: profile.comeback_wins >= 5,
                    progress: Math.min(profile.comeback_wins, 5),
                    max: 5,
                    color: 'text-orange-400'
                  },
                  {
                    title: 'Consistent Winner',
                    description: 'Achieve 70% win rate (min 20 games)',
                    icon: Target,
                    unlocked: profile.total_matches >= 20 && winRate >= 70,
                    progress: profile.total_matches >= 20 ? Math.min(winRate, 70) : 0,
                    max: 70,
                    color: 'text-red-400'
                  }
                ].map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      achievement.unlocked 
                        ? 'bg-white/15 border-white/30 shadow-lg' 
                        : 'bg-white/5 border-white/10'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <achievement.icon className={`w-8 h-8 ${
                        achievement.unlocked ? achievement.color : 'text-white/30'
                      }`} />
                      <h4 className={`font-bold ${
                        achievement.unlocked ? 'text-white' : 'text-white/50'
                      }`}>
                        {achievement.title}
                      </h4>
                    </div>
                    
                    <p className={`text-sm mb-4 ${
                      achievement.unlocked ? 'text-white/80' : 'text-white/40'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={achievement.unlocked ? 'text-white/80' : 'text-white/40'}>
                          Progress
                        </span>
                        <span className={achievement.unlocked ? 'text-white' : 'text-white/50'}>
                          {achievement.progress}/{achievement.max}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-r from-green-400 to-blue-400' 
                              : 'bg-white/20'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.max) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {achievement.unlocked && (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-medium">
                        <Star className="w-4 h-4" />
                        Unlocked!
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Account Settings
              </h3>
              
              <div className="space-y-6">
                {/* Profile Settings */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Profile Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.display_name || ''}
                        onChange={(e) => updateProfile({ display_name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter display name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Preferred Game Mode
                      </label>
                      <select
                        value={profile.preferred_game_mode}
                        onChange={(e) => updateProfile({ preferred_game_mode: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="classic">Classic</option>
                        <option value="time-bank">Time Bank</option>
                        <option value="blitz">Blitz</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-white/70" />
                        <span className="text-white">Email Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.email_notifications}
                        onChange={(e) => updateProfile({ email_notifications: e.target.checked })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Account Actions */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Account Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Change Password
                    </button>
                    <button className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      Export Data
                    </button>
                    <button className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProfilePage;