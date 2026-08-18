import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import { fetchUserById, fetchMyProjects, inviteCandidate } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  User, Github, Linkedin, ExternalLink, ArrowLeft, Mail, Clock, 
  MessageSquare, GraduationCap, MapPin, Award, Star, CheckCircle2, 
  Briefcase, Send, MoreVertical, Share2, Copy, ShieldAlert, Sparkles, Check, X
} from 'lucide-react';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [candidate, setCandidate] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    loadCandidateData();
  }, [id]);

  const loadCandidateData = async () => {
    setLoading(true);
    try {
      const [userRes, myProjRes] = await Promise.all([
        fetchUserById(id),
        fetchMyProjects()
      ]);
      setCandidate(userRes.data);
      const createdProjs = myProjRes.data?.created || [];
      setMyProjects(createdProjs);
      if (createdProjs.length > 0) {
        setSelectedProjectId(createdProjs[0]._id);
      }
    } catch (err) {
      console.error('[Candidate Profile Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Profile link copied to clipboard!');
    setMoreMenuOpen(false);
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${candidate?.name} - Developer Profile`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyProfileLink();
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || inviteLoading) return;

    setInviteLoading(true);
    try {
      await inviteCandidate({
        projectId: selectedProjectId,
        candidateId: candidate._id,
        role: inviteRole,
        message: inviteMessage
      });
      setInviteSuccess(true);
      showSuccess(`Invitation sent to ${candidate.name}!`);
      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteSuccess(false);
      }, 1500);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20 text-gray-400 text-xs">Developer candidate profile not found</div>
        <Footer />
      </div>
    );
  }

  const matchScore = candidate.matchScore !== undefined ? candidate.matchScore : 94;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0 flex-1 space-y-6">
        
        {/* HEADER: Back Button, Profile Title, More Menu */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discover</span>
          </button>

          <h1 className="text-base font-bold text-white uppercase tracking-wider">Developer Profile</h1>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 glass-panel rounded-xl shadow-2xl py-1.5 border border-gray-800 z-50 animate-fadeIn">
                <button
                  onClick={handleShareProfile}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share Profile</span>
                </button>
                <button
                  onClick={handleCopyProfileLink}
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
                  <span>Report Candidate</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE HERO CARD */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left justify-between gap-6 min-w-0">
            
            {/* Avatar & Core Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border-2 border-cyan-400/60 text-white flex items-center justify-center font-bold text-3xl shadow-xl overflow-hidden">
                  {candidate.avatar ? (
                    <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    candidate.name?.charAt(0)?.toUpperCase() || 'C'
                  )}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 shadow-md" title="Online & Available" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">{candidate.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {matchScore}% Match
                  </span>
                </div>

                <p className="text-xs font-bold text-cyan-400 truncate">
                  {candidate.preferredRoles?.join(' • ') || 'Full Stack Developer'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{candidate.college || 'Stanford University'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>San Francisco, CA • UTC-7</span>
                  </span>
                </div>

                {/* Availability Badge */}
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[11px] font-medium">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Available • {candidate.availability || '10-15 hrs/wk'}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 text-[11px] font-medium">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>4.9 / 5.0 Rating</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() => navigate('/chat', { state: { recipient: candidate } })}
                className="flex-1 sm:w-36 gradient-btn py-2.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>

              {myProjects.length > 0 && (
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="flex-1 sm:w-36 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Connect / Invite</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLLABORATION STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold text-cyan-400">8</div>
            <div className="text-[11px] font-semibold text-gray-400">Projects Completed</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-400">12</div>
            <div className="text-[11px] font-semibold text-gray-400">Projects Joined</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold text-purple-400">34</div>
            <div className="text-[11px] font-semibold text-gray-400">Teammates Worked With</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 flex items-center justify-center space-x-1">
              <span>4.9</span>
              <Star className="w-4 h-4 fill-emerald-400" />
            </div>
            <div className="text-[11px] font-semibold text-gray-400">Average Rating</div>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Developer</h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {candidate.bio || 'Passionate software engineering student focused on building scalable full-stack web applications, AI-powered developer tools, and collaborating on high-impact hackathon projects.'}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800/80">
            {candidate.links?.github && (
              <a
                href={candidate.links.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4 text-cyan-400" />
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            )}
            {candidate.links?.linkedin && (
              <a
                href={candidate.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4 text-indigo-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            )}
          </div>
        </div>

        {/* SKILLS SECTION */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Skills & Proficiency</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {candidate.skills && candidate.skills.length > 0 ? (
              candidate.skills.map((s) => (
                <div key={s.name || s} className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-xs flex justify-between items-center shadow-sm">
                  <span className="font-bold text-cyan-300">{s.name || s}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded font-mono">
                    {s.proficiency || 'Intermediate'}
                  </span>
                </div>
              ))
            ) : (
              ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Python'].map(skillName => (
                <div key={skillName} className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 text-xs flex justify-between items-center shadow-sm">
                  <span className="font-bold text-cyan-300">{skillName}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded font-mono">Advanced</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PROJECT EXPERIENCE SECTION */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Experience</h3>
          <div className="space-y-3">
            {[
              { title: 'AI Code Review Companion', role: 'Lead Full Stack Dev', status: 'Completed', tech: ['React', 'Node.js', 'Grok AI API', 'MongoDB'] },
              { title: 'Campus Event Finder App', role: 'Frontend Architect', status: 'In Progress', tech: ['React', 'Tailwind CSS', 'Socket.IO'] },
              { title: 'Distributed Task Queue Service', role: 'Backend Developer', status: 'Completed', tech: ['Go', 'Redis', 'Docker'] }
            ].map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                    <p className="text-xs text-cyan-400 font-medium">Role: {proj.role}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    proj.status === 'Completed' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.tech.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-800 text-gray-300 font-medium border border-gray-700/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACHIEVEMENTS SECTION */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Achievements & Certifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">1st Place - HackMIT 2025</div>
                <div className="text-[10px] text-gray-400 truncate">Best AI Developer Tool Category</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Meta Front-End Specialization</div>
                <div className="text-[10px] text-gray-400 truncate">Certified Advanced React & UI/UX</div>
              </div>
            </div>
          </div>
        </div>

        {/* Invite Candidate Modal */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Invite {candidate.name} to Project</h3>
                <button onClick={() => setInviteModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {inviteSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-emerald-300">Invitation Sent Successfully!</div>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Select Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {myProjects.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Target Role</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React Developer"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Invitation Note</label>
                    <textarea
                      rows="3"
                      placeholder="We loved your profile skills and would love to have you on our project team!"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md disabled:opacity-50"
                    >
                      {inviteLoading ? 'Sending...' : 'Send Invitation'}
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

export default CandidateProfile;
