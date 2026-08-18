import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Code2, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '../components/common/Footer';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      {/* Top Brand Bar */}
      <header className="px-4 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text block leading-tight">PartnerFinder</span>
            <span className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider block -mt-0.5">Project & Skill Matching</span>
          </div>
        </Link>
        <Link to="/login" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 transition-colors">
          Sign In
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col items-center justify-center text-center space-y-8 min-w-0">
        {/* Hero Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Developer & Teammate Discovery</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Build Better Projects with the <span className="gradient-text">Right Teammates</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
            Connect with students and developers based on skill compatibility, project interests, availability, and AI-powered match recommendations.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-2">
          <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Skill Compatibility</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">Match with developers whose technical proficiencies complement your project team.</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Grok AI Match</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">Analyze resumes and get smart candidate recommendations for your hackathons & side projects.</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Real-Time Team Chat</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">Collaborate seamlessly via group project workspaces and direct messaging.</p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-4">
          <Link
            to="/register"
            className="gradient-btn w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-xs text-white shadow-xl flex items-center justify-center space-x-2 transition-transform hover:scale-105"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3 rounded-2xl font-semibold text-xs text-gray-300 hover:text-white bg-gray-900 border border-gray-800 text-center transition-colors"
          >
            I Already Have an Account
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;
