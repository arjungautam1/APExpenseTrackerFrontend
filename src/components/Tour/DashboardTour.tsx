import React, { useState, useEffect } from 'react';
import { useTour } from '@reactour/tour';
import { motion } from 'framer-motion';
import { HelpCircle, X, ArrowRight, ArrowLeft, Play } from 'lucide-react';

interface DashboardTourProps {
  onClose?: () => void;
}

export function DashboardTour({ onClose }: DashboardTourProps) {
  const { setIsOpen, isOpen, currentStep, steps, setCurrentStep } = useTour();
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const tourSeen = localStorage.getItem('dashboard-tour-seen');
    if (!tourSeen) {
      setHasSeenTour(false);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
    localStorage.setItem('dashboard-tour-seen', 'true');
    setHasSeenTour(true);
  };

  const closeTour = () => {
    setIsOpen(false);
    onClose?.();
  };

  // Show welcome banner for first-time users
  if (!hasSeenTour) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9997] bg-white/95 backdrop-blur-md border border-primary-200 rounded-xl shadow-lg p-4 mx-4 max-w-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Welcome to AP Finance Tracker! 🎉
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Take a quick tour to discover all the powerful features that will help you manage your finances.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={startTour}
                  className="btn-primary text-sm px-4 py-2 flex items-center hover:scale-105 transition-transform"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Tour
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('dashboard-tour-seen', 'true');
                    setHasSeenTour(true);
                  }}
                  className="btn-secondary text-sm px-4 py-2 hover:scale-105 transition-transform"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              setHasSeenTour(true);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Return null to hide the floating help button
  return null;
}

// Tour step configurations
export const dashboardTourSteps = [
  {
    selector: '[data-tour="stats-cards"]',
    content: (
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">📊 Financial Overview</h3>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip Tour
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Get a quick snapshot of your financial health with real-time stats for income, expenses, investments, and savings.
        </p>
        <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
          <ArrowRight className="h-3 w-3 mr-1" />
          Hover over cards to see enhanced details
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="quick-actions"]',
    content: (
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h3>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip Tour
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Add transactions instantly with Quick Add, scan receipts with AI, or upload multiple transactions at once.
        </p>
        <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
          <ArrowRight className="h-3 w-3 mr-1" />
          Try scanning a receipt to see AI in action!
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="recent-transactions"]',
    content: (
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">📝 Recent Transactions</h3>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip Tour
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          View your latest transactions with smart categorization and filtering. Switch between All, Income, Expense, and Investment views.
        </p>
        <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
          <ArrowRight className="h-3 w-3 mr-1" />
          Use the tabs to filter by transaction type
        </div>
      </div>
    ),
    position: 'left' as const,
  },
  {
    selector: '[data-tour="expense-breakdown"]',
    content: (
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">🎯 Expense Analysis</h3>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip Tour
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Understand your spending patterns with detailed breakdowns by category, trends over time, and monthly recurring expenses.
        </p>
        <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
          <ArrowRight className="h-3 w-3 mr-1" />
          Switch between Categories, Trends, and Monthly views
        </div>
      </div>
    ),
    position: 'left' as const,
  },
  {
    selector: '[data-tour="navigation"]',
    content: (
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">🧭 Navigation</h3>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip Tour
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Explore different sections: Transactions for detailed history, Monthly Expenses for recurring bills, Investments for portfolio tracking, and Analytics for deep insights.
        </p>
        <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
          <ArrowRight className="h-3 w-3 mr-1" />
          Click any menu item to explore more features
        </div>
      </div>
    ),
    position: 'right' as const,
  },
  {
    selector: '[data-tour="investment-card"]',
    content: (
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">💎 Investment Tracking</h3>
          <button
            onClick={() => {
              localStorage.setItem('dashboard-tour-seen', 'true');
              window.location.reload();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip Tour
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          This special card tracks your investment portfolio. Watch it grow with beautiful animations and get insights into your wealth building journey.
        </p>
        <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
          <ArrowRight className="h-3 w-3 mr-1" />
          Hover to see the enhanced visual effects!
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
];

export default DashboardTour;