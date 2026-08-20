import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ConfirmationModal from '../common/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, Briefcase, Users, FileText, Link as LinkIcon, Pin, 
  Search, ShieldCheck, UserPlus, Settings, LogOut, ExternalLink, 
  FolderArchive, Check, ArrowRight 
} from 'lucide-react';

const ProjectChatDetailsModal = ({ isOpen, onClose, project, team, onOpenInvite, onOpenEdit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'files' | 'pinned'

  if (!isOpen || !project) return null;

  const ownerId = project.ownerId?._id || project.ownerId;
  const isOwner = user && ownerId === user._id;

  const members = team?.members || [];

  const sharedFiles = [];

  const sharedLinks = [
    ...(project.githubUrl ? [{ label: 'GitHub Repository', url: project.githubUrl }] : []),
    ...(project.referenceUrl ? [{ label: 'Reference / Design Link', url: project.referenceUrl }] : [])
  ];

  const pinnedMessages = [];

  const handleConfirmLeave = () => {
    showSuccess(`You have left ${project.title}`);
    setLeaveModalOpen(false);
    onClose();
    navigate('/projects');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-800 p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto min-w-0">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-3 min-w-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-extrabold text-lg shadow-md flex-shrink-0">
              #
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate"># {project.title}</h2>
              <p className="text-xs text-cyan-400 font-semibold">{members.length} Members • Project Chat Details</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description</label>
          <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
            {project.description || 'Project group chat workspace for student developer collaboration.'}
          </p>
        </div>

        {/* Project Owner Banner */}
        <div className="flex items-center space-x-3 bg-gray-900/80 p-3 rounded-xl border border-gray-800">
          <div className="w-9 h-9 rounded-full bg-cyan-700/30 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/30 text-xs overflow-hidden flex-shrink-0">
            {project.ownerId?.avatar ? (
              <img src={project.ownerId.avatar} alt="Owner" className="w-full h-full object-cover" />
            ) : (
              project.ownerId?.name?.charAt(0)?.toUpperCase() || 'O'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>{project.ownerId?.name || 'Project Owner'}</span>
              <span className="px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[9px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Admin</span>
              </span>
            </div>
            <p className="text-[10px] text-cyan-400">Project Lead & Creator</p>
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Required Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {(project.requiredSkills?.length > 0 ? project.requiredSkills : ['React', 'Node.js', 'MongoDB', 'Python']).map(skill => (
              <span key={skill} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Team Members Count & Avatars List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Team Members ({members.length})</label>
            <Link to="/teams" onClick={onClose} className="text-cyan-400 font-semibold hover:underline text-[11px]">View Team Roster →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.map((m, idx) => {
              const memUser = m.userId || {};
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center space-x-2.5 text-xs">
                  <div className="w-8 h-8 rounded-full bg-cyan-800/30 text-cyan-300 font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                    {memUser.avatar ? (
                      <img src={memUser.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      memUser.name?.charAt(0)?.toUpperCase() || 'M'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">{memUser.name || 'Team Member'}</div>
                    <div className="text-[10px] text-cyan-400 truncate">{m.role || 'Developer'} {m.isOwner && '(Lead)'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABBED SHARED ASSETS & PINNED MESSAGES */}
        <div className="space-y-3 pt-2 border-t border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 bg-gray-900'
              }`}
            >
              Shared Links
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                activeTab === 'files' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 bg-gray-900'
              }`}
            >
              Files Shared ({sharedFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                activeTab === 'pinned' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 bg-gray-900'
              }`}
            >
              Pinned ({pinnedMessages.length})
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-2">
              {sharedLinks.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-900/40 rounded-xl border border-gray-800">
                  No shared project links added yet.
                </div>
              ) : (
                sharedLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 flex justify-between items-center text-xs hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <LinkIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="font-bold text-white truncate">{link.label}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  </a>
                ))
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-2">
              {sharedFiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-900/40 rounded-xl border border-gray-800">
                  No files shared in this workspace yet.
                </div>
              ) : (
                sharedFiles.map((file, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-white truncate">{file.name}</div>
                        <div className="text-[10px] text-gray-500">{file.size} • {file.date}</div>
                      </div>
                    </div>
                    <button onClick={() => showSuccess(`Downloading ${file.name}...`)} className="text-xs text-cyan-400 hover:underline">Download</button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'pinned' && (
            <div className="space-y-2">
              {pinnedMessages.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-900/40 rounded-xl border border-gray-800">
                  No pinned announcements yet.
                </div>
              ) : (
                pinnedMessages.map((pin, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400">{pin.author}</span>
                    <p className="text-gray-200">{pin.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* GENERAL ACTIONS */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={() => { onClose(); navigate(`/projects/${project._id}`); }}
            className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>View Project</span>
          </button>

          <button
            onClick={() => { onClose(); navigate('/teams'); }}
            className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>View Team</span>
          </button>
        </div>

        {/* ADMIN OPTIONS FOR PROJECT OWNER */}
        {isOwner && (
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Admin Control Options</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onClose(); onOpenInvite && onOpenInvite(); }}
                className="py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-xs font-semibold text-amber-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Invite Member</span>
              </button>

              <button
                onClick={() => { onClose(); onOpenEdit && onOpenEdit(); }}
                className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Project Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* DANGER ACTION: LEAVE PROJECT */}
        <div className="pt-2 border-t border-gray-800 flex justify-center">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-xs font-bold text-red-300 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Leave Project Team</span>
          </button>
        </div>

        {/* LEAVE PROJECT CONFIRMATION DIALOG */}
        <ConfirmationModal
          isOpen={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          onConfirm={handleConfirmLeave}
          title={`Leave ${project.title}?`}
          message="Are you sure you want to leave this project team workspace? You will lose access to team chat and task assignments."
          confirmText="Yes, Leave Project"
          confirmVariant="danger"
        />

      </div>
    </div>
  );
};

export default ProjectChatDetailsModal;
