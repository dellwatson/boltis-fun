import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Trophy, 
  Settings, 
  HelpCircle, 
  User, 
  LogIn, 
  Mail,
  Sparkles,
  Zap,
  Flame,
  Droplets,
  Leaf,
  Crown,
  Target,
  Clock,
  Users,
  Star,
  ChevronRight,
  MessageSquare,
  Shield,
  FileText,
  Phone
} from 'lucide-react';
import GameModeSelector from './GameModeSelector';
import AuthModal from './AuthModal';
import LeaderboardPage from './LeaderboardPage';
import ProfilePage from './ProfilePage';
import ContactPage from './ContactPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsOfServicePage from './TermsOfServicePage';
import NewsletterModal from './NewsletterModal';
import FeedbackModal from './FeedbackModal';
import { GameModeConfig } from '../types/game';
import { useAuth } from '../hooks/useAuth';

interface HomePageProps {
  onStartGame: (gameMode: GameModeConfig) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame }) => {
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const { user, signOut } = useAuth();

  const handleStartGame = (gameMode: GameModeConfig) => {
    setShowGameModeSelector(false);
    onStartGame(gameMode);
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show different pages
  if (showLeaderboard) {
    return <LeaderboardPage onBack={() => setShowLeaderboard(false)} />;
  }

  if (showProfile) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

  if (showContact) {
    return <ContactPage onBack={() => setShowContact(false)} />;
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicyPage onBack={() => setShowPrivacyPolicy(false)} />;
  }

  if (showTermsOfService) {
    return <TermsOfServicePage onBack={() => setShowTermsOfService(false)} />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div 
        className="relative z-10 max-w-6xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header 
          className="flex items-center justify-between mb-12"
          variants={itemVariants}
        >
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">BOLTIS</h1>
              <p className="text-white/80">Elemental Card Game</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </motion.button>
                <motion.button
                  onClick={handleSignOut}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handleAuthClick('signin')}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
                <motion.button
                  onClick={() => handleAuthClick('signup')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-6xl md:text-7xl font-bold text-white mb-6"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 30px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Master the Elements
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Experience strategic card gameplay with unique elemental mechanics, 
            void cards, and intelligent bot opponents in this modern twist on classic card games.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => setShowGameModeSelector(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl flex items-center gap-3 text-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6" />
              Play Now
            </motion.button>
            
            <motion.button
              onClick={() => setShowHowToPlay(true)}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/20 flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HelpCircle className="w-6 h-6" />
              How to Play
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Features Grid */}
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={itemVariants}
        >
          {[
            {
              icon: Zap,
              title: "Elemental Strategy",
              description: "Master Fire, Water, Plant, and Thunder elements with unique advantages",
              color: "from-yellow-500 to-orange-500"
            },
            {
              icon: Crown,
              title: "Special Cards",
              description: "Void cards, Stack effects, and game-changing special abilities",
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: Target,
              title: "Smart AI",
              description: "Challenge yourself against three difficulty levels of intelligent bots",
              color: "from-green-500 to-blue-500"
            },
            {
              icon: Trophy,
              title: "Compete & Rank",
              description: "Climb leaderboards and track your wins across different game modes",
              color: "from-blue-500 to-purple-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)"
              }}
            >
              <motion.div
                className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                animate={{
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Game Elements Preview */}
        <motion.section 
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-16 border border-white/20"
          variants={itemVariants}
        >
          <h3 className="text-3xl font-bold text-white text-center mb-8">Master the Elements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { element: "Fire", icon: Flame, color: "from-red-500 to-orange-500", beats: "Plant" },
              { element: "Water", icon: Droplets, color: "from-blue-500 to-cyan-500", beats: "Fire" },
              { element: "Plant", icon: Leaf, color: "from-green-500 to-emerald-500", beats: "Water" },
              { element: "Thunder", icon: Zap, color: "from-yellow-500 to-amber-500", beats: "Plant" }
            ].map((element, index) => (
              <motion.div
                key={element.element}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${element.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl`}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  <element.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-1">{element.element}</h4>
                <p className="text-white/70 text-sm">Beats {element.beats}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => setShowLeaderboard(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trophy className="w-8 h-8" />
            <div className="text-left">
              <h3 className="text-xl font-bold">Leaderboards</h3>
              <p className="text-white/90">See top players</p>
            </div>
            <ChevronRight className="w-6 h-6 ml-auto group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={() => setShowNewsletter(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-8 h-8" />
            <div className="text-left">
              <h3 className="text-xl font-bold">Newsletter</h3>
              <p className="text-white/90">Stay updated</p>
            </div>
            <ChevronRight className="w-6 h-6 ml-auto group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={() => setShowFeedback(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="w-8 h-8" />
            <div className="text-left">
              <h3 className="text-xl font-bold">Feedback</h3>
              <p className="text-white/90">Share ideas</p>
            </div>
            <ChevronRight className="w-6 h-6 ml-auto group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center text-white/80 border-t border-white/20 pt-8"
          variants={itemVariants}
        >
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <motion.button
              onClick={() => setShowContact(true)}
              className="flex items-center gap-2 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Phone className="w-4 h-4" />
              Contact
            </motion.button>
            <motion.button
              onClick={() => setShowPrivacyPolicy(true)}
              className="flex items-center gap-2 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </motion.button>
            <motion.button
              onClick={() => setShowTermsOfService(true)}
              className="flex items-center gap-2 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </motion.button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">© 2025 Theras Labs, Inc. All rights reserved.</p>
            <p className="text-xs">
              Game mechanics including Void Card effects and Elemental Stacking are proprietary 
              intellectual property of Dale Watson and Theras Labs, Inc.
            </p>
            <p className="text-xs">Free to play • Built for everyone • Made with ❤️</p>
          </div>
        </motion.footer>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showGameModeSelector && (
          <GameModeSelector
            onClose={() => setShowGameModeSelector(false)}
            onStartGame={handleStartGame}
          />
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <NewsletterModal
        isOpen={showNewsletter}
        onClose={() => setShowNewsletter(false)}
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// How to Play Modal Component
const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Game Objective",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Be the first player to empty your hand, or have the lowest score when time runs out!
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Scoring System:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Number cards (1-9): Face value points</li>
              <li>• Special cards: 20 points each</li>
              <li>• Void cards: 50 points each</li>
              <li>• <strong>Lowest total score wins!</strong></li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Basic Rules",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Match the top card by element, type, or number to play a card from your hand.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Valid Plays:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Same element (Fire on Fire)</li>
                <li>• Same type (Skip on Skip)</li>
                <li>• Same number (5 on 5)</li>
                <li>• Void cards (always playable)</li>
              </ul>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">❌ Invalid Plays:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Different element & type</li>
                <li>• Different numbers</li>
                <li>• When you have valid cards</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Elements & Advantages",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Each element has advantages over others, affecting special card interactions.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { element: "🔥 Fire", beats: "🌱 Plant", color: "border-red-200 bg-red-50" },
              { element: "💧 Water", beats: "🔥 Fire", color: "border-blue-200 bg-blue-50" },
              { element: "🌱 Plant", beats: "💧 Water", color: "border-green-200 bg-green-50" },
              { element: "⚡ Thunder", beats: "🌱 Plant", color: "border-yellow-200 bg-yellow-50" }
            ].map((item, index) => (
              <div key={index} className={`p-3 rounded-lg border ${item.color}`}>
                <div className="font-semibold">{item.element}</div>
                <div className="text-sm">Beats {item.beats}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Special Cards",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800">🚫 Skip Card</h4>
              <p className="text-sm text-purple-700">Next player loses their turn</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800">🔄 Reverse Card</h4>
              <p className="text-sm text-orange-700">Changes the direction of play</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800">📚 Stack Card</h4>
              <p className="text-sm text-green-700">Removes matching elemental cards from discard pile and your hand</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800">🌀 Void Card</h4>
              <p className="text-sm text-gray-700">Transfers entire discard pile to next player, choose new color</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Winning Strategy",
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Save special cards for strategic moments</li>
              <li>• Use void cards when you have many cards</li>
              <li>• Pay attention to elemental advantages</li>
              <li>• Watch other players' card counts</li>
              <li>• Time your stack cards for maximum effect</li>
              <li>• Remember: lowest score wins!</li>
            </ul>
          </div>
          <p className="text-gray-700 text-center font-semibold">
            Ready to master the elements? Start your first game!
          </p>
        </div>
      )
    }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">How to Play BOLTIS</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h3>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </span>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Start Playing!
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="px-4 py-2 text-purple-600 hover:text-purple-700"
            >
              Next
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;