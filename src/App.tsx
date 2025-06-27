import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useAuth } from './hooks/useAuth';
import GameBoard from './components/GameBoard';
import HomePage from './components/HomePage';
import { Sparkles } from 'lucide-react';
import { GameModeConfig } from './types/game';

function App() {
  const { initializeGame, gamePhase, isProcessing } = useGameStore();
  const { user } = useAuth();
  const [showHomePage, setShowHomePage] = useState(true);

  const handleStartGame = (gameMode: GameModeConfig) => {
    setShowHomePage(false);
    // Pass user ID if authenticated, otherwise undefined for offline play
    initializeGame(gameMode, user?.id);
  };

  const handleBackToHome = () => {
    setShowHomePage(true);
  };

  // Tech Badges Component - Final Layout
  const TechBadges = () => (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
      {/* Netlify - Left of Bolt */}
      <a
        href="https://netlify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-110 transition-transform duration-200 mb-3"
      >
        <img
          src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/refs/heads/main/src/public/netlify/wordmark-color.svg"
          alt="Deployed on Netlify"
          className="h-6 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
        />
      </a>

      {/* Right Column - Reddit, Supabase, Bolt (vertical stack) */}
      <div className="flex flex-col items-center gap-2">
        {/* Reddit - Top */}
        <a
          href="https://reddit.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-200"
        >
          <img
            src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/refs/heads/main/src/public/reddit/logo-color.svg"
            alt="Join us on Reddit"
            className="h-8 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
          />
        </a>

        {/* Supabase - Middle */}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-200"
        >
          <img
            src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/refs/heads/main/src/public/supabase/logo-color.svg"
            alt="Powered by Supabase"
            className="h-8 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
          />
        </a>

        {/* Bolt - Bottom (corner) */}
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-200"
        >
          <img
            src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/refs/heads/main/src/public/bolt-badge/white_circle_360x360/white_circle_360x360.webp"
            alt="Built with Bolt"
            className="w-12 h-12 rounded-full drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
          />
        </a>
      </div>
    </div>
  );

  if (showHomePage) {
    return (
      <>
        <HomePage onStartGame={handleStartGame} />
        <TechBadges />
      </>
    );
  }

  if (gamePhase === 'setup') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <div className="text-white text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold">Loading Elemental Cards...</h1>
          </div>
        </div>
        <TechBadges />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <GameBoard onBackToHome={handleBackToHome} />

        {/* {isProcessing && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 animate-spin text-purple-600" />
                <span className="font-semibold text-gray-700">Processing...</span>
              </div>
            </div>
          </div>
        )} */}
      </div>

      <TechBadges />
    </>
  );
}

export default App;
