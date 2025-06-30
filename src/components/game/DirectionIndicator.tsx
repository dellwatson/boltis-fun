import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw, RotateCcw } from 'lucide-react';

interface DirectionIndicatorProps {
  direction: 1 | -1;
  className?: string;
}

const DirectionIndicator: React.FC<DirectionIndicatorProps> = ({ direction, className = '' }) => {
  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30"
        animate={{
          rotate: direction === 1 ? [0, 360] : [0, -360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {direction === 1 ? (
          <RotateCw className="w-6 h-6 text-white" />
        ) : (
          <RotateCcw className="w-6 h-6 text-white" />
        )}
      </motion.div>
      <div className="ml-3 text-white/80 text-sm font-medium">
        {direction === 1 ? 'Clockwise' : 'Counter-clockwise'}
      </div>
    </motion.div>
  );
};

export default DirectionIndicator;