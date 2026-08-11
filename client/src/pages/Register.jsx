import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      await register(name.trim(), cleanEmail, password, role);
      navigate('/onboarding');
    } catch (err) {
      console.error('[Registration Error]', err);
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
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
            <h2 className="text-2xl font-bold text-white">Create Student Account</h2>
            <p className="text-xs text-gray-400">Join Partner Finder to discover compatible team projects</p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs p-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="At least 6 characters"
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

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="student">Student / Team Member</option>
                <option value="admin">Platform Administrator (Dev Demo)</option>
              </select>
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
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
