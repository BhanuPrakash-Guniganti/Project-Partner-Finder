import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import ExplainableMatchModal from '../components/matching/ExplainableMatchModal';
import { fetchProjectById, applyToProject, fetchProjectApplications, respondApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Users, Clock, Calendar, CheckCircle2, 
  Send, UserCheck, ShieldAlert, ArrowLeft, Check, X, User, MessageSquare
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [incomingApplications, setIncomingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [id, user]);

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchProjectById(id);
      setProject(res.data);
      setTeam(res.data.team);
      if (res.data.requiredRoles && res.data.requiredRoles.length > 0) {
        setSelectedRole(res.data.requiredRoles[0].title);
      }

      const ownerId = res.data.ownerId?._id || res.data.ownerId;
      if (user && ownerId === user._id) {
        try {
          const appsRes = await fetchProjectApplications(id);
          setIncomingApplications(appsRes.data || []);
        } catch (appErr) {
          console.error('Failed to load project applications:', appErr);
        }
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

  const handleRespondApplication = async (appId, status) => {
    try {
      await respondApplication(appId, status);
      await loadProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
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

  const ownerId = project.ownerId?._id || project.ownerId;
  const isOwner = user && ownerId === user._id;

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

        {/* INCOMING APPLICATIONS SECTION FOR PROJECT OWNER */}
        {isOwner && (
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span>Incoming Join Requests & Applications ({incomingApplications.length})</span>
                </h3>
                <p className="text-xs text-gray-400">Review candidates who applied to join your project team</p>
              </div>
            </div>

            {incomingApplications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-800 rounded-xl">
                No active applications received yet for this project.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingApplications.map(app => (
                  <div key={app._id} className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-800/30 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/30">
                          {app.applicantId?.avatar ? (
                            <img src={app.applicantId.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            app.applicantId?.name?.charAt(0) || 'A'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{app.applicantId?.name || 'Applicant'}</div>
                          <div className="text-xs text-cyan-400">Requested Role: <span className="font-semibold">{app.requestedRole}</span></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {app.matchScore && <MatchScoreBadge score={app.matchScore} />}
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          app.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          app.status === 'Rejected' ? 'bg-red-500/20 text-red-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {app.message && (
                      <p className="text-xs text-gray-300 bg-gray-950 p-2.5 rounded-lg border border-gray-800 italic">
                        "{app.message}"
                      </p>
                    )}

                    {/* Applicant Skills */}
                    {app.applicantId?.skills && app.applicantId.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {app.applicantId.skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-cyan-300 font-medium">
                            {s.name || s} ({s.proficiency || 'Intermediate'})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {app.status === 'Pending' && (
                      <div className="pt-2 border-t border-gray-800 flex justify-end space-x-2">
                        <button
                          onClick={() => handleRespondApplication(app._id, 'Rejected')}
                          className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 rounded-lg flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5 text-red-400" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={() => handleRespondApplication(app._id, 'Accepted')}
                          className="gradient-btn px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center space-x-1 shadow-lg"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Add to Team</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                    <label className="text-xs font-semibold text-gray-300">Select Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {project.requiredRoles?.map((r, idx) => (
                        <option key={idx} value={r.title}>{r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Note to Project Owner (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Introduce yourself or highlight why you'd be a great fit for this role..."
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
                      className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-lg flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
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
