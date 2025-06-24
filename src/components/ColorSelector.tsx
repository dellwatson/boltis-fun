import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementType, ELEMENT_COLORS, ELEMENT_NAMES } from '../types/game';
import { Flame, Droplets, Leaf, Zap, Clock } from 'lucide-react';

interface ColorSelectorProps {
  onColorSelect: (element: ElementType) => void;
  timeLimit?: number; // Time limit in seconds
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ onColorSelect, timeLimit = 3 }) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-select random color when time runs out
          const colors: ElementType[] = ['fire', 'water', 'plant', 'thunder'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          onColorSelect(randomColor);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onColorSelect]);

  const getElementIcon = (element: ElementType) => {
    switch (element) {
      case 'fire': return <Flame className="w-8 h-8" />;
      case 'water': return <Droplets className="w-8 h-8" />;
      case 'plant': return <Leaf className="w-8 h-8" />;
      case 'thunder': return <Zap className="w-8 h-8" />;
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -90
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: 90,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const progressPercentage = (timeRemaining / timeLimit) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="bg-white rounded-xl p-8 shadow-2xl relative"
        variants={modalVariants}
      >
        {/* ✅ Timer Display */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className={`font-bold text-lg ${timeRemaining <= 1 ? 'text-red-500' : 'text-gray-700'}`}>
            {timeRemaining}s
          </span>
        </div>

        {/* ✅ Timer Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-xl overflow-hidden">
          <motion.div
            className={`h-full ${timeRemaining <= 1 ? 'bg-red-500' : 'bg-blue-500'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>

        <motion.h2 
          className="text-2xl font-bold text-center mb-6 text-gray-800 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Choose a Color
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(['fire', 'water', 'plant', 'thunder'] as ElementType[]).map((element, index) => (
            <motion.button
              key={element}
              onClick={() => onColorSelect(element)}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-300 transition-all duration-200"
              style={{ backgroundColor: ELEMENT_COLORS[element] + '20' }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <motion.div 
                style={{ color: ELEMENT_COLORS[element] }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              >
                {getElementIcon(element)}
              </motion.div>
              <span className="font-semibold text-gray-700">
                {ELEMENT_NAMES[element]}
              </span>
              
              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ 
                      backgroundColor: ELEMENT_COLORS[element],
                      left: `${30 + i * 20}%`,
                      top: `${40 + (i % 2) * 20}%`
                    }}
                    animate={{
                      y: [-5, -15, -5],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3 + index * 0.1,
                      repeatDelay: 1
                    }}
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* ✅ Auto-select warning */}
        {timeRemaining <= 2 && (
          <motion.div
            className="mt-4 text-center text-red-600 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {timeRemaining === 1 ? 'Auto-selecting random color...' : 'Choose quickly!'}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ColorSelector;