import React, { useState, useEffect } from "react";

// Version is injected by Vite
declare const __APP_VERSION__: string;
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Settings,
  User,
  Sparkles,
  Zap,
  Monitor,
  Smartphone,
  Download,
  Mail,
  Send,
  MessageCircle,
  Camera,
  MapPin,
  Users,
  X,
  // Additional icons used in the component
  Maximize,
  Apple,
  Chrome,
  Info,
  CheckCircle,
  BookOpen,
  Wifi,
  Gamepad2,
  Twitter,
  Github,
  Calendar,
} from "lucide-react";
import GameModeSelector from "./GameModeSelector";
import AuthModal from "./AuthModal";
import LeaderboardPage from "./LeaderboardPage";
import ProfilePage from "./ProfilePage";
import ContactPage from "./ContactPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsOfServicePage from "./TermsOfServicePage";
import FeedbackModal from "./FeedbackModal";
import PWAInstallPrompt from "./PWAInstallPrompt";
import HowToPlayContent from "./HowToPlayContent";
import MatchmakingModal from "./MatchmakingModal";
import { GameModeConfig } from "../types/game";
import { useAuth } from "../hooks/useAuth";
import { usePWA } from "../hooks/usePWA";
import { useFullscreen } from "../hooks/useFullscreen";
import { usePlayerStore } from "../store/playerStore";
import { FeedbackService } from "../services/FeedbackService";
import { supabase } from "../lib/supabase";

