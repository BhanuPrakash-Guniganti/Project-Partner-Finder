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
  Users, UserCheck, Briefcase, ChevronRight, MessageSquare, 
  BookOpen, FileText, UserPlus, TrendingUp, Lightbulb, Star 
} from 'lucide-react';

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

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
        setRecommendedTeammates([
          { 
            _id: 'u1', 
            name: 'Rahul', 
            role: 'Full Stack Lead', 
            skills: ['React', 'Node.js', 'MongoDB'], 
            matchScore: 92, 
            college: 'Stanford University',
            insight: 'Recommended because you both know React and Node.js and are interested in AI projects.'
          },
          { 
            _id: 'u2', 
            name: 'Priya', 
            role: 'UI/UX Designer', 
            skills: ['Figma', 'UI Design', 'React'], 
            matchScore: 87, 
            college: 'MIT',
            insight: "Recommended because Priya's UI/UX expertise complements your Full-Stack Web Development background."
          },
          { 
            _id: 'u3', 
            name: 'Bhanu', 
            role: 'Backend Engineer', 
            skills: ['Python', 'Express', 'MongoDB'], 
            matchScore: 79, 
            college: 'UC Berkeley',
            insight: 'Recommended because Bhanu specializes in database optimization for high-scale student apps.'
          }
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

  const recommendedSkillsList = [
    {
      skill: 'TypeScript',
      category: 'Frontend & Full-Stack',
      demand: '+24% Match Boost',
      insight: 'Learning TypeScript will increase your project eligibility score by 24% for full-stack listings on PartnerFinder.'
    },
    {
      skill: 'Docker & Containers',
      category: 'DevOps & Backend',
      demand: 'High Demand',
      insight: 'Adding Docker will enable you to lead devops configurations on backend student projects.'
    },
    {
      skill: 'Next.js 14',
      category: 'Full-Stack Web',
      demand: 'Popular Framework',
      insight: 'Next.js is currently required by 65% of top web development teams on the platform.'
    }
  ];

  const resumeImprovementsList = [
    {
      title: 'Quantify Project Impact',
      insight: 'Recommended because resumes with metric-driven bullet points get 40% higher response rates from project leads.'
    },
    {
      title: 'Add Live Deployment Links',
      insight: 'Recommended because 88% of project leads inspect live preview links before inviting members.'
    }
  ];

  const potentialCollaboratorsList = [
    {
      name: 'Alex Rivera',
      role: 'Frontend Specialist',
      college: 'Stanford University',
      insight: 'Recommended because you are both from Stanford University and share 4 mutual technical skills.'
    },
    {
      name: 'Devon Carter',
      role: 'AI / ML Researcher',
      college: 'MIT',
      insight: 'Recommended because Devon is actively looking for Full-Stack developers to integrate Grok AI models.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8 flex-1 min-w-0">
        
        {/* HEADER HERO */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-3 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Intelligence Recommendations</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Recommended For You
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Personalized recommendations based on your skills, interests and activity.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="card" />
        ) : (
          <div className="space-y-8">

            {/* SECTION 1: RECOMMENDED TEAMMATES */}
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Recommended Teammates</span>
                </h2>
                <span className="text-xs text-gray-400">Ranked by skill synergy</span>
              </div>

              <div className="space-y-3">
                {recommendedTeammates.map((candidate, idx) => (
                  <div
                    key={candidate._id || idx}
                    className="glass-panel p-5 rounded-3xl border border-gray-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-lg"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                          {candidate.name?.charAt(0) || 'C'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-base truncate">{candidate.name}</h3>
                            <span className="px-2 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                              {candidate.matchScore || 90}% Match
                            </span>
                          </div>
                          <p className="text-xs text-cyan-400">{candidate.role || 'Developer'} • {candidate.college || 'University'}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI INSIGHT RATIONALE BADGE */}
                    <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 leading-relaxed flex items-start space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>AI Insight</span>
                      </span>
                      <p className="italic">
                        "{candidate.insight || 'Recommended because you both know React and Node.js and are interested in AI projects.'}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate('/chat', { state: { recipient: { _id: candidate._id, name: candidate.name } } })}
                        className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>

                      <button
                        onClick={() => navigate(`/candidates/${candidate._id}`)}
                        className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: RECOMMENDED PROJECTS */}
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <span>Recommended Projects</span>
                </h2>
                <span className="text-xs text-gray-400">Matched to your stack</span>
              </div>

              <div className="space-y-3">
                {recommendedProjects.map((project, idx) => (
                  <div
                    key={project._id || idx}
                    className="glass-panel p-5 rounded-3xl border border-gray-800 hover:border-indigo-500/40 transition-all space-y-3 shadow-lg"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono font-bold text-[10px]">
                            {project.matchPercentage || 85}% Match
                          </span>
                          <h3 className="font-bold text-white text-base truncate">{project.title}</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                      </div>
                    </div>

                    {/* Skills Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {(project.requiredSkills?.length > 0 ? project.requiredSkills : ['React', 'Node.js', 'MongoDB']).map(skill => (
                        <span key={skill} className="px-2.5 py-0.5 rounded-lg bg-gray-900 text-cyan-300 text-xs font-semibold border border-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* AI INSIGHT RATIONALE BADGE */}
                    <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 leading-relaxed flex items-start space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>AI Insight</span>
                      </span>
                      <p className="italic">
                        "Recommended because your React, Node.js & MongoDB stack covers 85% of their core tech requirements."
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleJoinProject(project._id)}
                        className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Join Project</span>
                      </button>

                      <button
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: SKILLS YOU SHOULD LEARN */}
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Skills You Should Learn</span>
                </h2>
                <span className="text-xs text-gray-400">High platform demand</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendedSkillsList.map((item, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-2 shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{item.skill}</span>
                      <span className="px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold">
                        {item.demand}
                      </span>
                    </div>

                    {/* AI INSIGHT */}
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-200 leading-relaxed space-y-1">
                      <span className="font-bold text-amber-300 flex items-center space-x-1 text-[10px] uppercase">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>AI Insight</span>
                      </span>
                      <p>{item.insight}</p>
                    </div>

                    <button
                      onClick={() => showSuccess(`${item.skill} added to your learning wishlist!`)}
                      className="w-full py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-[11px] font-semibold text-gray-300 hover:text-white"
                    >
                      + Add to Wishlist
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: RESUME IMPROVEMENTS */}
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Resume Improvements</span>
                </h2>
                <span className="text-xs text-gray-400">AI ATS Optimization</span>
              </div>

              <div className="space-y-3">
                {resumeImprovementsList.map((item, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-2 shadow-md">
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>

                    {/* AI INSIGHT */}
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200 leading-relaxed flex items-start space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase flex items-center space-x-1 flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>AI Insight</span>
                      </span>
                      <p className="italic">"{item.insight}"</p>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => navigate('/resume-analyzer')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 font-bold text-white text-xs shadow-lg flex items-center justify-center space-x-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Optimize in Resume Analyzer</span>
                </button>
              </div>
            </div>

            {/* SECTION 5: POTENTIAL COLLABORATORS */}
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  <span>Potential Collaborators</span>
                </h2>
                <span className="text-xs text-gray-400">Academic & Project Overlap</span>
              </div>

              <div className="space-y-3">
                {potentialCollaboratorsList.map((collab, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3 shadow-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white text-sm">{collab.name}</h3>
                        <p className="text-xs text-purple-400">{collab.role} • {collab.college}</p>
                      </div>

                      <button
                        onClick={() => navigate('/chat', { state: { recipient: { _id: `collab-${idx}`, name: collab.name } } })}
                        className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800 text-xs font-semibold text-purple-300 hover:text-white"
                      >
                        Direct Message
                      </button>
                    </div>

                    {/* AI INSIGHT */}
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200 leading-relaxed flex items-start space-x-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase flex items-center space-x-1 flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>AI Insight</span>
                      </span>
                      <p className="italic">"{collab.insight}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Recommendations;
