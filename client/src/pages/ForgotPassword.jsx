import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AppIcon from '../components/common/AppIcon';
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSentSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 my-6 w-full min-w-0">
        <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <AppIcon size="lg" className="mx-auto shadow-lg shadow-cyan-500/20" />
            <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
            <p className="text-xs text-gray-400">Enter your university email to receive a 6-digit verification code</p>
          </div>

          {sentSuccess ? (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-300 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold">Verification Code Sent!</div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  We sent a 6-digit verification code to <span className="font-semibold text-white">{email}</span>.
                </p>
              </div>

              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full gradient-btn py-3 rounded-xl font-bold text-white text-xs shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Enter Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs p-3 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn py-3 rounded-xl font-bold text-white text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-800/60">
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline inline-flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
