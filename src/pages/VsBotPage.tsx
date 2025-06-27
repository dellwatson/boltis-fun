import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameModeConfig } from '../types/game';
import GameBoard from '../components/GameBoard';

const VsBotPage = () => {
  const navigate = useNavigate();
  const { initializeGame } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startBotGame = async () => {
      try {
        const gameMode: GameModeConfig = {
          mode: 'classic',
          timerMode: 'turn-based',
          eliminationRules: false,
          pauseEnabled: true,
          stackMode: 'destroy-weak',
          includeBombCards: true,
          maxPlayers: 4,  // Updated to support 4 players by default
          matchDuration: 300,  // 5 minutes
          playerTimeBank: 30  // 30 seconds per turn
        };
        
        initializeGame(gameMode);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start bot game');
        setLoading(false);
      }
    };

    startBotGame();
  }, [initializeGame]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white">Setting up your game against the bot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-white/90 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded px-4 py-2 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <GameBoard onBackToHome={() => navigate('/')} />;
};

export default VsBotPage;
