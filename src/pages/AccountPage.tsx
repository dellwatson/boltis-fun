import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { Button } from '../components/ui/button';

export default function AccountPage() {
  const navigate = useNavigate();
  const { guestPlayer, resetGuestPlayer, initializeGuestPlayer } = usePlayerStore();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAccount = () => {
    setIsResetting(true);
    resetGuestPlayer();
    // Give it a moment to reset before reinitializing
    setTimeout(() => {
      initializeGuestPlayer();
      setIsResetting(false);
    }, 500);
  };

  if (!guestPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Games Played', value: guestPlayer.gamesPlayed },
    { label: 'Wins', value: guestPlayer.wins },
    { label: 'Losses', value: guestPlayer.losses },
    { label: 'Win Rate', value: `${guestPlayer.winRate}%` },
    { label: 'Level', value: guestPlayer.level },
    { label: 'XP', value: guestPlayer.xp },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{guestPlayer.name}</h1>
                <p className="text-purple-100">Guest Player</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-200">Player ID</p>
                <p className="text-sm font-mono">{guestPlayer.id}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Account Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div>
                <p className="text-sm text-gray-500">
                  Account created on {new Date(guestPlayer.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Last played: {guestPlayer.lastPlayed ? new Date(guestPlayer.lastPlayed).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className="space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-gray-300"
                >
                  Back to Home
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleResetAccount}
                  disabled={isResetting}
                >
                  {isResetting ? 'Resetting...' : 'Reset Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">About Your Account</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              This is a guest account. Your progress is saved locally in your browser.
              If you clear your browser data, your progress will be lost.
            </p>
            <p>
              To save your progress across devices, consider signing up for a full account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
