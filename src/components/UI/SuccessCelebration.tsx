import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiExplosion from 'react-confetti-explosion';
import { CheckCircle, Star, Trophy, Sparkles } from 'lucide-react';

interface SuccessCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: 'achievement' | 'goal' | 'milestone' | 'success';
  title?: string;
  message?: string;
  autoHide?: boolean;
  duration?: number;
}

export function SuccessCelebration({
  isVisible,
  onComplete,
  type = 'success',
  title,
  message,
  autoHide = true,
  duration = 3000
}: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      setShowConfetti(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          onComplete?.();
        }, duration);
        
        return () => {
          clearTimeout(timer);
          document.body.style.overflow = 'unset';
        };
      }
    } else {
      setShowConfetti(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, autoHide, duration, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'goal':
        return <Star className="h-8 w-8 text-blue-500" />;
      case 'milestone':
        return <Sparkles className="h-8 w-8 text-purple-500" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'achievement':
        return 'Achievement Unlocked!';
      case 'goal':
        return 'Goal Reached!';
      case 'milestone':
        return 'Milestone Achieved!';
      default:
        return 'Success!';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'achievement':
        return 'You\'ve earned a new achievement badge!';
      case 'goal':
        return 'Congratulations on reaching your goal!';
      case 'milestone':
        return 'You\'ve hit an important milestone!';
      default:
        return 'Great job!';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9998] pointer-events-none">
              <ConfettiExplosion
                force={0.8}
                duration={3000}
                particleCount={150}
                width={1600}
                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
              />
            </div>
          )}

          {/* Success Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onComplete}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 300,
                delay: 0.5 
              }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 1,
                  type: "spring", 
                  damping: 15, 
                  stiffness: 200 
                }}
                className="flex justify-center mb-4"
              >
                <div className="p-4 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                  {getIcon()}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                {getTitle()}
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="text-gray-600 mb-6"
              >
                {getMessage()}
              </motion.p>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                onClick={onComplete}
                className="btn-primary px-6 py-2 hover:scale-105 transition-transform"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easy success celebrations
export function useSuccessCelebration() {
  const [celebration, setCelebration] = useState<{
    isVisible: boolean;
    type?: 'achievement' | 'goal' | 'milestone' | 'success';
    title?: string;
    message?: string;
  }>({
    isVisible: false
  });

  const celebrate = (options?: {
    type?: 'achievement' | 'goal' | 'milestone' | 'success';
    title?: string;
    message?: string;
  }) => {
    setCelebration({
      isVisible: true,
      ...options
    });
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  };

  return {
    celebration,
    celebrate,
    hideCelebration
  };
}

export default SuccessCelebration;