import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, UserCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const data = await login(cleanEmail, password);
      if (!data.user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('[Login Error]', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const data = await login(demoEmail, demoPassword);
      if (!data.user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-xs text-gray-400">Sign in to access your projects and team workspace</p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs p-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="alex@student.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-lg font-bold text-white text-xs shadow-lg flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo 1-Click Login Section */}
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 block text-center">
              Quick 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@student.edu', 'Password123!')}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-500/50 text-cyan-300 font-semibold text-center truncate"
              >
                Alex (Student)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@student.edu', 'Password123!')}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-indigo-500/50 text-indigo-300 font-semibold text-center truncate"
              >
                Sarah (Owner)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@partnerfinder.com', 'Password123!')}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-purple-500/50 text-purple-300 font-semibold text-center truncate"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
