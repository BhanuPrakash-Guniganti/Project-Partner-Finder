import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import { 
  fetchProjectById, applyToProject, fetchProjectApplications, 
  respondApplication, deleteProject, updateProject 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  Briefcase, Users, Clock, Calendar, CheckCircle2, 
  Send, UserCheck, ArrowLeft, Check, X, User, MessageSquare, 
  ExternalLink, Loader2, AlertCircle, Trash2, Edit3, Share2, Copy, 
  ShieldAlert, MoreVertical, Layers, CheckSquare, Sparkles 
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [incomingApplications, setIncomingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Delete & Edit Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    teamSize: 4,
    category: '',
    type: '',
    status: 'Open'
  });

  useEffect(() => {
    loadProjectDetails();
  }, [id, user]);

  useEffect(() => {
    if (socket) {
      const handleNewApp = (newApp) => {
        const appProjId = typeof newApp.projectId === 'object' ? newApp.projectId?._id : newApp.projectId;
        if (appProjId === id) {
          setIncomingApplications(prev => {
            if (newApp._id && prev.some(a => a._id === newApp._id)) return prev;
            return [newApp, ...prev];
          });
        }
      };

      const handleStatusUpdate = (data) => {
        const { applicationId, status } = data;
        setIncomingApplications(prev => prev.map(app => 
          app._id === applicationId ? { ...app, status } : app
        ));
      };

      socket.on('new_application', handleNewApp);
      socket.on('application_status_updated', handleStatusUpdate);

      return () => {
        socket.off('new_application', handleNewApp);
        socket.off('application_status_updated', handleStatusUpdate);
      };
    }
  }, [socket, id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchProjectById(id);
      setProject(res.data);
      setTeam(res.data.team);
      setEditForm({
        title: res.data.title || '',
        description: res.data.description || '',
        teamSize: res.data.teamSize || 4,
        category: res.data.category || 'Web Development',
        type: res.data.type || 'Side Project',
        status: res.data.status || 'Open'
      });

      if (res.data.requiredRoles && res.data.requiredRoles.length > 0) {
        setSelectedRole(res.data.requiredRoles[0].title);
      }

      const ownerId = res.data.ownerId?._id || res.data.ownerId;
      if (user && ownerId === user._id) {
        setAppsLoading(true);
        try {
          const appsRes = await fetchProjectApplications(id);
          setIncomingApplications(appsRes.data || []);
        } catch (appErr) {
          console.error(appErr);
        } finally {
          setAppsLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProjectLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Project link copied to clipboard!');
    setMoreMenuOpen(false);
  };

  const handleShareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title || 'PartnerFinder Project',
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyProjectLink();
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
      showSuccess('Application submitted successfully!');
      setTimeout(() => {
        setApplyModalOpen(false);
        setAppliedSuccess(false);
      }, 1500);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  const handleRespondApplication = async (appId, status) => {
    try {
      await respondApplication(appId, status);
      setIncomingApplications(prev => prev.map(app => 
        app._id === appId ? { ...app, status } : app
      ));
      const res = await fetchProjectById(id);
      setProject(res.data);
      setTeam(res.data.team);
      showSuccess(`Application ${status.toLowerCase()}!`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      showSuccess('Project deleted successfully.');
      navigate('/projects');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const res = await updateProject(id, editForm);
      setProject(prev => ({ ...prev, ...res.data }));
      setEditModalOpen(false);
      showSuccess('Project details updated!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setIsSavingEdit(false);
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
        <div className="text-center py-20 text-xs text-gray-400">Project details not found</div>
        <Footer />
      </div>
    );
  }

  const ownerId = project.ownerId?._id || project.ownerId;
  const isOwner = user && ownerId === user._id;
  const isTeamMember = team?.members?.some(m => (m.userId?._id || m.userId || m) === user?._id);

  const currentMemberCount = team?.members?.length || 1;
  const maxTeamSize = project.teamSize || 4;
  const progressPct = project.progress !== undefined ? project.progress : 65;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* HEADER: Back Button, Truncated Title, More Options Menu */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 min-w-0">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold hover:underline flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {project.title}
          </h1>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 glass-panel rounded-xl shadow-2xl py-1.5 border border-gray-800 z-50 animate-fadeIn">
                <button
                  onClick={handleShareProject}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share Project</span>
                </button>
                <button
                  onClick={handleCopyProjectLink}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                >
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>Copy Link</span>
                </button>
                <div className="border-t border-gray-800/80 my-1" />
                <button
                  onClick={() => { setMoreMenuOpen(false); showSuccess('Report submitted for review.'); }}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 text-left"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Report Project</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HERO CARD */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {project.category || 'Web Development'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {project.type || 'Side Project'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                  {project.status || 'Recruiting'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{project.title}</h2>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          </div>

          {/* Project Owner Header */}
          <div className="flex items-center space-x-3 pt-2 border-t border-gray-800/80">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
              {project.ownerId?.avatar ? (
                <img src={project.ownerId.avatar} alt="Owner" className="w-full h-full object-cover" />
              ) : (
                project.ownerId?.name?.charAt(0)?.toUpperCase() || 'O'
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{project.ownerId?.name || 'Project Lead'}</div>
              <div className="text-[11px] text-cyan-400">Project Lead & Creator</div>
            </div>
          </div>

          {/* Team Capacity & Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="flex justify-between items-center text-xs text-gray-300 font-semibold">
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Current Team: <span className="text-white font-bold">{currentMemberCount} / {maxTeamSize}</span> Members</span>
              </span>
              <span className="text-cyan-400 font-mono">{progressPct}% Progress</span>
            </div>
            <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* ACTION BUTTONS BASED ON MEMBERSHIP STATE */}
          <div className="flex flex-wrap gap-2 pt-2">
            {isOwner || isTeamMember ? (
              <>
                <Link
                  to={`/workspace/${project._id}`}
                  className="gradient-btn px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg flex items-center space-x-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Open Team Workspace</span>
                </Link>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Open Team Chat</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="gradient-btn px-6 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Request to Join / Apply</span>
                </button>
                <button
                  onClick={() => navigate('/chat', { state: { recipient: project.ownerId } })}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-200 hover:text-white flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Message Owner</span>
                </button>
                <button
                  onClick={handleShareProject}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 flex items-center space-x-1.5"
                >
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Share</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* PROJECT GOALS CHECKLIST */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>Project Goals & Deliverables</span>
          </h3>
          <div className="space-y-2 pt-1 text-xs text-gray-300">
            {[
              'Design modular full-stack architecture & RESTful endpoints',
              'Implement Grok AI match score calculation engine',
              'Build real-time team collaboration chat with Socket.IO',
              'Deploy high-availability application on Render cloud backend'
            ].map((goal, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TECH STACK & REQUIRED SKILLS */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tech Stack & Required Skills</h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {(project.requiredSkills?.length > 0 ? project.requiredSkills : ['React', 'Node.js', 'MongoDB', 'Express', 'Python']).map(tech => (
              <span key={tech} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* PROJECT TIMELINE */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Project Timeline & Phases</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Start Date</span>
              <span className="text-white font-semibold">Aug 10, 2026</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Expected Completion</span>
              <span className="text-white font-semibold">{project.duration || '1-3 months'}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Current Phase</span>
              <span className="text-cyan-300 font-semibold">MVP Development</span>
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS DISPLAY */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Team Members</h3>
            <Link to={`/workspace/${project._id}`} className="text-xs text-cyan-400 font-semibold hover:underline">
              View Team Workspace →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team?.members?.map((m) => (
              <div key={m.userId?._id || m._id} className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 text-xs">
                <div className="w-9 h-9 rounded-full bg-cyan-700/40 text-cyan-300 flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                  {m.userId?.avatar ? (
                    <img src={m.userId.avatar} alt="Member" className="w-full h-full object-cover" />
                  ) : (
                    m.userId?.name?.charAt(0)?.toUpperCase() || 'M'
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{m.userId?.name || 'Team Developer'}</div>
                  <div className="text-[11px] text-cyan-400 truncate">{m.role} {m.isOwner && '(Lead)'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Modal */}
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Apply to Join {project.title}</h3>
                <button onClick={() => setApplyModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {appliedSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-emerald-300">Application Submitted!</div>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Select Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {project.requiredRoles?.map((r, idx) => (
                        <option key={idx} value={r.title}>{r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Note to Project Lead</label>
                    <textarea
                      rows="3"
                      placeholder="Introduce your skills and why you'd be a great teammate..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyModalOpen(false)}
                      className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md"
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
