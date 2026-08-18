import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { fetchRecommendedProjects, searchCandidates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, Bot, Check, AlertTriangle, ArrowRight, 
  Users, UserCheck, Briefcase, ChevronRight, MessageSquare 
} from 'lucide-react';

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'teammates'
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recommendedTeammates, setRecommendedTeammates] = useState([]);
  const [loading, setLoading] = useState(true);

  const userSkills = user?.skills || ['React', 'Node.js', 'MongoDB', 'Express'];

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const [projRes, candRes] = await Promise.all([
        fetchRecommendedProjects(),
        searchCandidates()
      ]);

      setRecommendedProjects(projRes.data || []);
      
      const loadedCandidates = candRes.data || [];
      if (loadedCandidates.length > 0) {
        setRecommendedTeammates(loadedCandidates);
      } else {
        // Fallback sample teammates matching requirements
        setRecommendedTeammates([
          { _id: 'u1', name: 'Rahul', role: 'Full Stack Lead', skills: ['React', 'Node.js', 'MongoDB'], matchScore: 92, college: 'Stanford' },
          { _id: 'u2', name: 'Priya', role: 'UI/UX Designer', skills: ['Figma', 'UI Design', 'React'], matchScore: 87, college: 'MIT' },
          { _id: 'u3', name: 'Bhanu', role: 'Backend Developer', skills: ['Python', 'Express', 'MongoDB'], matchScore: 79, college: 'UC Berkeley' }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = (projId) => {
    showSuccess('Join request submitted to project lead!');
    navigate(`/projects/${projId}`);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* HEADER HERO */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-3 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>xAI Grok Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Match
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Grok AI calculates skill compatibility between your profile, active projects, and potential teammates.
          </p>
        </div>

        {/* TABS: RECOMMENDED PROJECTS vs TEAMMATES */}
        <div className="flex p-1 rounded-2xl bg-gray-900/80 border border-gray-800 max-w-md mx-auto w-full">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'projects'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Project AI Matches
          </button>

          <button
            onClick={() => setActiveTab('teammates')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'teammates'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Teammate AI Matches
          </button>
        </div>

        {/* SECTION 1: PROJECT AI MATCHING */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            
            {/* FEATURED DETAILED AI MATCH CARD */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-gray-950/60 space-y-6 shadow-2xl relative overflow-hidden">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Top Featured Project Match</span>
                  <h2 className="text-xl font-extrabold text-white truncate">AI Resume Analyzer & Matcher</h2>
                  <p className="text-xs text-gray-400">Category: Web Development & AI</p>
                </div>

                {/* AI Match Score Gauge Badge */}
                <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/50 text-center flex-shrink-0 shadow-lg">
                  <span className="text-2xl font-black text-cyan-300 block leading-none">87%</span>
                  <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider">AI Match Score</span>
                </div>
              </div>

              {/* YOUR SKILLS vs PROJECT REQUIREMENTS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Your Skills */}
                <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {userSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 text-xs font-semibold border border-cyan-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Requirements */}
                <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Project Requirements</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Node.js', 'MongoDB', 'Python'].map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 text-xs font-semibold border border-indigo-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* SKILL COMPARISON BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Skill Compatibility Breakdown</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/40">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>✓ React matches</span>
                  </div>

                  <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/40">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>✓ Node.js matches</span>
                  </div>

                  <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/40">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>✓ MongoDB matches</span>
                  </div>

                  <div className="flex items-center space-x-2 text-amber-400 bg-amber-950/30 p-2 rounded-xl border border-amber-900/40">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>△ Python experience missing</span>
                  </div>
                </div>
              </div>

              {/* RECOMMENDED ROLE & AI RECOMMENDATION QUOTE */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-400">Recommended Role:</span>
                  <span className="px-3 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-bold">
                    Full Stack Developer
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 leading-relaxed italic space-y-1">
                  <span className="font-bold text-cyan-300 not-italic block flex items-center space-x-1.5">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>Grok AI Match Insight:</span>
                  </span>
                  <p>
                    "You are a strong match for this project because your React, Node.js and MongoDB experience matches most of the required stack."
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleJoinProject('proj-1')}
                  className="gradient-btn flex-1 py-3 rounded-2xl font-bold text-white text-xs shadow-xl flex items-center justify-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Join Project</span>
                </button>

                <button
                  onClick={() => navigate('/projects')}
                  className="py-3 px-6 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>View Project</span>
                </button>
              </div>

            </div>

            {/* LIST OF OTHER RECOMMENDED PROJECTS */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Other High AI Match Projects</span>
              </h3>

              <div className="space-y-3">
                {recommendedProjects.map(proj => (
                  <div
                    key={proj._id}
                    className="glass-panel p-4 sm:p-5 rounded-2xl border border-gray-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-extrabold text-[10px] border border-cyan-800 font-mono">
                          {proj.matchPercentage || 84}% Match
                        </span>
                        <h4 className="font-bold text-white text-sm truncate">{proj.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{proj.description}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/projects/${proj._id}`)}
                      className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-cyan-300 flex items-center space-x-1 flex-shrink-0"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: TEAMMATE AI MATCHING */}
        {activeTab === 'teammates' && (
          <div className="space-y-4">
            
            <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Compatible Teammate Matches</span>
              </h3>
              <span className="text-xs text-gray-400">Ranked by Grok AI skill synergy</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Rahul', role: 'Full Stack Lead', matchScore: 92, skills: ['React', 'Node.js', 'MongoDB'], exp: '3 yrs', college: 'Stanford' },
                { name: 'Priya', role: 'UI/UX Designer', matchScore: 87, skills: ['Figma', 'UI Design', 'React'], exp: '2 yrs', college: 'MIT' },
                { name: 'Bhanu', role: 'Backend Developer', matchScore: 79, skills: ['Python', 'Express', 'MongoDB'], exp: '1 yr', college: 'UC Berkeley' }
              ].map((candidate, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 rounded-2xl border border-gray-800 hover:border-purple-500/40 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-600 text-white font-extrabold flex items-center justify-center text-base shadow-md">
                        {candidate.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-base truncate">{candidate.name}</h4>
                          <span className="px-2 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                            {candidate.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-cyan-400">{candidate.role} • {candidate.college}</p>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex-shrink-0">
                      User {String.fromCharCode(65 + idx)}
                    </div>
                  </div>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-0.5 rounded-lg bg-gray-900 text-gray-300 text-xs font-medium border border-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Grok Explanation */}
                  <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                    <span className="font-semibold text-cyan-300">AI Compatibility:</span> High technical skill overlap in {candidate.skills.slice(0, 2).join(' and ')}. Excellent match for collaborative team projects.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigate('/chat', { state: { recipient: { _id: `cand-${idx}`, name: candidate.name } } })}
                      className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>

                    <button
                      onClick={() => navigate('/candidates')}
                      className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
                    >
                      View Profile
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Recommendations;
