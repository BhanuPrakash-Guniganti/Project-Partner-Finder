import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AppIcon from '../components/common/AppIcon';
import { Sparkles, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit OTP verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showSuccess('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 my-6 w-full min-w-0">
        <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <AppIcon size="lg" className="mx-auto shadow-lg shadow-cyan-500/20" />
            <h2 className="text-2xl font-bold text-white">Enter OTP & New Password</h2>
            <p className="text-xs text-gray-400">
              Check {initialEmail ? <span className="text-cyan-400 font-semibold">{initialEmail}</span> : 'your email'} for the 6-digit verification code
            </p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/60 text-red-300 text-xs p-3 rounded-xl flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 6-Digit OTP Inputs */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 block text-center">6-Digit Verification OTP</label>
              <div className="flex justify-between gap-1.5 pt-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-bold bg-gray-900 border border-gray-800 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-white text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Reset Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-800/60">
            Remember your password?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
