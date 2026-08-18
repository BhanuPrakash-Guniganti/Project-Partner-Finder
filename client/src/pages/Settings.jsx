import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings as SettingsIcon, User, KeyRound, Mail, Moon, Sun, 
  Bell, Globe, Eye, Lock, ShieldCheck, HelpCircle, AlertTriangle, 
  MailCheck, ChevronRight, LogOut, Trash2, ArrowLeft, X, Check, Laptop 
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Settings State Management
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [language, setLanguage] = useState('English (US)');

  const [profileVisibility, setProfileVisibility] = useState('Public');
  const [projectVisibility, setProjectVisibility] = useState('Public');
  const [messagePermissions, setMessagePermissions] = useState('Everyone');

  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [reportText, setReportText] = useState('');

  const handleSaveSetting = (msg = 'Setting updated!') => {
    showSuccess(msg);
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match!');
      return;
    }
    showSuccess('Password updated successfully!');
    setPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    showSuccess('Thank you! Your report has been submitted to support.');
    setReportModalOpen(false);
    setReportText('');
  };

  const handleDeleteAccountConfirm = () => {
    showSuccess('Your account has been deleted.');
    setDeleteModalOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>Settings</span>
              </h1>
              <p className="text-xs text-gray-400">Manage account, app preferences, privacy & security</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: ACCOUNT */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>ACCOUNT</span>
          </h2>

          <div className="space-y-2">
            {/* Edit Profile */}
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Edit Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>

            {/* Change Password */}
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <KeyRound className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>

            {/* Email Preferences */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Email Preferences</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => { setEmailAlerts(e.target.checked); handleSaveSetting('Email preferences updated!'); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: APP */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>APP</span>
          </h2>

          <div className="space-y-3">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <Moon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Dark Mode</span>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => { setDarkMode(e.target.checked); setTheme(e.target.checked ? 'dark' : 'light'); handleSaveSetting('Theme preference saved!'); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <Bell className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => { setPushNotifs(e.target.checked); handleSaveSetting('Notification settings updated!'); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Language</span>
              </div>
              <select
                value={language}
                onChange={(e) => { setLanguage(e.target.value); handleSaveSetting(`Language set to ${e.target.value}`); }}
                className="bg-gray-950 border border-gray-800 text-cyan-300 font-semibold rounded-xl px-3 py-1 text-xs focus:outline-none"
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRIVACY */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>PRIVACY</span>
          </h2>

          <div className="space-y-3">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <span className="font-semibold text-white">Profile Visibility</span>
              <select
                value={profileVisibility}
                onChange={(e) => { setProfileVisibility(e.target.value); handleSaveSetting('Profile visibility updated!'); }}
                className="bg-gray-950 border border-gray-800 text-purple-300 font-semibold rounded-xl px-3 py-1 text-xs focus:outline-none"
              >
                <option value="Public">Public</option>
                <option value="Students Only">Students Only</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {/* Project Visibility */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <span className="font-semibold text-white">Project Visibility</span>
              <select
                value={projectVisibility}
                onChange={(e) => { setProjectVisibility(e.target.value); handleSaveSetting('Project visibility updated!'); }}
                className="bg-gray-950 border border-gray-800 text-purple-300 font-semibold rounded-xl px-3 py-1 text-xs focus:outline-none"
              >
                <option value="Public">Public</option>
                <option value="Team Only">Team Only</option>
              </select>
            </div>

            {/* Message Permissions */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <span className="font-semibold text-white">Message Permissions</span>
              <select
                value={messagePermissions}
                onChange={(e) => { setMessagePermissions(e.target.value); handleSaveSetting('Message permissions updated!'); }}
                className="bg-gray-950 border border-gray-800 text-purple-300 font-semibold rounded-xl px-3 py-1 text-xs focus:outline-none"
              >
                <option value="Everyone">Everyone</option>
                <option value="Team Members Only">Team Members Only</option>
                <option value="Connections Only">Connections Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: SECURITY */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>SECURITY</span>
          </h2>

          <div className="space-y-3">
            {/* Active Sessions */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <Laptop className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Active Sessions</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                2 Active Sessions
              </span>
            </div>

            {/* Two-factor authentication */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-white truncate">Two-factor authentication</span>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => { setTwoFactorAuth(e.target.checked); handleSaveSetting(e.target.checked ? '2FA Enabled!' : '2FA Disabled'); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: SUPPORT */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>SUPPORT</span>
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/help')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <span className="font-semibold text-white">Help Center</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <span className="font-semibold text-white">Report a Problem</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <a
              href="mailto:support@partnerfinder.com"
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <span className="font-semibold text-white">Contact Support</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>

            <button
              onClick={() => setTermsModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <span className="font-semibold text-white">Terms</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 text-xs text-left transition-colors"
            >
              <span className="font-semibold text-white">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* SECTION 6: DANGER ZONE */}
        <div className="glass-panel p-5 rounded-3xl border border-red-900/50 bg-red-950/20 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>DANGER ZONE</span>
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="w-full p-3.5 bg-red-950/60 hover:bg-red-900/60 border border-red-900/80 rounded-2xl text-xs font-bold text-red-300 flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Delete Account</span>
            </button>

            <button
              onClick={logout}
              className="w-full p-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-cyan-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* MODAL 1: CHANGE PASSWORD */}
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-3xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Change Password</h3>
                <button onClick={() => setPasswordModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                <input
                  type="password"
                  required
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
                <input
                  type="password"
                  required
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setPasswordModalOpen(false)} className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl">Cancel</button>
                  <button type="submit" className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl">Update Password</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: REPORT A PROBLEM */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-3xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Report a Problem</h3>
                <button onClick={() => setReportModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <textarea
                  rows="4"
                  required
                  placeholder="Describe the issue or bug you encountered..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl">Cancel</button>
                  <button type="submit" className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: TERMS */}
        {termsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-800 p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Terms of Service</h3>
                <button onClick={() => setTermsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
                <p>PartnerFinder is a skill-matching and project collaboration platform for developers and students.</p>
                <p>By accessing or using our service, you agree to treat team members with respect, honor project commitments, and refrain from abusive behavior.</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: PRIVACY POLICY */}
        {privacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-800 p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Privacy Policy</h3>
                <button onClick={() => setPrivacyModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
                <p>Your privacy is paramount. Resume uploads and candidate profiles are processed securely using encrypted protocols.</p>
                <p>We do not share your private contact information without your explicit permission.</p>
              </div>
            </div>
          </div>
        )}

        {/* DELETE ACCOUNT CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteAccountConfirm}
          title="Delete Account?"
          message="Are you sure you want to permanently delete your PartnerFinder account? This action cannot be undone."
          confirmText="Delete Account"
          confirmVariant="danger"
        />

      </main>

      <Footer />
    </div>
  );
};

export default Settings;
