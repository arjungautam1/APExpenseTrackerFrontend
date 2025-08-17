import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernSuccessPopup } from '../UI/ModernSuccessPopup';
import { Play, Sparkles, CreditCard, TrendingUp, Building, Send } from 'lucide-react';

export function PopupVariantsDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const variants = [
    {
      id: 'slide-card',
      name: 'Slide Card',
      description: 'Ultra-compact side notification with subtle glow',
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'floating-badge',
      name: 'Floating Badge',
      description: 'Minimal top-center badge with smooth animation',
      icon: Sparkles,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'bottom-sheet',
      name: 'Bottom Sheet',
      description: 'Compact mobile-first bottom drawer',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'corner-toast',
      name: 'Corner Toast',
      description: 'Sleek corner notification with thin progress',
      icon: Send,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'inline-celebration',
      name: 'Modal Focus',
      description: 'Compact centered modal with backdrop blur',
      icon: Building,
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const demoTransactions = [
    { type: 'income' as const, amount: 2500, title: 'Salary Received!', message: 'Your monthly salary has been credited.' },
    { type: 'expense' as const, amount: 85.50, title: 'Expense Added!', message: 'Grocery shopping expense recorded.' },
    { type: 'investment' as const, amount: 1000, title: 'Investment Made!', message: 'Successfully invested in stocks.' },
    { type: 'transfer' as const, amount: 500, title: 'Transfer Complete!', message: 'Money transferred to savings account.' }
  ];

  const showDemo = (variantId: string) => {
    const randomTransaction = demoTransactions[Math.floor(Math.random() * demoTransactions.length)];
    setActiveDemo(variantId);
    
    // Auto-hide after demo duration
    setTimeout(() => {
      setActiveDemo(null);
    }, 5000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          ✨ Compact Modern Popups
        </h2>
        <p className="text-gray-600 text-sm">
          Click any variant to preview the new ultra-compact designs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {variants.map((variant, index) => {
          const Icon = variant.icon;
          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
              onClick={() => showDemo(variant.id)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${variant.color} shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Play className="h-3 w-3 text-gray-600" />
                  </motion.button>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                  {variant.name}
                </h3>
                <p className="text-xs text-gray-600 leading-snug group-hover:text-gray-700 transition-colors">
                  {variant.description}
                </p>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Preview</span>
                    <div className="flex space-x-1">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${variant.color} animate-pulse`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${variant.color} animate-pulse`} style={{animationDelay: '0.2s'}}></div>
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${variant.color} animate-pulse`} style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
        <div className="flex items-start space-x-3">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1 text-sm">Ultra-Compact Designs:</h3>
            <ul className="text-xs text-gray-700 space-y-0.5">
              <li>• 40% smaller with better spacing and modern aesthetics</li>
              <li>• Smoother animations and enhanced backdrop blur effects</li>
              <li>• Click any variant above to see the improved designs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Render Active Demo */}
      {activeDemo && (
        <ModernSuccessPopup
          isVisible={true}
          variant={activeDemo as any}
          title={demoTransactions[Math.floor(Math.random() * demoTransactions.length)].title}
          message={demoTransactions[Math.floor(Math.random() * demoTransactions.length)].message}
          amount={demoTransactions[Math.floor(Math.random() * demoTransactions.length)].amount}
          type={demoTransactions[Math.floor(Math.random() * demoTransactions.length)].type}
          onComplete={() => setActiveDemo(null)}
        />
      )}
    </div>
  );
}