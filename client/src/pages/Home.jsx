import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { 
  Sparkles, Users, Briefcase, FileText, CheckCircle2, 
  ArrowRight, Target, ShieldCheck, Zap, Bot
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>AI-Powered Skill Matching & Resume Analysis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans max-w-4xl mx-auto leading-tight">
            Find the Perfect Teammates for Your <span className="gradient-text">Dream Project</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Project Partner Finder connects student developers, designers, and creators based on skill proficiency, availability, and explainable compatibility scores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="gradient-btn px-8 py-3.5 rounded-xl font-bold text-white shadow-xl flex items-center space-x-2 text-base"
            >
              <span>Join as Student</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/projects"
              className="glass-panel px-8 py-3.5 rounded-xl font-bold text-gray-200 hover:text-white border border-gray-700 hover:border-cyan-500/50 transition-colors text-base"
            >
              Explore Open Projects
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
            <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-black text-cyan-400">45%</div>
              <div className="text-xs text-gray-400 font-medium">Weighted Skill Score</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-black text-indigo-400">100%</div>
              <div className="text-xs text-gray-400 font-medium">Explainable Transparency</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-black text-purple-400">Grok AI</div>
              <div className="text-xs text-gray-400 font-medium">PDF Resume Analyzer</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-black text-emerald-400">Real-time</div>
              <div className="text-xs text-gray-400 font-medium">Socket.IO Workspace Chat</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-[#070a12] border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Project-First Collaboration Platform</h2>
            <p className="text-sm text-gray-400">Built specifically for student developers, hackathon teams, and open source creators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Project-First Matching Engine</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Deterministic 5-factor weighted formula evaluating skills (45%), roles (20%), interests (15%), availability (10%), and experience (10%).
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Grok AI Resume Analyzer</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload your PDF resume to receive structured quality scores, ATS keyword optimization, actionable bullet rewriting, and instant profile skill sync.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Integrated Project Workspace</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Manage your formed team with Kanban task boards, milestone tracking, resource bookmarks, and real-time Socket.IO chat rooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
