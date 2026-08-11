import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import ExplainableMatchModal from '../components/matching/ExplainableMatchModal';
import { searchCandidates, fetchMyProjects, inviteCandidate } from '../services/api';
import { Users, Search, UserCheck, Send, Check } from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const [inviteModalCandidate, setInviteModalCandidate] = useState(null);
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  const [explainModalCandidate, setExplainModalCandidate] = useState(null);

  useEffect(() => {
    loadData();
  }, [search, skill, role, selectedProjectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [candRes, projRes] = await Promise.all([
        searchCandidates({ search, skill, role, projectId: selectedProjectId }),
        fetchMyProjects()
      ]);
      setCandidates(candRes.data || []);
      setMyProjects(projRes.data?.created || []);
      if (!selectedProjectId && projRes.data?.created?.length > 0) {
        setSelectedProjectId(projRes.data.created[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteModalCandidate) return;

    try {
      await inviteCandidate({
        projectId: selectedProjectId,
        candidateId: inviteModalCandidate._id,
        role: inviteRole,
        message: inviteMessage
      });
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteModalCandidate(null);
        setInviteSuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>Candidate Discovery</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">Find talented student teammates matching your project's skill requirements</p>
          </div>

          {/* Target Project Selector for Compatibility Match calculation */}
          {myProjects.length > 0 && (
            <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
              <span className="text-gray-400 font-semibold">Match for Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
              >
                {myProjects.map(p => (
                  <option key={p._id} value={p._id} className="bg-gray-900 text-white">{p.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <input
            type="text"
            placeholder="Filter by specific skill (e.g. React)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />

          <input
            type="text"
            placeholder="Filter by role (e.g. Frontend)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 text-xs">
            No candidates match your search filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map(candidate => (
              <div key={candidate._id} className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  
                  {/* Candidate Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-full bg-cyan-800/40 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold text-sm">
                        {candidate.avatar ? (
                          <img src={candidate.avatar} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          candidate.name?.charAt(0) || 'C'
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{candidate.name}</h3>
                        <p className="text-xs text-cyan-400 font-medium">
                          {candidate.preferredRoles?.[0] || 'Software Engineer'}
                        </p>
                      </div>
                    </div>

                    {candidate.matchScore !== undefined && (
                      <MatchScoreBadge
                        score={candidate.matchScore}
                        onClick={() => setExplainModalCandidate(candidate)}
                      />
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {candidate.bio || 'Software development student looking for exciting team projects.'}
                  </p>

                  {/* Skills Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills?.slice(0, 5).map(s => (
                        <span key={s.name || s} className="px-2 py-0.5 rounded text-[11px] bg-gray-800 text-gray-300 font-medium border border-gray-700/60">
                          {s.name || s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 pt-1">
                    <span>Availability: {candidate.availability || '10-15 hrs/wk'}</span>
                  </div>

                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <Link
                    to={`/candidates/${candidate._id}`}
                    className="text-xs text-cyan-400 font-semibold hover:underline"
                  >
                    View Profile
                  </Link>

                  {myProjects.length > 0 && (
                    <button
                      onClick={() => setInviteModalCandidate(candidate)}
                      className="gradient-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite Candidate Modal */}
        {inviteModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700 p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Invite {inviteModalCandidate.name} to Project</h3>

              {inviteSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-emerald-300">Invitation Sent!</div>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Select Role for Candidate</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React Developer"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Personal Invitation Note</label>
                    <textarea
                      rows="3"
                      placeholder="We loved your profile skills and would love to have you on our team!"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalCandidate(null)}
                      className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-lg"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Explainable Match Modal for Candidate */}
        {explainModalCandidate && (
          <ExplainableMatchModal
            isOpen={!!explainModalCandidate}
            onClose={() => setExplainModalCandidate(null)}
            matchScore={explainModalCandidate.matchScore}
            matchBreakdown={explainModalCandidate.matchBreakdown}
            reasons={explainModalCandidate.reasons}
            title={`Match: ${explainModalCandidate.name}`}
          />
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Candidates;
