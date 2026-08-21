import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
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

const PREDEFINED_CATEGORIES = [
  'Web Development', 'Artificial Intelligence', 'Mobile App', 
  'UI/UX Design', 'Blockchain', 'Cloud & DevOps', 
  'Data Science', 'Game Dev'
];

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
  const [editCategorySelect, setEditCategorySelect] = useState('Web Development');
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    teamSize: 4,
    category: '',
    type: 'Side Project',
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

      const projCat = res.data.category || 'Web Development';
      const isPredefinedCat = PREDEFINED_CATEGORIES.includes(projCat);
      setEditCategorySelect(isPredefinedCat ? projCat : 'Other');
      setEditCustomCategory(isPredefinedCat ? '' : projCat);

      setEditForm({
        title: res.data.title || '',
        description: res.data.description || '',
        teamSize: res.data.teamSize || 4,
        category: projCat,
        type: res.data.type || 'Side Project',
        status: res.data.status || 'Open'
      });

      if (res.data.requiredRoles && res.data.requiredRoles.length > 0) {
        setSelectedRole(res.data.requiredRoles[0].title);
      }

      const ownerId = res.data.ownerId?._id ? res.data.ownerId._id.toString() : res.data.ownerId?.toString();
      const currentUserId = user?._id ? user._id.toString() : user?.id?.toString();
      if (currentUserId && ownerId && currentUserId === ownerId) {
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
      setDeleteModalOpen(false);
      navigate('/projects');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (editCategorySelect === 'Other' && !editCustomCategory.trim()) {
      showError('Please enter a custom project category.');
      return;
    }
    const finalCategory = editCategorySelect === 'Other' ? editCustomCategory.trim() : editCategorySelect;

    setIsSavingEdit(true);
    try {
      const res = await updateProject(id, {
        ...editForm,
        category: finalCategory
      });
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

  const ownerId = project.ownerId?._id ? project.ownerId._id.toString() : project.ownerId?.toString();
  const currentUserId = user?._id ? user._id.toString() : user?.id?.toString();
  const isOwner = Boolean(currentUserId && ownerId && currentUserId === ownerId);
  const isTeamMember = team?.members?.some(m => {
    const memId = m.userId?._id ? m.userId._id.toString() : (m.userId ? m.userId.toString() : m.toString());
    return currentUserId && memId && currentUserId === memId;
  });

  const currentMemberCount = team?.members ? team.members.length : 0;
  const maxTeamSize = project.teamSize || 4;
  const openPositions = Math.max(0, maxTeamSize - currentMemberCount);
  const fillPct = maxTeamSize > 0 ? Math.round((currentMemberCount / maxTeamSize) * 100) : 0;
  const creatorParticipates = project.creator?.participation !== false;
  const creatorRoleTitle = project.creator?.role || 'Project Lead';

  const getRoleFillStatus = (roleTitle, roleCount = 1) => {
    if (!team?.members || team.members.length === 0) {
      return { filled: 0, required: roleCount, isFilled: false, open: roleCount, members: [] };
    }
    const clean = (roleTitle || '').toLowerCase().trim();
    const matching = team.members.filter(m => {
      const memRole = (m.role || '').toLowerCase().trim();
      return memRole && (memRole.includes(clean) || clean.includes(memRole));
    });
    const filled = matching.length;
    const isFilled = filled >= roleCount;
    const open = Math.max(0, roleCount - filled);
    return { filled, required: roleCount, isFilled, open, members: matching };
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36 sm:pb-24 md:pb-12 pb-[calc(8rem+env(safe-area-inset-bottom))] w-full space-y-6 flex-1 min-w-0">
        
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
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-2xl py-1.5 border border-gray-800 z-50 animate-fadeIn divide-y divide-gray-800/60">
                {isOwner ? (
                  <>
                    <div className="py-1">
                      <button
                        onClick={() => { setMoreMenuOpen(false); setEditModalOpen(true); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                      >
                        <Edit3 className="w-4 h-4 text-cyan-400" />
                        <span>Edit Project</span>
                      </button>
                      <button
                        onClick={() => { setMoreMenuOpen(false); setDeleteModalOpen(true); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 text-left"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>Delete Project</span>
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setMoreMenuOpen(false); handleShareProject(); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                      >
                        <Share2 className="w-4 h-4 text-cyan-400" />
                        <span>Share Project</span>
                      </button>
                      <button
                        onClick={() => { setMoreMenuOpen(false); handleCopyProjectLink(); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                      >
                        <Copy className="w-4 h-4 text-indigo-400" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-1">
                      <button
                        onClick={() => { setMoreMenuOpen(false); handleShareProject(); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                      >
                        <Share2 className="w-4 h-4 text-cyan-400" />
                        <span>Share Project</span>
                      </button>
                      <button
                        onClick={() => { setMoreMenuOpen(false); handleCopyProjectLink(); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                      >
                        <Copy className="w-4 h-4 text-indigo-400" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setMoreMenuOpen(false); showSuccess('Report submitted for review.'); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 text-left"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <span>Report Project</span>
                      </button>
                    </div>
                  </>
                )}
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
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{project.ownerId?.name || 'Project Owner'}</span>
                {creatorParticipates ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {creatorRoleTitle}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
                    Project Manager
                  </span>
                )}
              </div>
              <div className="text-[11px] text-cyan-400">
                {creatorParticipates 
                  ? `Project Creator & Active ${creatorRoleTitle}`
                  : 'Project Creator (Management Only)'
                }
              </div>
            </div>
          </div>

          {/* Team Capacity & Real Filling */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="flex justify-between items-center text-xs text-gray-300 font-semibold">
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>
                  <span className="text-white font-bold">{currentMemberCount} of {maxTeamSize}</span> positions filled
                  {openPositions > 0 ? (
                    <span className="text-[11px] text-gray-400 font-normal ml-1.5">({openPositions} open {openPositions > 1 ? 'slots' : 'slot'})</span>
                  ) : (
                    <span className="text-[11px] text-amber-300 font-bold ml-1.5">(Team Full)</span>
                  )}
                </span>
              </span>
              <span className="text-cyan-400 font-mono">{fillPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
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
            {project.projectGoals || project.goals?.length > 0 ? (
              (project.goals?.length > 0 
                ? project.goals 
                : project.projectGoals.split('\n').map(g => g.trim()).filter(Boolean)
              ).map((goal, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/80 text-xs text-gray-500">
                No specific milestones or deliverables specified for this project yet.
              </div>
            )}
          </div>
        </div>

        {/* TECH STACK & REQUIRED SKILLS */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tech Stack & Required Skills</h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {(project.requiredSkills?.length > 0 ? project.requiredSkills : ['React', 'Node.js', 'MongoDB', 'Express']).map(tech => (
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
              <span className="text-white font-semibold">
                {project.startDate 
                  ? new Date(project.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                  : (project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not specified')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Expected Completion</span>
              <span className="text-white font-semibold">
                {project.duration || (project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not specified')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Current Phase</span>
              <span className="text-cyan-300 font-semibold">{project.phase || project.status || 'Planning'}</span>
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS DISPLAY */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Project Team Members ({currentMemberCount} / {maxTeamSize})
            </h3>
            <Link to={`/workspace/${project._id}`} className="text-xs text-cyan-400 font-semibold hover:underline">
              View Team Workspace →
            </Link>
          </div>

          {team?.members && team.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.members.map((m) => (
                <div key={m.userId?._id || m._id} className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-full bg-cyan-700/40 text-cyan-300 flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                    {m.userId?.avatar ? (
                      <img src={m.userId.avatar} alt="Member" className="w-full h-full object-cover" />
                    ) : (
                      m.userId?.name?.charAt(0)?.toUpperCase() || 'M'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate flex items-center space-x-1.5">
                      <span>{m.userId?.name || 'Team Member'}</span>
                      {m.isOwner && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Creator
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-cyan-400 truncate">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 text-center space-y-1">
              <div className="text-xs text-gray-300 font-medium">No team members have joined yet.</div>
              <div className="text-[11px] text-gray-500">
                {creatorParticipates 
                  ? `Positions are open for the remaining team slots.`
                  : `Project is managed by ${project.ownerId?.name || 'the creator'}. All ${maxTeamSize} team member roles are open for application.`
                }
              </div>
            </div>
          )}
        </div>

        {/* REQUIRED ROLES STATUS (FILLED / OPEN) */}
        {project.requiredRoles && project.requiredRoles.length > 0 && (
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Team Roles & Recruitment Status</span>
              </h3>
              <span className="text-[11px] text-gray-400">
                {project.requiredRoles.filter(r => getRoleFillStatus(r.title, r.count).isFilled).length} of {project.requiredRoles.length} roles filled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {project.requiredRoles.map((role, idx) => {
                const status = getRoleFillStatus(role.title, role.count);
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 flex justify-between items-center text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span className="truncate">{role.title}</span>
                      </div>
                      {role.skills && role.skills.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                          Skills: {role.skills.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      {status.isFilled ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Filled ({status.filled}/{status.required})</span>
                        </span>
                      ) : status.filled > 0 ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                          {status.filled}/{status.required} Filled ({status.open} Open)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
                          {status.required} Open
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
          title="Delete Project?"
          message="This action cannot be undone. Are you sure you want to delete this project?"
          confirmText="Delete Project"
          confirmVariant="danger"
          loading={isDeleting}
        />

        {/* Edit Project Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto min-w-0">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Edit Project</span>
                </h3>
                <button onClick={() => setEditModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Project Category</label>
                    <select
                      value={editCategorySelect}
                      onChange={(e) => setEditCategorySelect(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {PREDEFINED_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {editCategorySelect === 'Other' && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-[11px] font-semibold text-gray-400">Custom Category Name *</label>
                      <input
                        type="text"
                        placeholder="Enter custom project category"
                        value={editCustomCategory}
                        onChange={(e) => setEditCustomCategory(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Project Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {['Side Project', 'Hackathon', 'Academic', 'Open Source', 'Research', 'Startup', 'Other'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {['Open', 'Team Forming', 'Team Complete', 'In Progress', 'Completed', 'Archived'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Max Team Size</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={editForm.teamSize}
                    onChange={(e) => setEditForm({ ...editForm, teamSize: parseInt(e.target.value, 10) || 4 })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Description *</label>
                  <textarea
                    rows="4"
                    required
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
