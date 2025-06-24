import { PlayerTimer } from '../types/game';

export class TimerService {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, (playerId: string) => void> = new Map();
  private pausedTimers: Map<string, { timeRemaining: number; callback: (playerId: string) => void; onTick?: (playerId: string, timeRemaining: number) => void }> = new Map();

  startPlayerTimer(
    playerId: string, 
    duration: number, 
    onTimeout: (playerId: string) => void,
    onTick?: (playerId: string, timeRemaining: number) => void
  ): void {
    this.stopPlayerTimer(playerId);
    
    let timeRemaining = duration;
    this.callbacks.set(playerId, onTimeout);
    
    const interval = setInterval(() => {
      timeRemaining--;
      
      if (onTick) {
        onTick(playerId, timeRemaining);
      }
      
      if (timeRemaining <= 0) {
        this.stopPlayerTimer(playerId);
        onTimeout(playerId);
      }
    }, 1000);
    
    this.timers.set(playerId, interval);
    console.log(`⏰ Timer started for ${playerId}: ${duration}s`);
  }

  stopPlayerTimer(playerId: string): void {
    const timer = this.timers.get(playerId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(playerId);
      this.callbacks.delete(playerId);
      console.log(`⏰ Timer stopped for ${playerId}`);
    }
  }

  pauseAllTimers(): void {
    this.timers.forEach((timer, playerId) => {
      clearInterval(timer);
      console.log(`⏰ Timer paused for ${playerId}`);
    });
    this.timers.clear();
  }

  stopAllTimers(): void {
    this.timers.forEach((timer, playerId) => {
      clearInterval(timer);
      console.log(`⏰ Timer stopped for ${playerId}`);
    });
    this.timers.clear();
    this.callbacks.clear();
    this.pausedTimers.clear();
  }

  isTimerActive(playerId: string): boolean {
    return this.timers.has(playerId);
  }
}

export const timerService = new TimerService();