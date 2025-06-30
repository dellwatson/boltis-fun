import React from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, Home } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onSettings: () => void;
  onHome: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume, onSettings, onHome }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <h2 className="text-3xl font-bold text-white mb-6">Game Paused</h2>
        <div className="space-y-4">
          <motion.button
            onClick={onResume}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5" />
            Resume Game
          </motion.button>
          <motion.button
            onClick={onSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-5 h-5" />
            Settings
          </motion.button>
          <motion.button
            onClick={onHome}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PauseOverlay;