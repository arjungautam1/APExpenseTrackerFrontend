import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTour } from '@reactour/tour';
import { motion } from 'framer-motion';
import {
  Home,
  CreditCard,
  TrendingUp,
  Building,
  Send,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Calendar,
  HelpCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Monthly Expenses', href: '/monthly-expenses', icon: Calendar },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
  { name: 'Loans & EMIs', href: '/loans', icon: Building },
  { name: 'Transfers', href: '/transfers', icon: Send },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const { setIsOpen, setSteps } = useTour();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white/98 backdrop-blur-md shadow-xl border-r border-gray-200/60">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col bg-white/98 backdrop-blur-sm border-r border-gray-200/70 shadow-md">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/70 px-3 py-3 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-10 w-10 sm:h-12 sm:w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3 ml-auto">
              {/* Space for future features like notifications */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-8">
          {children}
        </main>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="flex h-16 items-center px-4 sm:px-6 border-b border-gray-200/60">
          <div className="flex items-center min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm" />
            </div>
            <div className="ml-3 min-w-0">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-none">AP Expense</span>
                <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent leading-none">Tracker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto" data-tour="navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200/60">
          {/* Help Section */}
          <div className="px-2 py-3">
            <button
              onClick={() => {
                // Import and set dashboard tour steps
                import('../Tour/DashboardTour').then(({ dashboardTourSteps }) => {
                  setSteps?.(dashboardTourSteps as any);
                  setIsOpen?.(true);
                });
                setSidebarOpen(false);
              }}
              className="group flex items-center w-full rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm transition-all duration-200"
            >
              <HelpCircle className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              <span className="truncate">Help & Tour</span>
            </button>
          </div>

          {/* Profile Section */}
          <div className="px-4 py-3">
            <div className="relative">
              {/* Profile Button */}
              <button
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="w-full flex items-center space-x-3 p-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200/60 hover:border-gray-300/80 transition-all duration-200 hover:shadow-sm"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white drop-shadow-sm" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <svg 
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${profileExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {profileExpanded && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-gray-200/80 shadow-lg overflow-hidden z-50">
                  <div className="p-1.5">
                    <Link
                      to="/profile-settings"
                      className="flex items-center w-full p-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-md transition-all duration-200"
                      onClick={() => {
                        setSidebarOpen(false);
                        setProfileExpanded(false);
                      }}
                    >
                      <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center mr-2.5">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">Profile Settings</p>
                        <p className="text-xs text-gray-500">Manage account</p>
                      </div>
                    </Link>
                    
                    <button className="flex items-center w-full p-2.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-purple-50 rounded-md transition-all duration-200">
                      <div className="w-7 h-7 bg-purple-100 rounded-md flex items-center justify-center mr-2.5">
                        <Settings className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-xs">Preferences</p>
                        <p className="text-xs text-gray-500">App settings</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Click outside to close */}
              {profileExpanded && (
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileExpanded(false)}
                />
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="px-4 pb-4">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs transition-all duration-200 hover:shadow-sm"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </>
    );
  }
}