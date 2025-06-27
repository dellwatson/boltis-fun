import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, Globe, Gamepad2 } from 'lucide-react';

interface LivePlayersWidgetProps {
  className?: string;
}

const LivePlayersWidget: React.FC<LivePlayersWidgetProps> = ({ className = '' }) => {
  const [liveStats, setLiveStats] = useState({
    totalPlayers: 0,
    playersInGame: 0,
    playersInQueue: 0,
    activeMatches: 0
  });

  useEffect(() => {
    // Simulate live player counts
    const updateStats = () => {
      const baseTime = Date.now();
      const timeOfDay = new Date().getHours();
      
      // Simulate more players during peak hours (6 PM - 11 PM)
      const isPeakHours = timeOfDay >= 18 && timeOfDay <= 23;
      const peakMultiplier = isPeakHours ? 2.5 : 1;
      
      // Generate realistic numbers with some randomness
      const totalPlayers = Math.floor((150 + Math.sin(baseTime / 10000) * 50) * peakMultiplier);
      const playersInGame = Math.floor(totalPlayers * 0.7);
      const playersInQueue = Math.floor(totalPlayers * 0.15);
      const activeMatches = Math.floor(playersInGame / 4);
      
      setLiveStats({
        totalPlayers,
        playersInGame,
        playersInQueue,
        activeMatches
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-3 h-3 bg-green-400 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <h3 className="font-bold text-white">Live Players</h3>
        <Wifi className="w-4 h-4 text-green-400" />
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-white/80 text-sm">Online Now</span>
          </div>
          <motion.span 
            className="text-white font-bold"
            key={liveStats.totalPlayers}
            initial={{ scale: 1.2, color: '#60A5FA' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.3 }}
          >
            {liveStats.totalPlayers.toLocaleString()}
          </motion.span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-green-400" />
            <span className="text-white/80 text-sm">In Game</span>
          </div>
          <motion.span 
            className="text-white font-bold"
            key={liveStats.playersInGame}
            initial={{ scale: 1.2, color: '#34D399' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.3 }}
          >
            {liveStats.playersInGame.toLocaleString()}
          </motion.span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-sm">In Queue</span>
          </div>
          <motion.span 
            className="text-white font-bold"
            key={liveStats.playersInQueue}
            initial={{ scale: 1.2, color: '#FBBF24' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.3 }}
          >
            {liveStats.playersInQueue.toLocaleString()}
          </motion.span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400 rounded-sm" />
            <span className="text-white/80 text-sm">Active Matches</span>
          </div>
          <motion.span 
            className="text-white font-bold"
            key={liveStats.activeMatches}
            initial={{ scale: 1.2, color: '#A855F7' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.3 }}
          >
            {liveStats.activeMatches.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="flex items-center justify-center gap-2 text-green-400">
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-sm font-medium">Servers Online</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LivePlayersWidget;