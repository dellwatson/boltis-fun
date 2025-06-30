import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEvent } from '../../types/game';
import { formatCardForDisplay } from '../../utils/gameLogic';

interface DebugLogProps {
  events: GameEvent[];
  isVisible: boolean;
  onToggle: () => void;
}

const DebugLog: React.FC<DebugLogProps> = ({ events, isVisible, onToggle }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-4 w-80 max-h-96 bg-black/80 text-white p-4 rounded-lg z-50 overflow-y-auto"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Game Events</h3>
            <button
              onClick={onToggle}
              className="text-white/60 hover:text-white text-xs"
            >
              Hide
            </button>
          </div>
          <div className="space-y-1 text-xs">
            {events.slice(0, 20).map((event) => (
              <div key={event.id} className="border-b border-white/20 pb-1">
                <div className="text-yellow-400 font-mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-white/90">{event.message}</div>
                {event.details && (
                  <div className="text-white/60 text-xs">
                    {JSON.stringify(event.details, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DebugLog;