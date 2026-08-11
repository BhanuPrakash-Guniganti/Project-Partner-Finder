import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProjectCard from '../components/projects/ProjectCard';
import { fetchRecommendedProjects, fetchUserTeams, fetchMyProjects } from '../services/api';
import { 
  Sparkles, Briefcase, Users, FileText, PlusCircle, 
  ArrowRight, CheckCircle, ShieldCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [myProjects, setMyProjects] = useState({ created: [], joined: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [recRes, teamsRes, myProjRes] = await Promise.all([
        fetchRecommendedProjects(),
        fetchUserTeams(),
        fetchMyProjects()
      ]);
      setRecommendedProjects(recRes.data || []);
      setMyTeams(teamsRes.data || []);
      setMyProjects(myProjRes.data || { created: [], joined: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Partner Finder Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                Here are your top project recommendations, active team workspaces, and matching candidate profiles based on your skills.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects/new"
                className="gradient-btn px-4 py-2.5 rounded-xl font-semibold text-white text-xs shadow-lg flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Project</span>
              </Link>
              <Link
                to="/resume-analyzer"
                className="glass-panel px-4 py-2.5 rounded-xl font-semibold text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-500 text-xs flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Analyze Resume AI</span>
              </Link>
            </div>
          </div>

          {/* Quick Skill Tags */}
          <div className="pt-4 mt-6 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-semibold">Your Profile Skills:</span>
            {user?.skills?.map(s => (
              <span key={s.name} className="px-2.5 py-0.5 rounded-md bg-gray-900 text-cyan-300 font-medium border border-gray-800">
                {s.name} ({s.proficiency})
              </span>
            ))}
            <Link to="/profile" className="text-cyan-400 font-semibold hover:underline ml-2">Edit Profile →</Link>
          </div>
        </div>

        {/* My Active Teams & Workspaces */}
        {myTeams.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>My Active Team Workspaces</span>
              </h2>
              <Link to="/teams" className="text-xs text-cyan-400 font-semibold hover:underline">View All Teams</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map(team => (
                <div key={team._id} className="glass-card p-5 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{team.projectId?.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{team.members?.length} Members • Status: {team.status}</p>
                  </div>
                  <Link
                    to={`/workspace/${team.projectId?._id}`}
                    className="gradient-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
                  >
                    <span>Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Projects Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Recommended Projects for You</span>
              </h2>
              <p className="text-xs text-gray-400">Calculated using our 5-factor explainable matching engine</p>
            </div>
            <Link to="/projects" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center space-x-1">
              <span>Browse All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : recommendedProjects.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-gray-400 text-xs">
              No matching projects found right now. Try updating your profile skills!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProjects.slice(0, 6).map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
