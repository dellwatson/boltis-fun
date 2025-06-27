import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { usePlayerStore } from '../store/playerStore';

interface GameRoom {
  id: string;
  players: string[];
  maxPlayers: number;
  isPrivate: boolean;
  status: 'waiting' | 'in-progress' | 'finished';
  createdAt: number;
}

export const useGameServer = () => {
  const { guestPlayer, initializeGuestPlayer } = usePlayerStore();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize guest player if not exists
  useEffect(() => {
    if (!guestPlayer) {
      initializeGuestPlayer();
    }
  }, [guestPlayer, initializeGuestPlayer]);

  const createRoom = useCallback(async (isPrivate: boolean = false) => {
    if (!guestPlayer) {
      setError('Player not initialized');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your backend
      const newRoom: GameRoom = {
        id: `room-${uuidv4()}`,
        players: [guestPlayer.id],
        maxPlayers: 2, // Default to 1v1
        isPrivate,
        status: 'waiting',
        createdAt: Date.now(),
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoom(newRoom);
      return newRoom.id;
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [guestPlayer]);

  const joinRoom = useCallback(async (roomId: string) => {
    if (!guestPlayer) {
      setError('Player not initialized');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would validate the room exists and has space
      // For now, we'll just simulate a successful join
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you'd get the room details from the server
      const joinedRoom: GameRoom = {
        id: roomId,
        players: [guestPlayer.id, 'bot-player-id'], // Simulate another player
        maxPlayers: 2,
        isPrivate: false,
        status: 'in-progress',
        createdAt: Date.now() - 1000, // Room created 1 second ago
      };
      
      setRoom(joinedRoom);
      return true;
    } catch (err) {
      setError('Failed to join room');
      console.error('Error joining room:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [guestPlayer]);

  const leaveRoom = useCallback(async () => {
    if (!room) return;
    
    setLoading(true);
    try {
      // In a real app, notify server that player is leaving
      await new Promise(resolve => setTimeout(resolve, 300));
      setRoom(null);
    } catch (err) {
      console.error('Error leaving room:', err);
    } finally {
      setLoading(false);
    }
  }, [room]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
  };
};
