import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Apple, Chrome, Info, CheckCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ isOpen, onClose }) => {
  const { installApp } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await installApp();
    
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
        setInstallSuccess(false);
      }, 2000);
    }
    
    setInstalling(false);
  };

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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Install BOLTIS</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-white/80 mt-2">
                Install BOLTIS as an app for the best gaming experience
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {installSuccess ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Installation Successful!</h3>
                  <p className="text-gray-600">BOLTIS has been installed on your device.</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Benefits */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Why install BOLTIS?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">⚡</span>
                        </div>
                        <span className="text-gray-700">Faster loading and better performance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">📱</span>
                        </div>
                        <span className="text-gray-700">Works offline - play anywhere</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-sm">🎮</span>
                        </div>
                        <span className="text-gray-700">Native app experience</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 text-sm">🔔</span>
                        </div>
                        <span className="text-gray-700">Push notifications for tournaments</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Support */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Available on all devices:</h4>
                    <div className="flex justify-center gap-8">
                      <div className="text-center">
                        <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Mobile</span>
                      </div>
                      <div className="text-center">
                        <Monitor className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Desktop</span>
                      </div>
                    </div>
                  </div>

                  {/* Install Instructions */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">Installation Guide</h4>
                        <p className="text-sm text-blue-700">
                          Click the button below to install, or use your browser's menu options:
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-blue-600">
                          <div className="flex items-center gap-1">
                            <Chrome className="w-3 h-3" />
                            <span>Chrome: Look for install icon in address bar</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Apple className="w-3 h-3" />
                            <span>Safari: Share button → Add to Home Screen</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Install Button */}
                  <motion.button
                    onClick={handleInstall}
                    disabled={installing}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
                    whileHover={{ scale: installing ? 1 : 1.02 }}
                    whileTap={{ scale: installing ? 1 : 0.98 }}
                  >
                    {installing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Installing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Install BOLTIS App</span>
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center">
                    Free to install • No app store required • Instant updates
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;