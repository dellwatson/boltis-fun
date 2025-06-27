import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Twitter,
  Github,
  MessageCircle,
} from 'lucide-react';
import { FeedbackService } from '../services/FeedbackService';

interface ContactPageProps {
  onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.message.trim()) return;

    setLoading(true);
    const { success: submitSuccess } = await FeedbackService.submitFeedback({
      type: 'general',
      subject: formData.subject || 'Contact Form Submission',
      message: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage: ${formData.message}`,
    });

    if (submitSuccess) {
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <motion.div
        className="max-w-6xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          variants={itemVariants}
        >
          <motion.button
            onClick={onBack}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Mail className="w-10 h-10 text-blue-400" />
              Contact Us
            </h1>
            <p className="text-white/80">Get in touch with the BOLTIS team</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-green-400" />
              Send us a Message
            </h2>

            {success && (
              <motion.div
                className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center gap-3 text-green-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Thank you! Your message has been sent successfully.</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm resize-none"
                  placeholder="Tell us how we can help you..."
                  minLength={10}
                  maxLength={2000}
                />
                <div className="text-white/60 text-sm mt-1">
                  {formData.message.length}/2000 characters
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={
                  loading || !formData.email.trim() || !formData.message.trim()
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-white/80">contact@theras.xyz</p>
                    <p className="text-white/60 text-sm">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Location</h3>
                    <p className="text-white/80">Bali, Indonesia</p>
                    <p className="text-white/60 text-sm">
                      Building the future of card games
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      2nd Location
                    </h3>
                    <p className="text-white/80">
                      1111B S Governors Ave STE 37017 Dover, DE 19904
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Community</h3>
                    <p className="text-white/80">Join our Discord server</p>
                    <p className="text-white/60 text-sm">
                      Chat with players and developers
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Follow Us</h2>

              <div className="grid grid-cols-1 gap-4">
                <motion.a
                  href="https://twitter.com/theras_labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Twitter className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Twitter</div>
                    <div className="text-white/60 text-sm">@theras_labs</div>
                  </div>
                </motion.a>

                <motion.a
                  href="https://github.com/theras-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Github className="w-8 h-8 text-gray-300" />
                  <div>
                    <div className="font-semibold text-white">GitHub</div>
                    <div className="text-white/60 text-sm">
                      Open source project
                    </div>
                  </div>
                </motion.a>

                <motion.a
                  href="https://discord.com/invite/PnQb4U9dxB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Discord</div>
                    <div className="text-white/60 text-sm">
                      Join our community
                    </div>
                  </div>
                </motion.a>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Quick Help</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    🎮 How do I play BOLTIS?
                  </h3>
                  <p className="text-white/80 text-sm">
                    Check out our How to Play section on the homepage for
                    complete rules and strategies.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    🐛 Found a bug?
                  </h3>
                  <p className="text-white/80 text-sm">
                    Use the feedback widget in the bottom-left corner or email
                    us with details.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    💡 Have a feature idea?
                  </h3>
                  <p className="text-white/80 text-sm">
                    We'd love to hear it! Send us your suggestions through this
                    contact form.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    🏆 Want to compete?
                  </h3>
                  <p className="text-white/80 text-sm">
                    Join our leaderboards and participate in community
                    tournaments.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
