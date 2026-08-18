import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { fetchUserTeams, updateTeamMember, inviteCandidate, searchCandidates } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, ArrowRight, ShieldCheck, MessageSquare, User, UserPlus, 
  UserMinus, Edit3, Sparkles, Check, X, Code2, SlidersHorizontal, CheckCircle2 
} from 'lucide-react';

const Teams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [roleModalMember, setRoleModalMember] = useState(null);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [removeModalMember, setRemoveModalMember] = useState(null);

  // Invite Candidate state inside Team screen
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateResults, setCandidateResults] = useState([]);
  const [invitingCandidateId, setInvitingCandidateId] = useState(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await fetchUserTeams();
      const userTeams = res.data || [];
      setTeams(userTeams);
      if (userTeams.length > 0) {
        setSelectedTeamId(userTeams[0]._id);
      }
    } catch (err) {
      console.error('[Teams Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const activeTeam = teams.find(t => t._id === selectedTeamId) || teams[0];
  const project = activeTeam?.projectId || {};
  const isOwner = user && (project.ownerId === user._id || project.ownerId?._id === user._id);

  // Calculate unique skills across team members
  const allTeamSkills = Array.from(new Set(
    activeTeam?.members?.flatMap(m => m.userId?.skills?.map(s => s.name || s) || []) || ['React', 'Node.js', 'MongoDB', 'Python', 'Tailwind', 'Express.js', 'Figma', 'TypeScript']
  ));

  const projectProgress = project.progress !== undefined ? project.progress : 72;

  const handleOpenAssignRole = (member) => {
    setRoleModalMember(member);
    setNewRoleInput(member.role || 'Developer');
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleModalMember || !newRoleInput.trim()) return;

    try {
      await updateTeamMember(project._id, {
        memberId: roleModalMember.userId?._id || roleModalMember.userId,
        role: newRoleInput.trim()
      });
      showSuccess(`Role updated to "${newRoleInput}"!`);
      setRoleModalMember(null);
      loadTeams();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!removeModalMember) return;

    try {
      await updateTeamMember(project._id, {
        memberId: removeModalMember.userId?._id || removeModalMember.userId,
        action: 'remove'
      });
      showSuccess(`Member removed from team.`);
      setRemoveModalMember(null);
      loadTeams();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleSearchCandidatesForInvite = async (q) => {
    setCandidateSearch(q);
    if (!q.trim()) return;
    try {
      const res = await searchCandidates({ search: q });
      setCandidateResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async (candidate) => {
    setInvitingCandidateId(candidate._id);
    try {
      await inviteCandidate({
        projectId: project._id,
        candidateId: candidate._id,
        role: 'Team Member',
        message: `Join our team workspace for ${project.title}!`
      });
      showSuccess(`Invitation sent to ${candidate.name}!`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send invite.');
    } finally {
      setInvitingCandidateId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* Header & Active Team Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4 min-w-0">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
              <Users className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <span>Project Team</span>
            </h1>
            <p className="text-xs text-gray-400">Collaborate with team members, assign roles, and monitor progress</p>
          </div>

          {/* Project Team Selector */}
          {teams.length > 1 && (
            <div className="flex items-center space-x-2 bg-gray-900 px-3.5 py-2 rounded-2xl border border-gray-800 text-xs w-full sm:w-auto">
              <span className="text-gray-400 font-semibold flex-shrink-0">Select Team:</span>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer text-xs truncate max-w-[200px]"
              >
                {teams.map(t => (
                  <option key={t._id} value={t._id} className="bg-gray-900 text-white">
                    {t.projectId?.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="gradient-btn px-4 py-2.5 rounded-2xl font-bold text-white text-xs shadow-lg flex items-center space-x-1.5 flex-shrink-0 transition-transform hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Invite Member</span>
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="card" />
        ) : teams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="You haven't joined any project teams yet"
            description="Apply for open projects or create your own project team to collaborate."
            actionText="Explore Open Projects"
            onAction={() => navigate('/projects')}
          />
        ) : (
          <div className="space-y-6">

            {/* TEAM STATISTICS BAR */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1 shadow-md">
                <div className="text-xl sm:text-2xl font-extrabold text-cyan-400">
                  {activeTeam.members?.length || 1} Members
                </div>
                <div className="text-[11px] font-semibold text-gray-400">Active Team Size</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1 shadow-md">
                <div className="text-xl sm:text-2xl font-extrabold text-indigo-400">
                  {allTeamSkills.length} Skills
                </div>
                <div className="text-[11px] font-semibold text-gray-400">Combined Tech Stack</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1 shadow-md">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                  {projectProgress}%
                </div>
                <div className="text-[11px] font-semibold text-gray-400">Project Progress</div>
              </div>
            </div>

            {/* Project Overview Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Active Workspace</span>
                <h2 className="text-lg font-bold text-white">{project.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{project.category || 'Web Development'} • Status: {activeTeam.status}</p>
              </div>

              <Link
                to={`/workspace/${project._id}`}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 shadow-md flex-shrink-0"
              >
                <span>Enter Team Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* TEAM MEMBERS SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Team Members ({activeTeam.members?.length || 0})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {activeTeam.members?.map((member, idx) => {
                  const memberUser = member.userId || {};
                  const isMemberOwner = member.isOwner || (project.ownerId === memberUser._id || project.ownerId?._id === memberUser._id);
                  const isOnline = idx % 2 === 0; // Simulated active online state for demonstration
                  const memberSkills = memberUser.skills?.map(s => s.name || s) || ['React', 'Node.js'];

                  return (
                    <div key={memberUser._id || idx} className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between space-y-4 shadow-xl min-w-0">
                      <div className="space-y-3 min-w-0">
                        
                        {/* Member Header Row */}
                        <div className="flex justify-between items-start gap-2 min-w-0">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            
                            {/* Avatar with Online Status Indicator */}
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-base shadow-md overflow-hidden">
                                {memberUser.avatar ? (
                                  <img src={memberUser.avatar} alt={memberUser.name} className="w-full h-full object-cover" />
                                ) : (
                                  memberUser.name?.charAt(0)?.toUpperCase() || 'M'
                                )}
                              </div>
                              <span
                                className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 shadow-sm ${
                                  isOnline ? 'bg-emerald-500' : 'bg-gray-500'
                                }`}
                                title={isOnline ? 'Online' : 'Offline'}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-2 truncate">
                                <h4 className="font-bold text-white text-sm truncate">{memberUser.name || 'Developer'}</h4>
                                {isMemberOwner && (
                                  <span className="px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold flex items-center space-x-1 flex-shrink-0">
                                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                                    <span>Admin</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-cyan-400 font-semibold truncate">
                                {member.role || (isMemberOwner ? 'Team Lead' : 'Software Developer')}
                              </p>

                              <div className="text-[10px] font-medium text-gray-400 mt-0.5">
                                Status: <span className={isOnline ? 'text-emerald-400 font-semibold' : 'text-gray-500'}>
                                  {isOnline ? '● Online' : '○ Offline'}
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Member Skill Chips */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Skills</span>
                          <div className="flex flex-wrap gap-1.5 min-w-0">
                            {memberSkills.slice(0, 4).map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-800 text-gray-300 font-medium border border-gray-700/60">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate('/chat', { state: { recipient: memberUser } })}
                            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 hover:text-white flex items-center space-x-1 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Message</span>
                          </button>

                          {memberUser._id && (
                            <Link
                              to={`/candidates/${memberUser._id}`}
                              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white flex items-center space-x-1 transition-colors"
                            >
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span>View Profile</span>
                            </Link>
                          )}
                        </div>

                        {/* Owner / Admin Exclusive Actions */}
                        {isOwner && memberUser._id !== user._id && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleOpenAssignRole(member)}
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-cyan-300 border border-gray-700"
                              title="Assign Role"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRemoveModalMember(member)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60"
                              title="Remove Member"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ASSIGN ROLE MODAL */}
        {roleModalMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Assign Role to {roleModalMember.userId?.name}</h3>
                <button onClick={() => setRoleModalMember(null)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Frontend Dev / UI Designer"
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRoleModalMember(null)}
                    className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md"
                  >
                    Save Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* INVITE MEMBER MODAL */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Invite Teammate to {project.title}</h3>
                <button onClick={() => setInviteModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search candidate by name or skill..."
                  value={candidateSearch}
                  onChange={(e) => handleSearchCandidatesForInvite(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {candidateResults.map(cand => (
                    <div key={cand._id} className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{cand.name}</div>
                        <div className="text-[11px] text-cyan-400">{cand.preferredRoles?.[0] || 'Developer'}</div>
                      </div>
                      <button
                        onClick={() => handleSendInvite(cand)}
                        disabled={invitingCandidateId === cand._id}
                        className="gradient-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md disabled:opacity-50"
                      >
                        {invitingCandidateId === cand._id ? 'Sending...' : 'Invite'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REMOVE MEMBER CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={!!removeModalMember}
          onClose={() => setRemoveModalMember(null)}
          onConfirm={handleConfirmRemoveMember}
          title={`Remove ${removeModalMember?.userId?.name || 'Member'}?`}
          message="Are you sure you want to remove this member from the project team?"
          confirmText="Yes, Remove Member"
          confirmVariant="danger"
        />

      </main>

      <Footer />
    </div>
  );
};

export default Teams;
