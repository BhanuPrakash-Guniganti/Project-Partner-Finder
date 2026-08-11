import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import ExplainableMatchModal from '../components/matching/ExplainableMatchModal';
import { fetchProjectById, applyToProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Users, Clock, Calendar, CheckCircle2, 
  Send, UserCheck, ShieldAlert, ArrowLeft, Check 
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchProjectById(id);
      setProject(res.data);
      setTeam(res.data.team);
      if (res.data.requiredRoles && res.data.requiredRoles.length > 0) {
        setSelectedRole(res.data.requiredRoles[0].title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    try {
      await applyToProject(id, {
        requestedRole: selectedRole,
        message
      });
      setAppliedSuccess(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        setAppliedSuccess(false);
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20">Project not found</div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && project.ownerId && project.ownerId._id === user._id;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Back Link */}
        <Link to="/projects" className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        {/* Header Hero */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {project.type || 'Side Project'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {project.category || 'Web Development'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Status: {project.status || 'Open'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{project.title}</h1>
            </div>

            {/* Application / Workspace Action Button */}
            {!isOwner ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="gradient-btn px-6 py-3 rounded-xl font-bold text-white text-xs shadow-xl flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Apply to Join Team</span>
              </button>
            ) : (
              <Link
                to={`/workspace/${project._id}`}
                className="gradient-btn px-6 py-3 rounded-xl font-bold text-white text-xs shadow-xl flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Open Project Workspace</span>
              </Link>
            )}
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-800 text-xs text-gray-300">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Team Size</span>
              <span className="font-semibold text-white">{project.teamSize || 4} Members</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Availability</span>
              <span className="font-semibold text-white">{project.availability || '10-15 hrs/wk'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Estimated Duration</span>
              <span className="font-semibold text-white">{project.duration || '1-3 months'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Created By</span>
              <span className="font-semibold text-cyan-300">{project.ownerId?.name || 'Owner'}</span>
            </div>
          </div>
        </div>

        {/* Project Description & Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white">Project Overview</h3>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>

            {/* Dynamic Roles */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>Open Roles & Technical Requirements</span>
              </h3>

              <div className="space-y-3">
                {project.requiredRoles?.map((role, idx) => (
                  <div key={idx} className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-cyan-300 text-sm">{role.title}</span>
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[11px] font-semibold">{role.count} position</span>
                    </div>
                    {role.skills && role.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {role.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-gray-800 text-gray-300 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Required Skills Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">All Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills?.map(s => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Team Members */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Formed Team ({team?.members?.length || 1})</h3>
              <div className="space-y-3">
                {team?.members?.map(m => (
                  <div key={m.userId?._id || m._id} className="flex items-center space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-cyan-800/40 text-cyan-300 flex items-center justify-center font-bold">
                      {m.userId?.avatar ? (
                        <img src={m.userId.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        m.userId?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white">{m.userId?.name || 'Team Member'}</div>
                      <div className="text-gray-400 text-[11px]">{m.role} {m.isOwner && '(Lead)'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Apply Modal */}
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700 p-6 space-y-4 shadow-2xl relative">
              <h3 className="text-lg font-bold text-white">Apply to {project.title}</h3>

              {applyError && (
                <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-lg">
                  {applyError}
                </div>
              )}

              {appliedSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-emerald-300">Application Submitted!</div>
                  <p className="text-xs text-gray-400">The project owner will review your application.</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Select Requested Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {project.requiredRoles?.map(r => (
                        <option key={r.title} value={r.title}>{r.title}</option>
                      ))}
                      <option value="Team Member">General Team Member</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Application Pitch / Note</label>
                    <textarea
                      rows="3"
                      placeholder="Why are you interested in this project? Share your relevant experience..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyModalOpen(false)}
                      className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-lg shadow-lg"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
