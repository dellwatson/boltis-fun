import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, AlertCircle, Bell, Gamepad2, Trophy } from 'lucide-react';
import { FeedbackService } from '../services/FeedbackService';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    newsletter: true,
    game_updates: true,
    tournament_notifications: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { success: subscribeSuccess, error: subscribeError } = await FeedbackService.subscribeToNewsletter(
      email.trim(),
      preferences
    );

    if (subscribeSuccess) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setEmail('');
        setSuccess(false);
      }, 3000);
    } else {
      setError(subscribeError?.message || 'Failed to subscribe');
    }

    setLoading(false);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Stay Updated</h2>
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
                Get the latest BOLTIS news, updates, and tournament announcements
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Aboard!</h3>
                  <p className="text-gray-600">You've successfully subscribed to our newsletter.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Subscription Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What would you like to receive?
                    </label>
                    <div className="space-y-3">
                      <motion.label 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          checked={preferences.newsletter}
                          onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <Bell className="w-5 h-5 text-purple-600" />
                        <div>
                          <span className="font-medium text-gray-800">Newsletter</span>
                          <p className="text-sm text-gray-600">Weekly updates and game tips</p>
                        </div>
                      </motion.label>

                      <motion.label 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          checked={preferences.game_updates}
                          onChange={(e) => setPreferences(prev => ({ ...prev, game_updates: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <Gamepad2 className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="font-medium text-gray-800">Game Updates</span>
                          <p className="text-sm text-gray-600">New features and patch notes</p>
                        </div>
                      </motion.label>

                      <motion.label 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          checked={preferences.tournament_notifications}
                          onChange={(e) => setPreferences(prev => ({ ...prev, tournament_notifications: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <div>
                          <span className="font-medium text-gray-800">Tournament Alerts</span>
                          <p className="text-sm text-gray-600">Competitive events and prizes</p>
                        </div>
                      </motion.label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </div>
                    ) : (
                      <span>Subscribe to Newsletter</span>
                    )}
                  </motion.button>

                  {/* Privacy Note */}
                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal;