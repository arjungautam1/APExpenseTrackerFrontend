import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, DollarSign, TrendingUp, Sparkles, Zap } from 'lucide-react';

interface ModernSuccessPopupProps {
  isVisible: boolean;
  onComplete?: () => void;
  variant?: 'slide-card' | 'floating-badge' | 'bottom-sheet' | 'inline-celebration' | 'corner-toast';
  title?: string;
  message?: string;
  amount?: number;
  type?: 'income' | 'expense' | 'investment' | 'transfer';
  autoHide?: boolean;
  duration?: number;
}

export function ModernSuccessPopup({
  isVisible,
  onComplete,
  variant = 'slide-card',
  title = 'Transaction Added!',
  message = 'Your transaction has been successfully recorded.',
  amount,
  type = 'expense',
  autoHide = true,
  duration = 4000
}: ModernSuccessPopupProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 50));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 50);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
        setProgress(100);
      };
    }
  }, [isVisible, autoHide, duration, onComplete]);

  const getTypeColor = () => {
    switch (type) {
      case 'income':
        return {
          bg: 'from-emerald-500 to-green-600',
          text: 'text-emerald-700',
          icon: 'text-emerald-600',
          light: 'bg-emerald-50/80',
          border: 'border-emerald-200/60',
          accent: 'text-emerald-800',
          glow: 'shadow-emerald-500/20'
        };
      case 'investment':
        return {
          bg: 'from-violet-500 to-purple-600',
          text: 'text-violet-700',
          icon: 'text-violet-600',
          light: 'bg-violet-50/80',
          border: 'border-violet-200/60',
          accent: 'text-violet-800',
          glow: 'shadow-violet-500/20'
        };
      case 'transfer':
        return {
          bg: 'from-blue-500 to-indigo-600',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          light: 'bg-blue-50/80',
          border: 'border-blue-200/60',
          accent: 'text-blue-800',
          glow: 'shadow-blue-500/20'
        };
      default:
        return {
          bg: 'from-rose-500 to-red-600',
          text: 'text-rose-700',
          icon: 'text-rose-600',
          light: 'bg-rose-50/80',
          border: 'border-rose-200/60',
          accent: 'text-rose-800',
          glow: 'shadow-rose-500/20'
        };
    }
  };

  const colors = getTypeColor();

  if (variant === 'slide-card') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 320, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 320, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-96 max-w-[calc(100vw-2rem)]"
          >
            <div className={`bg-white/98 backdrop-blur-2xl border border-white/30 rounded-xl shadow-2xl ${colors.glow} overflow-hidden`}>
              {/* Ultra-thin progress bar */}
              <div className="h-0.5 bg-gray-100/50">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full bg-gradient-to-r ${colors.bg}`}
                />
              </div>

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Enhanced animated icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow}`}
                  >
                    <CheckCircle className="h-5 w-5 text-white drop-shadow-sm" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.h3
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`text-base font-bold ${colors.accent} leading-tight mb-1`}
                    >
                      {title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-sm text-gray-700 leading-relaxed mb-3"
                    >
                      {message}
                    </motion.p>
                    
                    {amount && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`inline-flex items-center px-3 py-2 rounded-lg ${colors.light} border ${colors.border} shadow-sm`}
                      >
                        <DollarSign className={`h-4 w-4 mr-1.5 ${colors.icon}`} />
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {amount.toFixed(2)}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100/80"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Enhanced glow effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 2, delay: 0.2 }}
                  className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-xl pointer-events-none`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'floating-badge') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, x: 20, y: -20, opacity: 0 }}
            animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
            exit={{ scale: 0, x: 20, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 500 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999]"
          >
            <div className={`bg-white/98 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl ${colors.glow} px-5 py-3`}>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`p-2 rounded-xl bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow}`}
                >
                  <CheckCircle className="h-4 w-4 text-white drop-shadow-sm" />
                </motion.div>
                <div className="min-w-0">
                  <p className={`font-semibold ${colors.accent} text-sm leading-tight`}>{title}</p>
                  {amount && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold ${colors.text}`}>
                        ${amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">added</span>
                    </div>
                  )}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: 1 }}
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.bg} shadow-sm`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'bottom-sheet') {
    return (
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/15 backdrop-blur-sm"
              onClick={onComplete}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 500 }}
              className={`fixed bottom-0 left-0 right-0 z-[9999] bg-white/98 backdrop-blur-2xl border-t border-white/40 rounded-t-2xl shadow-2xl ${colors.glow}`}
            >
              <div className="p-6">
                {/* Elegant handle */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
                
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow}`}
                  >
                    <CheckCircle className="h-6 w-6 text-white drop-shadow-sm" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold ${colors.accent} leading-tight mb-2`}>{title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                    {amount && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`inline-flex items-center px-4 py-2 rounded-lg ${colors.light} border ${colors.border} shadow-sm mt-3`}
                      >
                        <DollarSign className={`h-4 w-4 mr-2 ${colors.icon}`} />
                        <span className={`text-base font-bold ${colors.text}`}>
                          {amount.toFixed(2)}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={onComplete}
                  className={`w-full py-3 px-4 bg-gradient-to-r ${colors.bg} text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform shadow-lg text-base`}
                >
                  Perfect! 🎉
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'corner-toast') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, x: 20, y: -20, opacity: 0 }}
            animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
            exit={{ scale: 0, x: 20, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]"
          >
            <div className={`bg-white/98 backdrop-blur-xl border border-white/40 rounded-lg shadow-xl ${colors.glow} p-4 w-80`}>
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ rotate: -45 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className={`p-2 rounded-lg bg-gradient-to-br ${colors.bg} flex-shrink-0 shadow-lg ${colors.glow}`}
                >
                  <Zap className="h-4 w-4 text-white drop-shadow-sm" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${colors.accent} text-sm leading-tight`}>{title}</h4>
                    <button
                      onClick={onComplete}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100/50 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">{message}</p>
                  {amount && (
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center px-2 py-1 rounded-md ${colors.light} border ${colors.border}`}>
                        <span className={`text-xs font-bold ${colors.text}`}>
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${colors.text} capitalize`}>
                        {type}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced progress bar */}
              <div className="mt-3 h-1 bg-gray-100/80 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className={`h-full bg-gradient-to-r ${colors.bg} shadow-sm`}
                />
              </div>
            </div>

            {/* Enhanced pulse */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colors.bg} pointer-events-none`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default inline-celebration
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className={`bg-white/98 backdrop-blur-2xl border border-white/40 rounded-xl shadow-2xl ${colors.glow} p-6 max-w-sm w-full text-center`}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.6 }}
              className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}
            >
              <CheckCircle className="h-7 w-7 text-white drop-shadow-sm" />
            </motion.div>
            
            <h3 className={`text-xl font-bold ${colors.accent} mb-2 leading-tight`}>{title}</h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{message}</p>
            
            {amount && (
              <div className={`inline-flex items-center px-4 py-2 rounded-lg ${colors.light} ${colors.border} border mb-4 shadow-sm`}>
                <TrendingUp className={`h-4 w-4 mr-2 ${colors.icon}`} />
                <span className={`font-bold text-base ${colors.text}`}>
                  ${amount.toFixed(2)}
                </span>
              </div>
            )}
            
            <button
              onClick={onComplete}
              className={`w-full py-3 px-4 bg-gradient-to-r ${colors.bg} text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform shadow-lg text-base`}
            >
              Awesome! 🎉
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy modern success celebrations
export function useModernSuccessPopup() {
  const [popup, setPopup] = useState<{
    isVisible: boolean;
    variant?: 'slide-card' | 'floating-badge' | 'bottom-sheet' | 'inline-celebration' | 'corner-toast';
    title?: string;
    message?: string;
    amount?: number;
    type?: 'income' | 'expense' | 'investment' | 'transfer';
  }>({
    isVisible: false
  });

  const showPopup = (options?: {
    variant?: 'slide-card' | 'floating-badge' | 'bottom-sheet' | 'inline-celebration' | 'corner-toast';
    title?: string;
    message?: string;
    amount?: number;
    type?: 'income' | 'expense' | 'investment' | 'transfer';
  }) => {
    setPopup({
      isVisible: true,
      ...options
    });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, isVisible: false }));
  };

  return {
    popup,
    showPopup,
    hidePopup
  };
}

export default ModernSuccessPopup;