import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  Users,
  Gavel,
} from 'lucide-react';

interface TermsOfServicePageProps {
  onBack: () => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBack }) => {
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
        className="max-w-4xl mx-auto px-4 py-8"
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
              <FileText className="w-10 h-10 text-blue-400" />
              Terms of Service
            </h1>
            <p className="text-white/80">
              Rules and guidelines for using BOLTIS
            </p>
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
                Welcome to BOLTIS! These Terms of Service ("Terms") govern your
                use of our game and services. By accessing or using BOLTIS, you
                agree to be bound by these Terms.
              </p>
            </div>

            <div className="space-y-8">
              {/* Acceptance of Terms */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Scale className="w-6 h-6 text-green-400" />
                  Acceptance of Terms
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    By creating an account, playing BOLTIS, or using any of our
                    services, you acknowledge that you have read, understood,
                    and agree to be bound by these Terms and our Privacy Policy.
                  </p>
                  <p>
                    If you do not agree to these Terms, you may not access or
                    use our services.
                  </p>
                </div>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-400" />
                  Eligibility
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>To use BOLTIS, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be at least 13 years old</li>
                    <li>Have the legal capacity to enter into these Terms</li>
                    <li>
                      Not be prohibited from using our services under applicable
                      law
                    </li>
                    <li>
                      Provide accurate and complete information when creating an
                      account
                    </li>
                  </ul>
                  <p>
                    If you are under 18, you represent that you have your parent
                    or guardian's permission to use our services.
                  </p>
                </div>
              </section>

              {/* Account Responsibilities */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-yellow-400" />
                  Account Responsibilities
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>When you create an account, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>
                      Be responsible for all activities under your account
                    </li>
                    <li>Not share your account with others</li>
                    <li>
                      Not create multiple accounts to gain unfair advantages
                    </li>
                  </ul>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  Acceptable Use Policy
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>You agree NOT to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Cheat, hack, or use unauthorized third-party software
                    </li>
                    <li>Exploit bugs or glitches for unfair advantage</li>
                    <li>Harass, threaten, or abuse other players</li>
                    <li>Use offensive, inappropriate, or harmful usernames</li>
                    <li>Attempt to reverse engineer or modify our game</li>
                    <li>Distribute malware or harmful content</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Impersonate others or provide false information</li>
                  </ul>
                </div>
              </section>

              {/* Game Rules and Fair Play */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Game Rules and Fair Play
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    BOLTIS is committed to providing a fair and enjoyable gaming
                    experience:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Play fairly and respect other players</li>
                    <li>Report suspected cheating or rule violations</li>
                    <li>Accept game outcomes gracefully</li>
                    <li>Follow community guidelines and etiquette</li>
                  </ul>
                  <p className="mt-4">
                    We reserve the right to investigate and take action against
                    players who violate fair play principles, including
                    temporary or permanent account suspension.
                  </p>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Intellectual Property
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    BOLTIS and all related content, including but not limited to
                    graphics, text, software, and game mechanics, are owned by
                    us or our licensors and are protected by intellectual
                    property laws.
                  </p>
                  <p>You may not:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Copy, modify, or distribute our game content</li>
                    <li>Create derivative works based on our game</li>
                    <li>Use our trademarks or branding without permission</li>
                    <li>Remove or alter copyright notices</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Proprietary Game Mechanics:</strong> Certain game
                    mechanics including Void Card effects, Elemental Stacking
                    system, and other unique gameplay elements are proprietary
                    intellectual property of Dale Watson and Theras Labs, Inc.
                  </p>
                </div>
              </section>

              {/* Privacy and Data */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Privacy and Data
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    Your privacy is important to us. Our collection and use of
                    your information is governed by our Privacy Policy, which is
                    incorporated into these Terms by reference.
                  </p>
                  <p>
                    By using our services, you consent to the collection, use,
                    and sharing of your information as described in our Privacy
                    Policy.
                  </p>
                </div>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Disclaimers
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    BOLTIS is provided "as is" without warranties of any kind.
                    We do not guarantee that our services will be:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Always available or uninterrupted</li>
                    <li>Free from errors or bugs</li>
                    <li>Secure from unauthorized access</li>
                    <li>Compatible with all devices or systems</li>
                  </ul>
                  <p className="mt-4">
                    We reserve the right to modify, suspend, or discontinue our
                    services at any time without notice.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Limitation of Liability
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    To the maximum extent permitted by law, we shall not be
                    liable for any indirect, incidental, special, consequential,
                    or punitive damages arising from your use of BOLTIS.
                  </p>
                  <p>
                    Our total liability to you for any claims related to these
                    Terms or our services shall not exceed the amount you paid
                    us in the 12 months preceding the claim.
                  </p>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Gavel className="w-6 h-6 text-orange-400" />
                  Termination
                </h2>
                <div className="text-white/90 space-y-3">
                  <p>
                    We may terminate or suspend your account and access to our
                    services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>For violation of these Terms</li>
                    <li>For suspected fraudulent or illegal activity</li>
                    <li>At our sole discretion with or without notice</li>
                  </ul>
                  <p className="mt-4">
                    You may terminate your account at any time by contacting us
                    or using account deletion features in the game.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Changes to Terms
                </h2>
                <div className="text-white/90">
                  <p>
                    We may update these Terms from time to time. We will notify
                    you of material changes by posting the updated Terms on our
                    website or in the game. Your continued use of our services
                    after such changes constitutes acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Governing Law
                </h2>
                <div className="text-white/90">
                  <p>
                    These Terms are governed by and construed in accordance with
                    the laws of Indonesia. Any disputes arising from these Terms
                    or your use of our services shall be resolved in the courts
                    of Bali, Indonesia.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white/5 p-6 rounded-xl border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Contact Us
                </h2>
                <div className="text-white/90 space-y-2">
                  <p>
                    If you have any questions about these Terms of Service,
                    please contact us:
                  </p>
                  <div className="space-y-1">
                    <p>
                      <strong>Email:</strong> contact@theras.xyz
                    </p>
                    {/* <p><strong>Support:</strong> contact@theras.xyz</p> */}
                    <p>
                      <strong>Website:</strong> https://theras.xyz
                    </p>
                    <p>
                      <strong>Address:</strong> Bali, Indonesia
                    </p>
                    <p>
                      <strong>Address 2:</strong> 1111B S Governors Ave STE
                      37017 Dover, DE 19904
                    </p>
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

export default TermsOfServicePage;
