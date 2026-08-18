import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Shield, 
  Sparkles, Lock, ArrowLeft, LogOut, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [notifApplications, setNotifApplications] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifMatches, setNotifMatches] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [matchThreshold, setMatchThreshold] = useState('70');

  const handleSavePreferences = () => {
    showSuccess('Settings updated successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0 flex-1 space-y-6">
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
                <span>Account & Platform Settings</span>
              </h1>
              <p className="text-xs text-gray-400">Manage appearance, notifications, AI preferences, and privacy</p>
            </div>
          </div>
        </div>

        {/* Section 1: Appearance & Theme */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Sun className="w-4 h-4" />
            <h3>Appearance & Interface Theme</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => { setTheme('dark'); handleSavePreferences(); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'dark'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold shadow-lg'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <Moon className="w-5 h-5 text-cyan-400" />
              <span className="text-xs">Dark Mode</span>
            </button>

            <button
              onClick={() => { setTheme('light'); handleSavePreferences(); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'light'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold shadow-lg'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="text-xs">Light Mode</span>
            </button>

            <button
              onClick={() => { setTheme('system'); handleSavePreferences(); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'system'
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold shadow-lg'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <Monitor className="w-5 h-5 text-indigo-400" />
              <span className="text-xs">System Auto</span>
            </button>
          </div>
        </div>

        {/* Section 2: Real-time Notifications */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Bell className="w-4 h-4" />
            <h3>Notification Preferences</h3>
          </div>

          <div className="space-y-3 divide-y divide-gray-800/60">
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5 min-w-0 pr-4">
                <div className="text-xs font-semibold text-white">Project Application Notifications</div>
                <div className="text-[11px] text-gray-400">Receive alerts when someone applies to your project or responds to your request</div>
              </div>
              <input
                type="checkbox"
                checked={notifApplications}
                onChange={(e) => { setNotifApplications(e.target.checked); handleSavePreferences(); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="space-y-0.5 min-w-0 pr-4">
                <div className="text-xs font-semibold text-white">Chat & Direct Messages</div>
                <div className="text-[11px] text-gray-400">Get notified when a teammate sends direct or project group messages</div>
              </div>
              <input
                type="checkbox"
                checked={notifChat}
                onChange={(e) => { setNotifChat(e.target.checked); handleSavePreferences(); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="space-y-0.5 min-w-0 pr-4">
                <div className="text-xs font-semibold text-white">Grok AI Teammate Recommendations</div>
                <div className="text-[11px] text-gray-400">Receive smart matching alerts when high-compatibility candidates are found</div>
              </div>
              <input
                type="checkbox"
                checked={notifMatches}
                onChange={(e) => { setNotifMatches(e.target.checked); handleSavePreferences(); }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Grok AI Matching Sensitivity */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <h3>Grok AI Matching Sensitivity</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-300 block">Minimum Match Compatibility Threshold</label>
            <select
              value={matchThreshold}
              onChange={(e) => { setMatchThreshold(e.target.value); handleSavePreferences(); }}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500"
            >
              <option value="50">50%+ (Broad Matches)</option>
              <option value="70">70%+ (High Quality Matches - Recommended)</option>
              <option value="85">85%+ (Strict Skill Alignment Only)</option>
            </select>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Filters candidate recommendations and project matches using Grok AI scoring metrics.
            </p>
          </div>
        </div>

        {/* Section 4: Privacy & Account Links */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <h3>Privacy & Support Links</h3>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              to="/profile"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 text-xs text-gray-200 transition-colors"
            >
              <span className="font-semibold">Edit Candidate Profile & Skills</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>

            <Link
              to="/help"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 text-xs text-gray-200 transition-colors"
            >
              <span className="font-semibold flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Help & Support Center</span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>

        {/* Danger Zone: Sign Out */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full p-3.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 rounded-2xl text-xs font-bold text-red-300 flex items-center justify-center space-x-2 transition-colors shadow-lg"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out of PartnerFinder</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
