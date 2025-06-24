import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Player, Card as CardType, TimerMode, ElementType } from '../types/game';
import { Crown, User, Clock } from 'lucide-react';
import PlayerHand from './PlayerHand';

interface PlayerAreaProps {
  player: Player;
  position: 'top' | 'left' | 'right' | 'bottom';
  isActive: boolean;
  isHuman: boolean;
  canPlay: boolean;
  topCard: CardType;
  onCardPlay: (cardId: string) => void;
  showBotCards: boolean;
  drawingAnimation?: {
    playerIndex: number;
    cardId: string;
    isActive?: boolean;
    phase?: string;
    drawnCard?: CardType;
  } | null;
  playerIndex: number;
  timeRemaining: number;
  totalTime: number;
  timeBankRemaining?: number;
  totalTimeBank?: number;
  timerMode: TimerMode;
  // ✅ NEW: Void state props
  voidActive?: boolean;
  voidSelectedColor?: ElementType | null;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({
  player,
  position,
  isActive,
  isHuman,
  canPlay,
  topCard,
  onCardPlay,
  showBotCards,
  drawingAnimation,
  playerIndex,
  timeRemaining,
  totalTime,
  timeBankRemaining,
  totalTimeBank,
  timerMode,
  voidActive = false,
  voidSelectedColor = null,
}) => {
  const timerRef = useRef<HTMLDivElement>(null);
  const prevTimeRef = useRef(timeRemaining);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!timerRef.current || !isActive) return;

    const animateTimer = () => {
      if (!timerRef.current) return;

      const progress = timerMode === 'time-bank' 
        ? ((timeBankRemaining || 0) / (totalTimeBank || 1)) * 100
        : (timeRemaining / totalTime) * 100;

      timerRef.current.style.width = `${Math.max(0, progress)}%`;
      timerRef.current.style.transition = 'width 0.1s linear';
    };

    if (timeRemaining !== prevTimeRef.current) {
      animateTimer();
      prevTimeRef.current = timeRemaining;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, timeRemaining, totalTime, timeBankRemaining, totalTimeBank, timerMode]);

  const getTimerColor = () => {
    if (!isActive || timeRemaining <= 0) return '#EF4444';
    
    const progress = timerMode === 'time-bank'
      ? ((timeBankRemaining || 0) / (totalTimeBank || 1)) * 100
      : (timeRemaining / totalTime) * 100;

    if (progress <= 20) return '#EF4444';
    if (progress <= 40) return '#F59E0B';
    return '#10B981';
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0';
      case 'top':
        return 'fixed top-6 left-1/2 -translate-x-1/2';
      case 'left':
        return 'fixed left-6 top-1/2 -translate-y-1/2';
      case 'right':
        return 'fixed right-6 top-1/2 -translate-y-1/2';
    }
  };

  const playerVariants = {
    inactive: {
      scale: 1,
      transition: { duration: 0.3 },
    },
    active: {
      scale: 1.02,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isHuman) {
    return (
      <motion.div
        className={`${getPositionClasses()} flex flex-col items-center gap-3 z-10`}
        variants={playerVariants}
        animate={isActive ? 'active' : 'inactive'}
        initial="inactive"
      >
        <div className="relative">
          <motion.div
            className={`
              relative flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm
              w-[180px] justify-between overflow-hidden m-1.5
              ${
                isActive
                  ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30'
                  : 'bg-white/90 text-gray-800'
              }
              ${player.isEliminated ? 'opacity-50 grayscale' : ''}
            `}
            style={{ zIndex: 10 }}
            whileHover={{ scale: 1.05 }}
          >
            {isActive && !player.isEliminated && (
              <div
                ref={timerRef}
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  backgroundColor: getTimerColor(),
                  zIndex: 1,
                  width: '100%'
                }}
              />
            )}

            <div className="relative z-10 flex items-center gap-3 w-full justify-between">
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${isActive ? 'bg-yellow-600' : 'bg-gray-300'}
                `}
                animate={
                  isActive && !player.isEliminated
                    ? {
                        boxShadow: [
                          '0 0 0 0 rgba(234, 179, 8, 0.7)',
                          '0 0 0 8px rgba(234, 179, 8, 0)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              >
                <User className="w-4 h-4 text-white" />
              </motion.div>

              <div className="flex-1 text-center">
                <span className="font-semibold text-sm truncate block">
                  {player.name}
                </span>
                {timerMode === 'time-bank' && timeBankRemaining !== undefined && (
                  <div className="text-xs opacity-75">
                    Bank: {formatTime(timeBankRemaining)}
                  </div>
                )}
              </div>

              <motion.span
                className={`
                  w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0
                  ${
                    isActive
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }
                `}
                key={player.cards.length}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {player.cards.length}
              </motion.span>
            </div>

            {player.isEliminated && (
              <div className="absolute inset-0 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-xs">ELIMINATED</span>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {isActive && !player.isEliminated && (
              <motion.div
                className="absolute -top-2 -right-2"
                style={{ zIndex: 50 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-yellow-500 rounded-full p-1 shadow-lg border-2 border-yellow-300"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <Crown className="w-3 h-3 text-yellow-900" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <PlayerHand
            cards={player.cards}
            onCardPlay={onCardPlay}
            canPlay={canPlay}
            topCard={topCard}
            isHuman={isHuman}
            position={position}
            showBotCards={showBotCards}
            drawingAnimation={
              drawingAnimation && drawingAnimation.playerIndex === playerIndex
                ? drawingAnimation
                : null
            }
            // ✅ PASS VOID STATE
            voidActive={voidActive}
            voidSelectedColor={voidSelectedColor}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${getPositionClasses()} flex flex-col items-center z-10`}
      variants={playerVariants}
      animate={isActive ? 'active' : 'inactive'}
      initial="inactive"
    >
      <div className="relative w-full flex justify-center mb-4">
        <PlayerHand
          cards={player.cards}
          onCardPlay={onCardPlay}
          canPlay={canPlay}
          topCard={topCard}
          isHuman={isHuman}
          position={position}
          showBotCards={showBotCards}
          drawingAnimation={
            drawingAnimation && drawingAnimation.playerIndex === playerIndex
              ? drawingAnimation
              : null
          }
          // ✅ PASS VOID STATE
          voidActive={voidActive}
          voidSelectedColor={voidSelectedColor}
        />
      </div>

      <div className="relative">
        <motion.div
          className={`
            relative flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-sm
            w-[240px] justify-between overflow-hidden m-2
            ${
              isActive
                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30'
                : 'bg-white/90 text-gray-800'
            }
          `}
          style={{ zIndex: 10 }}
          whileHover={{ scale: 1.05 }}
        >
          {isActive && (
            <div
              ref={timerRef}
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                backgroundColor: getTimerColor(),
                zIndex: 1,
                width: '100%'
              }}
            />
          )}

          <div className="relative z-10 flex items-center gap-4 w-full justify-between">
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${isActive ? 'bg-yellow-600' : 'bg-gray-300'}
              `}
            >
              <User className="w-5 h-5 text-white" />
            </motion.div>

            <div className="flex-1 text-center">
              <span className="font-bold text-lg block">{player.name}</span>
              {timerMode === 'time-bank' && timeBankRemaining !== undefined && (
                <div className="text-sm opacity-75 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Bank: {formatTime(timeBankRemaining)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute -top-3 -right-3"
              style={{ zIndex: 50 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <motion.div
                className="bg-yellow-500 rounded-full p-2 shadow-lg border-2 border-yellow-300"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Crown className="w-4 h-4 text-yellow-900" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PlayerArea;