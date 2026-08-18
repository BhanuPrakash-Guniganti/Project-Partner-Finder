import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { 
  fetchRecommendedProjects, searchCandidates, fetchMyProjects, fetchUserTeams 
} from '../services/api';
import { 
  Sparkles, Search, Users, PlusCircle, FileText, ArrowRight, 
  User, Briefcase, Clock, Tag, CheckCircle2, ChevronRight, FolderSearch 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [myProjects, setMyProjects] = useState({ created: [], joined: [] });
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recProjRes, candidatesRes, myProjRes, teamsRes] = await Promise.all([
        fetchRecommendedProjects(),
        searchCandidates({ limit: 6 }),
        fetchMyProjects(),
        fetchUserTeams()
      ]);

      setRecommendedProjects(recProjRes.data || []);
      setRecommendedCandidates(candidatesRes.data || []);
      setMyProjects(myProjRes.data || { created: [], joined: [] });
      setMyTeams(teamsRes.data || []);
    } catch (err) {
      console.error('[Dashboard Load Error]', err);
    } font: {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const allActiveProjects = [
    ...(myProjects.created || []),
    ...(myProjects.joined || [])
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      {/* Header with PartnerFinder Logo, Notifications & Profile */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-10 pb-[calc(7rem+env(safe-area-inset-bottom))] w-full space-y-5 sm:space-y-6 flex-1 min-w-0">
        
        {/* HERO SECTION */}
        <section className="glass-panel p-4 sm:p-6 rounded-3xl border border-gray-800 relative overflow-hidden shadow-xl">
          <div className="hidden sm:block absolute -right-12 -bottom-12 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="hidden sm:block absolute -left-12 -top-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project & Skill Matching Engine</span>
            </div>

            <div className="space-y-1 max-w-2xl">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Find the right people for your next project.
              </h1>
              <p className="text-xs text-gray-300 leading-relaxed">
                Discover teammates based on skills, interests and project requirements.
              </p>
            </div>

            {/* Prominent Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search developers, skills or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900/90 border border-gray-700/80 rounded-2xl pl-10 pr-24 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 shadow-lg"
                />
                <button
                  type="submit"
                  className="gradient-btn absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-2 max-w-xl">
              <Link
                to="/candidates"
                className="p-3 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-center transition-all group flex flex-col items-center justify-center space-y-1.5 shadow-md"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-gray-200 group-hover:text-white">Find Teammates</span>
              </Link>

              <Link
                to="/projects/new"
                className="p-3 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-center transition-all group flex flex-col items-center justify-center space-y-1.5 shadow-md"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-gray-200 group-hover:text-white">Create Project</span>
              </Link>

              <Link
                to="/resume-analyzer"
                className="p-3 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-center transition-all group flex flex-col items-center justify-center space-y-1.5 shadow-md"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-gray-200 group-hover:text-white">Resume Analyzer</span>
              </Link>
            </div>

          </div>
        </section>

        {/* SECTION 1: RECOMMENDED FOR YOU (Teammates / Candidates) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center min-w-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>Recommended Teammates For You</span>
              </h2>
              <p className="text-xs text-gray-400">Compatible candidates filtered by technical skill overlap</p>
            </div>
            <Link to="/candidates" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center space-x-1 flex-shrink-0">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={3} type="card" />
          ) : recommendedCandidates.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No teammate recommendations yet"
              description="Update your technical skills in your profile to generate AI match recommendations."
              actionText="Update Skills"
              onAction={() => navigate('/profile')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {recommendedCandidates.slice(0, 3).map((candidate) => {
                const matchScore = candidate.matchScore || Math.floor(Math.random() * 20) + 80;
                return (
                  <div key={candidate._id} className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 flex flex-col justify-between space-y-4 shadow-lg min-w-0">
                    <div className="space-y-3 min-w-0">
                      {/* Top Row: Photo, Name, Role & Match Score */}
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                            {candidate.avatar ? (
                              <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover" />
                            ) : (
                              candidate.name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm truncate">{candidate.name}</h3>
                            <p className="text-[11px] text-cyan-400 truncate">{candidate.preferredRoles?.[0] || 'Software Developer'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex-shrink-0">
                          {matchScore}% Match
                        </span>
                      </div>

                      {/* Meta specs */}
                      <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-indigo-400" />
                          <span>{candidate.experienceLevel || 'Intermediate'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          <span>{candidate.availability || '10-15 hrs/wk'}</span>
                        </span>
                      </div>

                      {/* Skill Chips */}
                      <div className="space-y-1 pt-1">
                        <div className="flex flex-wrap gap-1.5 min-w-0">
                          {candidate.skills?.slice(0, 3).map(s => (
                            <span key={s.name || s} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-800 text-gray-300 border border-gray-700/60 font-medium">
                              {s.name || s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/candidates/${candidate._id}`}
                      className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 hover:text-white text-center transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: RECOMMENDED PROJECTS */}
        <section className="space-y-4">
          <div className="flex justify-between items-center min-w-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>Recommended Projects</span>
              </h2>
              <p className="text-xs text-gray-400">Projects matching your profile skills and project interests</p>
            </div>
            <Link to="/projects" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center space-x-1 flex-shrink-0">
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={3} type="card" />
          ) : recommendedProjects.length === 0 ? (
            <EmptyState
              icon={FolderSearch}
              title="No project recommendations right now"
              description="Browse open projects or create your own project team."
              actionText="Explore Projects"
              onAction={() => navigate('/projects')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {recommendedProjects.slice(0, 3).map((project) => {
                const teamSize = project.teamSize || 4;
                const currentCount = project.currentMembersCount || 2;
                return (
                  <div key={project._id} className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 flex flex-col justify-between space-y-4 shadow-lg min-w-0">
                    <div className="space-y-3 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {project.category || 'Web Development'}
                        </span>
                        {project.matchScore !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {project.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">{project.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Team {currentCount}/{teamSize}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{project.availability || '10-15 hrs/wk'}</span>
                        </span>
                      </div>

                      {/* Required Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.requiredSkills?.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-800 text-gray-300 border border-gray-700/60 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/projects/${project._id}`}
                      className="gradient-btn w-full py-2 rounded-xl text-xs font-bold text-white text-center shadow-md flex items-center justify-center space-x-1"
                    >
                      <span>View Project Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: YOUR PROJECTS */}
        <section className="space-y-4">
          <div className="flex justify-between items-center min-w-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span>Your Projects & Workspaces</span>
              </h2>
              <p className="text-xs text-gray-400">Active project teams you own or have joined</p>
            </div>
            {allActiveProjects.length > 0 && (
              <Link to="/teams" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center space-x-1 flex-shrink-0">
                <span>View Teams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <SkeletonLoader count={2} type="list" />
          ) : allActiveProjects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="You haven't joined any projects yet"
              description="Create your first project or apply to join an existing team."
              actionText="Create Project"
              onAction={() => navigate('/projects/new')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {allActiveProjects.map((project) => (
                <div key={project._id} className="glass-card p-4 sm:p-5 rounded-2xl border border-gray-800 flex justify-between items-center gap-3 shadow-md min-w-0">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800 font-mono">
                      {project.ownerId === user?._id || project.ownerId?._id === user?._id ? 'Owner' : 'Member'}
                    </span>
                    <h3 className="font-bold text-white text-sm truncate">{project.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{project.category || 'Web Development'}</p>
                  </div>

                  <Link
                    to={`/workspace/${project._id}`}
                    className="gradient-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0 shadow-md flex items-center space-x-1"
                  >
                    <span>Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
