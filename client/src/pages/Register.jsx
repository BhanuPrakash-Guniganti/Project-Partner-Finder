import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AppIcon from '../components/common/AppIcon';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, AtSign, BookOpen, Calendar } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [gradYear, setGradYear] = useState('2026');
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
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
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
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 my-6 w-full min-w-0">
        <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <AppIcon size="lg" className="mx-auto shadow-lg shadow-cyan-500/20" />
            <div>
              <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest block">PartnerFinder</span>
              <h2 className="text-2xl font-bold text-white leading-tight">Create Student Account</h2>
            </div>
            <p className="text-xs text-gray-400">Join PartnerFinder to connect with project teammates & hackathon partners</p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs p-3 rounded-xl flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid 1: Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Username</label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="alex_rivera"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">University Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="alex@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Grid 2: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Grid 3: Academic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-gray-300">College / University</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Stanford / MIT"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-gray-300">Degree / Course</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-gray-300">Graduation Year</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Role */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-gray-300">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="student">Student / Team Developer</option>
                <option value="admin">Platform Administrator (Dev Demo)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-white text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account & Continue to Profile Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-800/60">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign in to PartnerFinder
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
