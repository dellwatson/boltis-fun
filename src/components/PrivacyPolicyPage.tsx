import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, Cookie, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <motion.div
        className="max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="flex items-center gap-4 mb-8" variants={itemVariants}>
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
              <Shield className="w-10 h-10 text-green-400" />
              Privacy Policy
            </h1>
            <p className="text-white/80">How we protect and handle your data</p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
          variants={itemVariants}
        >
          <div className="prose prose-lg max-w-none text-white">
            <div className="mb-8">
              <p className="text-white/90 text-lg leading-relaxed">
                Last updated: June 24, 2025
              </p>
              <p className="text-white/80 mt-4">
                At BOLTIS, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our game and services.
              </p>
            </div>

            <div className="space-y-8">
              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Database className="w-6 h-6 text-blue-400" />
                  Information We Collect
                </h2>
                <div className="space-y-4 text-white/90">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Email address (when you create an account)</li>
                      <li>Username and display name</li>
                      <li>Profile information you choose to provide</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Game Data</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Game statistics and match history</li>
                      <li>Leaderboard rankings</li>
                      <li>In-game preferences and settings</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Technical Information</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Device information and browser type</li>
                      <li>IP address and general location</li>
                      <li>Usage analytics and performance data</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-green-400" />
                  How We Use Your Information
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and maintain our game services</li>
                    <li>Track your game progress and statistics</li>
                    <li>Enable multiplayer features and matchmaking</li>
                    <li>Send important updates and notifications</li>
                    <li>Improve our game and develop new features</li>
                    <li>Prevent fraud and ensure fair play</li>
                    <li>Respond to your feedback and support requests</li>
                  </ul>
                </div>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-yellow-400" />
                  Data Sharing and Disclosure
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Public Leaderboards:</strong> Your username and game statistics may be displayed on public leaderboards</li>
                    <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our game (like Supabase for data storage)</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                  </ul>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-red-400" />
                  Data Security
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>We implement appropriate security measures to protect your information:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure authentication and access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal information by our team</li>
                  </ul>
                  <p className="mt-4">
                    However, no method of transmission over the internet is 100% secure. 
                    While we strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Cookie className="w-6 h-6 text-orange-400" />
                  Cookies and Tracking
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Keep you logged in to your account</li>
                    <li>Remember your game preferences</li>
                    <li>Analyze how our game is used</li>
                    <li>Improve performance and user experience</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookies through your browser settings, but disabling them may affect game functionality.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-purple-400" />
                  Your Rights and Choices
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Update:</strong> Correct or update your account information</li>
                    <li><strong>Delete:</strong> Request deletion of your account and data</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                    <li><strong>Portability:</strong> Request your data in a portable format</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us at privacy@boltis.game
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
                <div className="text-white/90">
                  <p>
                    BOLTIS is not intended for children under 13 years of age. We do not knowingly collect 
                    personal information from children under 13. If you are a parent or guardian and believe 
                    your child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
                <div className="text-white/90">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                    We encourage you to review this Privacy Policy periodically.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white/5 p-6 rounded-xl border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <div className="text-white/90 space-y-2">
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <div className="space-y-1">
                    <p><strong>Email:</strong> contact@theras.xyz</p>
                    <p><strong>Website:</strong> https://theras.xyz</p>
                    <p><strong>Address:</strong> Bali, Indonesia</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicyPage;