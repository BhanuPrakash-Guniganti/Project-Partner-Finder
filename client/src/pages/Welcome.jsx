import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Code2, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '../components/common/Footer';
import AppLogo from '../components/common/AppLogo';
import AppIcon from '../components/common/AppIcon';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      {/* Top Brand Bar */}
      <header className="px-4 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <AppLogo size="md" />
        </Link>
        <Link to="/login" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 transition-colors">
          Sign In
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col items-center justify-center text-center space-y-8 min-w-0">
        {/* Hero Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <AppIcon size="xs" />
          <span>AI-Powered Developer & Teammate Discovery</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Build Better Projects with the <span className="gradient-text">Right Teammates</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Stop searching endlessly for project collaborators. PartnerFinder matches software engineering students, designers, and developers using Grok AI and skill compatibility.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-xs sm:max-w-none justify-center">
          <Link
            to="/register"
            className="gradient-btn px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-transform hover:scale-105"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-gray-200 bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center transition-colors"
          >
            I Already Have an Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-6">
          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Grok AI Matching</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Smart compatibility algorithms match skills, roles, and project requirements.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Team Workspaces</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Collaborate via real-time Socket.IO project group chats and direct messaging.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">AI Resume Analyzer</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Get AI feedback on your engineering resume to improve project & career readiness.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;
