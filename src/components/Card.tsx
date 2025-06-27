import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, ELEMENT_COLORS } from '../types/game';
import {
  Zap,
  Flame,
  Droplets,
  Leaf,
  SkipForward,
  RotateCcw,
  Layers,
  Cuboid as Void,
  CircleOff,
  Sword
} from 'lucide-react';

interface CardProps {
  card: CardType;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  index?: number;
  animate?: boolean;
  isCardBack?: boolean; // New prop for showing card backs
}

const Card: React.FC<CardProps> = ({
  card,
  isPlayable = false,
  isSelected = false,
  onClick,
  size = 'medium',
  className = '',
  index = 0,
  animate = true,
  isCardBack = false,
}) => {
  const getElementIcon = () => {
    const iconSize =
      size === 'small'
        ? 'w-2 h-2'
        : size === 'medium'
        ? 'w-2.5 h-2.5'
        : 'w-3 h-3';
    switch (card.element) {
      case 'fire':
        return <Flame className={iconSize} />;
      case 'water':
        return <Droplets className={iconSize} />;
      case 'plant':
        return <Leaf className={iconSize} />;
      case 'thunder':
        return <Zap className={iconSize} />;
    }
  };

  const getCardIcon = () => {
    const iconSize =
      size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-6 h-6';
    switch (card.type) {
      case 'skip':
        return <CircleOff className={iconSize} />;
      case 'reverse':
        return <RotateCcw className={iconSize} />;
      case 'stack':
        return <Layers className={iconSize} />;
      case 'void':
        return <Void className={iconSize} />;
      case 'strike':
        return <Sword className={iconSize} />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-14';
      case 'medium':
        return 'w-16 h-24';
      case 'large':
        return 'w-20 h-30';
    }
  };

  const getCornerSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-base';
    }
  };

  const getCenterSize = () => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'medium':
        return 'text-3xl';
      case 'large':
        return 'text-5xl';
    }
  };

  const backgroundColor =
    card.type === 'void' ? '#1F2937' : ELEMENT_COLORS[card.element];
  const textColor = '#FFFFFF';

  // ✅ PREMIUM CARD BACK DESIGN - EXACTLY LIKE DRAW PILE
  if (isCardBack) {
    return (
      <motion.div
        className={`
          ${getSizeClasses()}
          rounded-lg border-2 border-white/30 relative overflow-hidden
          bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900
          flex items-center justify-center
          shadow-lg
          ${className}
        `}
        initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: animate ? index * 0.05 : 0 }}
      >
        {/* ✅ PREMIUM CARD BACK PATTERN - MATCHES DRAW PILE EXACTLY */}
        <div className="text-white/50 text-center flex flex-col items-center justify-center h-full relative z-10">
          <div
            className={`font-bold mb-2 tracking-wider ${
              size === 'small'
                ? 'text-xs'
                : size === 'medium'
                ? 'text-sm'
                : 'text-base'
            }`}
          >
            BOLTIS
          </div>
          <div
            className={`border-2 border-white/50 rounded rotate-45 mb-2 ${
              size === 'small'
                ? 'w-4 h-4'
                : size === 'medium'
                ? 'w-6 h-6'
                : 'w-8 h-8'
            }`}
          ></div>
          <div
            className={`font-bold tracking-wider ${
              size === 'small'
                ? 'text-xs'
                : size === 'medium'
                ? 'text-sm'
                : 'text-base'
            }`}
          >
            ✨
          </div>
        </div>

        {/* ✅ PREMIUM GRADIENT OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-white/5 via-transparent to-transparent pointer-events-none"></div>

        {/* ✅ SUBTLE BORDER HIGHLIGHT */}
        <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
      </motion.div>
    );
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        delay: animate ? index * 0.05 : 0,
        type: 'spring',
        stiffness: 200,
      },
    },
    hover: {
      scale: 1.05,
      y: -8,
      transition: {
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
      },
    },
    selected: {
      scale: 1.1,
      y: -16,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      className={`
        ${getSizeClasses()}
        rounded-lg border-2 cursor-pointer relative overflow-hidden
        flex flex-col items-center justify-center text-white font-bold
        ${
          isPlayable
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/30'
            : 'border-white/20'
        }
        ${className}
      `}
      style={{
        backgroundColor,
        zIndex: isSelected ? 50 : index,
      }}
      onClick={onClick}
      variants={cardVariants}
      initial={animate ? 'hidden' : 'visible'}
      animate={isSelected ? 'selected' : 'visible'}
      whileHover={onClick && !isSelected ? 'hover' : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {/* TOP RIGHT CORNER - Number OR Special Icon */}
      <div className="absolute top-1 right-1 flex flex-col items-center">
        {card.type === 'number' ? (
          <>
            <span
              className={`${getCornerSize()} font-black leading-none`}
              style={{ color: textColor }}
            >
              {card.value}
            </span>
            <div className="mt-0.5">{getElementIcon()}</div>
          </>
        ) : (
          <>
            <div className="mb-0.5">{getCardIcon()}</div>
            <div>{getElementIcon()}</div>
          </>
        )}
      </div>

      {/* BOTTOM LEFT CORNER - Number OR Special Icon (Rotated 180°) */}
      <div className="absolute bottom-1 left-1 flex flex-col items-center rotate-180">
        {card.type === 'number' ? (
          <>
            <span
              className={`${getCornerSize()} font-black leading-none`}
              style={{ color: textColor }}
            >
              {card.value}
            </span>
            <div className="mt-0.5">{getElementIcon()}</div>
          </>
        ) : (
          <>
            <div className="mb-0.5">{getCardIcon()}</div>
            <div>{getElementIcon()}</div>
          </>
        )}
      </div>

      {/* CENTER - Main content */}
      <div className="flex flex-col items-center justify-center h-full z-10">
        {card.type === 'number' ? (
          <span
            className={`${getCenterSize()} font-black`}
            style={{ color: textColor }}
          >
            {card.value}
          </span>
        ) : (
          <div>{getCardIcon()}</div>
        )}
      </div>

      {/* Playable glow effect */}
      {isPlayable && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              '0 0 0px rgba(234, 179, 8, 0.5)',
              '0 0 20px rgba(234, 179, 8, 0.8)',
              '0 0 0px rgba(234, 179, 8, 0.5)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
};

export default Card;