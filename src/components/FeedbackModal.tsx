import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Bug, Lightbulb, Heart, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { FeedbackService } from '../services/FeedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState?: any;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, gameState }) => {
  const [feedbackType, setFeedbackType] = useState<'bug_report' | 'feature_request' | 'general' | 'complaint' | 'praise'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedbackTypes = [
    { id: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-red-500', description: 'Report a problem or error' },
    { id: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500', description: 'Suggest a new feature' },
    { id: 'praise', label: 'Praise', icon: Heart, color: 'text-pink-500', description: 'Share what you love' },
    { id: 'complaint', label: 'Complaint', icon: AlertTriangle, color: 'text-orange-500', description: 'Report an issue or concern' },
    { id: 'general', label: 'General', icon: MessageSquare, color: 'text-blue-500', description: 'General feedback or questions' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    setError(null);

    const { success: submitSuccess, error: submitError } = await FeedbackService.submitFeedback({
      type: feedbackType,
      subject: subject.trim(),
      message: message.trim(),
      gameState: feedbackType === 'bug_report' ? gameState : undefined
    });

    if (submitSuccess) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setSubject('');
        setMessage('');
        setFeedbackType('general');
        setSuccess(false);
      }, 2000);
    } else {
      setError(submitError?.message || 'Failed to submit feedback');
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Send Feedback</h2>
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
                Help us improve BOLTIS with your feedback and suggestions
              </p>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {success ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What type of feedback is this?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {feedbackTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id as any)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            feedbackType === type.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <type.icon className={`w-6 h-6 ${type.color}`} />
                          <div>
                            <div className="font-medium text-gray-800">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Brief description of your feedback"
                      maxLength={100}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {subject.length}/100 characters
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Please provide detailed feedback..."
                      minLength={10}
                      maxLength={2000}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {message.length}/2000 characters (minimum 10)
                    </div>
                  </div>

                  {/* Game State Info */}
                  {feedbackType === 'bug_report' && gameState && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Game State Information</h4>
                      <p className="text-sm text-blue-700">
                        Technical information about your current game will be included to help us debug the issue.
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || !subject.trim() || !message.trim() || message.length < 10}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;