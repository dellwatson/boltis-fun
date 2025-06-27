import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useGameServer } from '../hooks/useGameServer';
import { Button } from '../components/ui/button';

interface MatchParams {
  id: string;
  [key: string]: string | undefined;
}

export default function MatchPage() {
  const { id: roomId } = useParams<MatchParams>();
  const navigate = useNavigate();
  const { initializeGame } = useGameStore();
  const { joinRoom, loading, error, room } = useGameServer();
  const [joinAttempted, setJoinAttempted] = useState(false);

  useEffect(() => {
    const joinMatch = async () => {
      if (!roomId || joinAttempted) return;
      
      setJoinAttempted(true);
      const success = await joinRoom(roomId);
      
      if (success) {
        // In a real app, you would get the game mode from the server
        const gameMode = {
          mode: 'online',
          timeLimit: 300, // 5 minutes
        };
        
        initializeGame(gameMode);
      }
    };

    joinMatch();
  }, [roomId, joinRoom, initializeGame, joinAttempted]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-700">Joining match...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Match Error</h2>
          <p className="text-gray-700 mb-6">
            {error === 'Room not found' 
              ? 'The match you\'re looking for doesn\'t exist or has ended.'
              : 'Failed to join the match. Please try again.'}
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="border-gray-300 hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (room) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Match {room.id}</h1>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold">Status: {room.status}</h2>
                <p>Players: {room.players.length}/{room.maxPlayers}</p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                Leave Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