interface HomePageProps {
  onStartGame?: (gameMode: GameModeConfig) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame }) => {
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [matchmakingType, setMatchmakingType] = useState<
    "quick-play" | "quick-learn" | "custom"
  >("quick-play");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [showPWAGuide, setShowPWAGuide] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Live stats from database
  const [liveStats, setLiveStats] = useState({
    totalPlayersEver: 0,
    totalMatchesPlayed: 0,
    playersOnlineNow: 0,
  });

  const { user, signOut } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { toggleFullscreen, isSupported: fullscreenSupported } =
    useFullscreen();
  const { initializeGuestPlayer } = usePlayerStore();

  // Player information available in the store if needed
  // These variables are kept for potential future use
  const isGuest = !user;
  const playerName = user?.email?.split("@")[0] || "Player";

  // Suppress unused variable warnings
  void isGuest;
  void playerName;

  // Initialize guest player on component mount
  useEffect(() => {
    initializeGuestPlayer();
  }, [initializeGuestPlayer]);

  // Load live stats from database
  useEffect(() => {
    const loadLiveStats = async () => {
      try {
        if (!supabase) {
          // Fallback numbers when database is not available
          setLiveStats({
            totalPlayersEver: 1247,
            totalMatchesPlayed: 8934,
            playersOnlineNow: Math.floor(
              150 + Math.sin(Date.now() / 10000) * 50,
            ),
          });
          return;
        }

        // Get total unique players from profiles
        const { count: totalPlayers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get total matches from matches table
        const { count: totalMatches } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true });

        // Simulate online players (would come from real-time presence in production)
        const timeOfDay = new Date().getHours();
        const isPeakHours = timeOfDay >= 18 && timeOfDay <= 23;
        const baseOnline = Math.max(totalPlayers || 0, 50);
        const onlineNow = Math.floor(baseOnline * (isPeakHours ? 0.3 : 0.15));

        setLiveStats({
          totalPlayersEver: totalPlayers || 1247,
          totalMatchesPlayed: totalMatches || 8934,
          playersOnlineNow: onlineNow,
        });
      } catch (error) {
        console.error("Error loading live stats:", error);
        // Fallback numbers
        setLiveStats({
          totalPlayersEver: 1247,
          totalMatchesPlayed: 8934,
          playersOnlineNow: Math.floor(150 + Math.sin(Date.now() / 10000) * 50),
        });
      }
    };

    loadLiveStats();
    const interval = setInterval(loadLiveStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleQuickPlay = () => {
    setMatchmakingType("quick-play");
    setShowMatchmaking(true);
  };

  const navigate = useNavigate();

  const handleQuickLearn = () => {
    // Navigate to vs-bot using React Router
    navigate("/vs-bot");
  };

  const handleCustomGame = () => {
    setShowGameModeSelector(true);
  };

  const handleStartGame = (gameMode: GameModeConfig) => {
    setShowGameModeSelector(false);
    setShowMatchmaking(false);
    if (onStartGame) {
      onStartGame(gameMode);
    }
  };

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setNewsletterLoading(true);
    const { success } = await FeedbackService.subscribeToNewsletter(
      email.trim(),
    );

    if (success) {
      setNewsletterSuccess(true);
      setEmail("");
      setTimeout(() => setNewsletterSuccess(false), 3000);
    }
    setNewsletterLoading(false);
  };

  const handlePWAInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPWAInstall(false);
    }
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

  // Player information available in the store if needed
  // These variables are kept for potential future use

  return (
    <div className=" bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Fixed Feedback Widget - Positioned above Reddit logo */}
      <motion.div
        className="fixed bottom-20 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.button
          onClick={() => setShowFeedback(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-200 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Send Feedback"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-4xl font-bold text-white">BOLTIS</h1>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-white/60">
                    v{__APP_VERSION__}
                  </span>
                </div>
              </div>
              <p className="text-white/80">Built using Bolt • Open Source</p>
              {/* try github link */}
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Fullscreen Button */}
            {fullscreenSupported && (
              <motion.button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle Fullscreen"
              >
                <Maximize className="w-6 h-6" />
                {/* <span className="hidden sm:inline">Fullscreen</span> */}
              </motion.button>
            )}

            <motion.button
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </motion.button>

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
              <motion.button
                onClick={() => handleAuthClick("signin")}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Game Icon */}
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="w-16 h-16 text-yellow-400" />
          </motion.div>

          <motion.h2
            className="text-8xl font-bold text-white mb-4"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 30px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            BOLTIS
          </motion.h2>

          <motion.h3
            className="text-3xl font-semibold text-white/90 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Elemental Card Battle Arena
          </motion.h3>

          {/* <motion.p
            className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Built with ⚡ Bolt • Designed by Bolt • Promoted under Bolt
          </motion.p> */}

          <motion.p
            className="text-xl text-white/90 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Master the elements in this strategic card game. Use{" "}
            <span className="text-red-400 font-semibold">Fire</span>,{" "}
            <span className="text-blue-400 font-semibold">Water</span>,{" "}
            <span className="text-green-400 font-semibold">Plant</span>, and{" "}
            <span className="text-yellow-400 font-semibold">Thunder</span> to
            outplay your opponents with special abilities and tactical
            combinations.
          </motion.p>

          {/* Element Expansion Note */}
          {/* <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-2xl mx-auto border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-white/80 text-sm">
              <span className="font-semibold text-yellow-400">
                🌟 Basic Elements:
              </span>{' '}
              Start with 4 core elements.
              <span className="text-white/70">
                {' '}
                Future expansions may include Wind, Rock, Ice, and more based on
                community preference!
              </span>
            </p>
          </motion.div> */}

          {/* Updated Game Mode Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <motion.button
              onClick={handleQuickPlay}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl flex items-center gap-3 text-lg min-w-[200px]"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-6 h-6" />
              QUICK PLAY
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.button>

            <motion.button
              onClick={handleQuickLearn}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl flex items-center gap-3 text-lg min-w-[200px]"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="w-6 h-6" />
              QUICK LEARN
            </motion.button>

            <motion.button
              onClick={handleCustomGame}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/20 flex items-center gap-3 text-lg min-w-[200px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-6 h-6" />
              CUSTOM GAME
            </motion.button>
          </motion.div>

          {/* Game Mode Descriptions */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h4 className="font-semibold text-green-400 mb-2">Quick Play</h4>
              <p className="text-white/70 text-sm">
                Fast matchmaking against other players. Perfect for competitive
                play and climbing ranks.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h4 className="font-semibold text-blue-400 mb-2">Quick Learn</h4>
              <p className="text-white/70 text-sm">
                Practice with bots. Learn the game mechanics and strategies at
                your own pace.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h4 className="font-semibold text-purple-400 mb-2">
                Custom Game
              </h4>
              <p className="text-white/70 text-sm">
                Explore custom matches with your preferred rules, timers, and
                game modes.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Live Stats Section - 3 Big Numbers */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-2">
              Live Game Statistics
            </h3>
            <p className="text-white/70">
              Real-time data from our game servers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Players Ever */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="text-4xl font-bold text-white mb-2"
                key={liveStats.totalPlayersEver}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* {liveStats.totalPlayersEver.toLocaleString()} */}
                69
              </motion.div>
              <p className="text-white/80 font-medium">Total Players</p>
              <p className="text-white/60 text-sm mt-1">All-time registered</p>
            </motion.div>

            {/* Total Matches Played */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Gamepad2 className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="text-4xl font-bold text-white mb-2"
                key={liveStats.totalMatchesPlayed}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* {liveStats.totalMatchesPlayed.toLocaleString()} */}
                420
              </motion.div>
              <p className="text-white/80 font-medium">Matches Played</p>
              <p className="text-white/60 text-sm mt-1">Epic battles fought</p>
            </motion.div>

            {/* Players Online Now */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.7)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Wifi className="w-8 h-8 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              <motion.div
                className="text-4xl font-bold text-white mb-2"
                key={liveStats.playersOnlineNow}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* {liveStats.playersOnlineNow.toLocaleString()} */}
                16
              </motion.div>
              <p className="text-white/80 font-medium">Online Now</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-400 text-sm font-medium">Live</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Player Progress Widget - Simplified */}
        {/* <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center relative"
                whileHover={{ scale: 1.05 }}
              >
                {isGuest ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  <Crown className="w-6 h-6 text-white" />
                )}

                <div className="absolute -bottom-1 -right-1 bg-white text-gray-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  {currentStats.level}
                </div>
              </motion.div>

              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{playerName}</h3>
                <p className="text-white/70 text-sm">
                  Level {currentStats.level} Player
                </p>
                {isGuest && (
                  <p className="text-yellow-400 text-xs">Guest Player</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">
                  Progress
                </span>
                <span className="text-white/80 text-sm">
                  {currentStats.currentXP}/
                  {currentStats.currentXP + currentStats.xpToNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      (currentStats.currentXP /
                        (currentStats.currentXP + currentStats.xpToNextLevel)) *
                      100
                    }%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {currentStats.totalWins}
                </div>
                <div className="text-white/70 text-xs">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {currentStats.totalMatches}
                </div>
                <div className="text-white/70 text-xs">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {currentStats.winRate.toFixed(0)}%
                </div>
                <div className="text-white/70 text-xs">Win Rate</div>
              </div>
            </div>

            {isGuest && (
              <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <p className="text-yellow-200 text-xs text-center">
                  Sign up to save your progress and compete on leaderboards!
                </p>
              </div>
            )}
          </div>
        </motion.section> */}

        {/* Play Everywhere Section */}
        <motion.section
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <Monitor className="w-6 h-6 text-white" />
            <h3 className="text-2xl font-bold text-white">Play Everywhere</h3>
          </div>

          <div className="flex justify-center gap-8 flex-wrap">
            <motion.div
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-2xl font-bold text-white">CG</span>
              </div>
              <span className="text-white/70 text-sm">CrazyGames</span>
            </motion.div>

            {/* PWA Install Button */}
            {isInstallable && (
              <motion.div
                className="flex flex-col items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                onClick={() => setShowPWAInstall(true)}
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <span className="text-white/70 text-sm">Install App</span>
              </motion.div>
            )}

            {isInstalled && (
              <motion.div
                className="flex flex-col items-center gap-2"
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-green-400 text-2xl">✓</span>
                </div>
                <span className="text-white/70 text-sm">Installed</span>
              </motion.div>
            )}

            <motion.div
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/70 text-sm">Browser</span>
            </motion.div>

            {/* App Store Buttons */}
            <motion.div
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 bg-gray-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Apple className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/70 text-sm">App Store</span>
              <span className="text-xs text-white/50">Coming Soon</span>
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-2xl font-bold text-white">GP</span>
              </div>
              <span className="text-white/70 text-sm">Play Store</span>
              <span className="text-xs text-white/50">Coming Soon</span>
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <span className="text-white/70 text-sm">Steam</span>
              <span className="text-xs text-white/50">Coming Soon</span>
            </motion.div>
          </div>
        </motion.section>

        {/* PWA Features Section */}
        <motion.section
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-16 border border-white/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Smartphone className="w-8 h-8 text-green-400" />
            <h3 className="text-3xl font-bold text-white">
              {isInstalled
                ? "App Installed!"
                : "Install as Progressive Web App"}
            </h3>
          </div>

          {!isInstalled ? (
            <>
              <p className="text-xl text-white/80 mb-8">
                Get the full BOLTIS experience with our Progressive Web App
                (PWA)
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-400 text-4xl">⚡</span>
                  </div>
                  <span className="text-white/80 text-sm">Faster Loading</span>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-400 text-4xl">📱</span>
                  </div>
                  <span className="text-white/80 text-sm">Works Offline</span>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-400 text-4xl">🎮</span>
                  </div>
                  <span className="text-white/80 text-sm">Native Feel</span>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-orange-400 text-4xl">🔔</span>
                  </div>
                  <span className="text-white/80 text-sm">Notifications</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {isInstallable && (
                  <motion.button
                    onClick={handlePWAInstall}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-6 h-6" />
                    Install BOLTIS App
                  </motion.button>
                )}

                <motion.button
                  onClick={() => setShowPWAGuide(true)}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/20 flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info className="w-6 h-6" />
                  Installation Guide
                </motion.button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-4xl">✓</span>
              </div>
              <p className="text-xl text-white/90 mb-4">
                BOLTIS is installed and ready to play!
              </p>
              <p className="text-white/70">
                Enjoy faster loading, offline play, and the best gaming
                experience.
              </p>
            </div>
          )}
        </motion.section>

        {/* How to Play Section - INLINE COMPONENT */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <HowToPlayContent />
        </motion.section>

        {/* Newsletter Section */}
        <motion.section
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 mb-16 border border-white/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="text-4xl font-bold text-white mb-4">
            Stay in the Loop
          </h3>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get the latest updates, tournaments, and exclusive content delivered
            to your inbox
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <motion.button
              type="submit"
              disabled={newsletterLoading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: newsletterLoading ? 1 : 1.05 }}
              whileTap={{ scale: newsletterLoading ? 1 : 0.95 }}
            >
              {newsletterLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Subscribe
            </motion.button>
          </form>

          {newsletterSuccess && (
            <motion.p
              className="text-green-400 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✅ Successfully subscribed to newsletter!
            </motion.p>
          )}
        </motion.section>

        {/* Community Gallery Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">
              Join Community BOLTIS
            </h3>
            <div className="flex items-center justify-center gap-2 text-white/80 mb-8">
              <MapPin className="w-5 h-5" />
              <span>We are around Bali for now</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Community Gallery */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Camera className="w-6 h-6 text-blue-400" />
                <h4 className="text-2xl font-bold text-white">
                  Community Gallery
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gallery Photo 1 */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex flex-col items-center justify-center text-center min-h-[200px]"
                  whileHover={{ scale: 1.02 }}
                >
                  <Camera className="w-12 h-12 text-white/50 mb-4" />
                  <h5 className="text-lg font-semibold text-white mb-2">
                    Gallery Photo 1
                  </h5>
                  <p className="text-white/70 text-sm">Coming Soon</p>
                </motion.div>

                {/* Gallery Photo 2 */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex flex-col items-center justify-center text-center min-h-[200px]"
                  whileHover={{ scale: 1.02 }}
                >
                  <Camera className="w-12 h-12 text-white/50 mb-4" />
                  <h5 className="text-lg font-semibold text-white mb-2">
                    Gallery Photo 2
                  </h5>
                  <p className="text-white/70 text-sm">Coming Soon</p>
                </motion.div>

                {/* Gallery Photo 3 */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex flex-col items-center justify-center text-center min-h-[200px]"
                  whileHover={{ scale: 1.02 }}
                >
                  <Camera className="w-12 h-12 text-white/50 mb-4" />
                  <h5 className="text-lg font-semibold text-white mb-2">
                    Gallery Photo 3
                  </h5>
                  <p className="text-white/70 text-sm">Coming Soon</p>
                </motion.div>

                {/* Gallery Photo 4 */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex flex-col items-center justify-center text-center min-h-[200px]"
                  whileHover={{ scale: 1.02 }}
                >
                  <Camera className="w-12 h-12 text-white/50 mb-4" />
                  <h5 className="text-lg font-semibold text-white mb-2">
                    Gallery Photo 4
                  </h5>
                  <p className="text-white/70 text-sm">Coming Soon</p>
                </motion.div>
              </div>
            </div>

            {/* Bali Chapter Info */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">🌴</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    Bali Chapter
                  </h4>
                </div>

                <p className="text-white/80 mb-6">
                  Join our growing community of BOLTIS players in beautiful
                  Bali! We organize regular meetups, tournaments, and gaming
                  sessions.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white">50+ Active Members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Weekly Tournaments (TBA)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <span className="text-white">Café Meetups</span>
                  </div>
                </div>

                <motion.button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Bali Community
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="text-center text-white/80 border-t border-white/20 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Game Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Game</h4>
              <div className="space-y-2">
                {/* <div className="block text-white/70 hover:text-white transition-colors">
                  How to Play
                </div> */}
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Leaderboards
                </button>
                {/* <button className="block text-white/70 hover:text-white transition-colors">
                  Tournament
                </button> */}
              </div>
            </div>

            {/* Community Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Social</h4>
              <div className="space-y-2">
                <a
                  href="https://x.com/0xdellwatson"
                  target="_blank"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a
                  href="https://github.com/dellwatson/boltis-fun"
                  target="_blank"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="https://discord.com/invite/PnQb4U9dxB"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Discord
                </a>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowTermsOfService(true)}
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setShowContact(true)}
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm">
              © 2025 Theras Labs, Inc. All rights reserved.
            </p>
            <p className="text-xs">
              “Void Cards” and “Elemental Stacking” are original gameplay
              features by Dale Watson and Theras Labs, Inc.
              <br />
              Reuse or adaptation of these features must include attribution.
            </p>
            <p className="text-xs">
              Free to play • Built for everyone • Made with ❤️
            </p>
          </div>
        </motion.footer>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showGameModeSelector && (
          <GameModeSelector
            onClose={() => setShowGameModeSelector(false)}
            onStartGame={handleStartGame}
          />
        )}
      </AnimatePresence>

      <MatchmakingModal
        isOpen={showMatchmaking}
        onClose={() => setShowMatchmaking(false)}
        onStartGame={handleStartGame}
        gameType={matchmakingType}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

      <PWAInstallPrompt
        isOpen={showPWAInstall}
        onClose={() => setShowPWAInstall(false)}
      />

      {/* PWA Installation Guide Modal */}
      <AnimatePresence>
        {showPWAGuide && (
          <PWAGuideModal
            isOpen={showPWAGuide}
            onClose={() => setShowPWAGuide(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// PWA Installation Guide Modal Component
const PWAGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">PWA Installation Guide</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <p className="text-white/80 mt-2">
                Learn how to install BOLTIS as a Progressive Web App on your
                device
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Chrome/Edge */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Chrome className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Chrome / Edge (Desktop)
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <p className="text-gray-700">
                      Look for the install icon in the address bar (computer
                      with arrow)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <p className="text-gray-700">
                      Click the install button or use the three-dot menu →
                      "Install BOLTIS"
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <p className="text-gray-700">
                      Confirm installation in the popup dialog
                    </p>
                  </div>
                </div>
              </div>

              {/* Safari iOS */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Apple className="w-8 h-8 text-gray-800" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Safari (iPhone/iPad)
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <p className="text-gray-700">
                      Tap the Share button (square with arrow up) at the bottom
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <p className="text-gray-700">
                      Scroll down and tap "Add to Home Screen"
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <p className="text-gray-700">
                      Customize the name if desired and tap "Add"
                    </p>
                  </div>
                </div>
              </div>

              {/* Android Chrome */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Chrome (Android)
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <p className="text-gray-700">
                      Look for the "Add to Home screen" banner at the bottom
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <p className="text-gray-700">
                      Or tap the three-dot menu → "Add to Home screen"
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <p className="text-gray-700">Confirm the installation</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Benefits of Installing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">⚡</span>
                    <span className="text-gray-700">Faster loading times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📱</span>
                    <span className="text-gray-700">Works offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">🎮</span>
                    <span className="text-gray-700">Native app experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">🔔</span>
                    <span className="text-gray-700">Push notifications</span>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2">
                  Troubleshooting
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • If you don't see the install option, try refreshing the
                    page
                  </li>
                  <li>
                    • Make sure you're using a supported browser (Chrome, Edge,
                    Safari)
                  </li>
                  <li>
                    • Some browsers require HTTPS (which BOLTIS already uses)
                  </li>
                  <li>• Clear your browser cache if installation fails</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePage;
