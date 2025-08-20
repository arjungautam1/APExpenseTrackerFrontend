import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles, ArrowLeft, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(formData);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      <style>
        {`
          .floating-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.3;
            animation: float 6s ease-in-out infinite;
          }
          .floating-orb:nth-child(1) {
            animation-delay: 0s;
          }
          .floating-orb:nth-child(2) {
            animation-delay: 2s;
          }
          .floating-orb:nth-child(3) {
            animation-delay: 4s;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background Elements */}
        <div className="floating-orb w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 top-10 -left-20"></div>
        <div className="floating-orb w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 top-1/2 -right-32"></div>
        <div className="floating-orb w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-400 bottom-10 left-1/3"></div>
        
        {/* Main Content */}
        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* App Branding Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              {/* Logo and Brand */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.4 }}
                className="relative inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg"
              >
                <BarChart3 className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
                <p className="text-blue-100 text-sm font-medium">Sign in to continue managing your finances</p>
              </motion.div>
              
              {/* Decorative Elements */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="absolute top-4 right-4 w-8 h-8 bg-yellow-400/30 rounded-full flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 text-yellow-200" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute bottom-4 left-4 w-6 h-6 bg-green-400/30 rounded-full flex items-center justify-center"
              >
                <Zap className="h-3 w-3 text-green-200" />
              </motion.div>
            </motion.div>

            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 sm:p-8"
            >
              {/* Back Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-4 left-4"
              >
                <Link
                  to="/"
                  className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"></div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="relative w-full pl-4 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:bg-white/90 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 touch-manipulation min-h-[52px] placeholder-gray-400"
                      placeholder="Enter your email address"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-blue-600" />
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"></div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="relative w-full pl-4 pr-12 py-4 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:bg-white/90 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 touch-manipulation min-h-[52px] placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 touch-manipulation transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 touch-manipulation min-h-[56px] group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  {isLoading ? (
                    <motion.div 
                      className="flex items-center justify-center space-x-3 relative z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                      />
                      <span>Signing you in...</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex items-center justify-center space-x-3 relative z-10"
                      whileHover={{ x: 2 }}
                    >
                      <LogIn className="h-6 w-6" />
                      <span>Sign In</span>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <TrendingUp className="h-5 w-5" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.button>
              </form>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-8 pt-6 border-t border-gray-200/50 text-center"
              >
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline underline-offset-2"
                  >
                    Sign up here
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}