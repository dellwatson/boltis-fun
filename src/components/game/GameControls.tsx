import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pause, 
  Play, 
  Settings, 
  Home, 
  Eye, 
  EyeOff,
  RotateCcw,
  Clock
} from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  showBotCards: boolean;
  gamePhase: string;
  onPause: () => void;
  onResume: () => void;
  onSettings: () => void;
  onHome: () => void;
  onToggleBotCards: () => void;
  matchTimeRemaining?: number;
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  showBotCards,
  gamePhase,
  onPause,
  onResume,
  onSettings,
  onHome,
  onToggleBotCards,
  matchTimeRemaining,
  className = ''
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed top-4 right-4 flex flex-col gap-3 z-30 ${className}`}>
      {/* Match Timer */}
      {matchTimeRemaining !== undefined && matchTimeRemaining > 0 && (
        <motion.div
          className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">
            {formatTime(matchTimeRemaining)}
          </span>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col gap-2">
        {/* Pause/Resume */}
        <motion.button
          onClick={isPaused ? onResume : onPause}
          className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-colors ${
            isPaused 
              ? 'bg-green-500/80 hover:bg-green-600/80' 
              : 'bg-yellow-500/80 hover:bg-yellow-600/80'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={gamePhase === 'ended' || gamePhase === 'color-selection'}
        >
          {isPaused ? (
            <Play className="w-5 h-5 text-white" />
          ) : (
            <Pause className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          onClick={onSettings}
          className="p-3 bg-blue-500/80 hover:bg-blue-600/80 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings className="w-5 h-5 text-white" />
        </motion.button>

        {/* Toggle Bot Cards */}
        <motion.button
          onClick={onToggleBotCards}
          className="p-3 bg-purple-500/80 hover:bg-purple-600/80 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showBotCards ? (
            <EyeOff className="w-5 h-5 text-white" />
          ) : (
            <Eye className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Home */}
        <motion.button
          onClick={onHome}
          className="p-3 bg-red-500/80 hover:bg-red-600/80 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Home className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default GameControls;