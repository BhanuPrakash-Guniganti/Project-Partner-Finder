import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import ExplainableMatchModal from '../components/matching/ExplainableMatchModal';
import BottomSheet from '../components/common/BottomSheet';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { searchCandidates, fetchMyProjects, inviteCandidate } from '../services/api';
import { 
  Users, Search, SlidersHorizontal, ArrowUpDown, Briefcase, 
  Clock, GraduationCap, Send, MessageSquare, Check, X, Sparkles, ChevronRight 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Candidates = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [candidates, setCandidates] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [minMatchFilter, setMinMatchFilter] = useState('0');
  
  const [sortBy, setSortBy] = useState('best_match'); // 'best_match' | 'most_experienced' | 'recently_active'
  const [loading, setLoading] = useState(true);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [inviteModalCandidate, setInviteModalCandidate] = useState(null);
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const [explainModalCandidate, setExplainModalCandidate] = useState(null);

  useEffect(() => {
    loadData();
  }, [search, skillFilter, roleFilter, selectedProjectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [candRes, projRes] = await Promise.all([
        searchCandidates({ search, skill: skillFilter, role: roleFilter, projectId: selectedProjectId }),
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
    if (!selectedProjectId || !inviteModalCandidate || inviteLoading) return;

    setInviteLoading(true);
    try {
      await inviteCandidate({
        projectId: selectedProjectId,
        candidateId: inviteModalCandidate._id,
        role: inviteRole,
        message: inviteMessage
      });
      setInviteSuccess(true);
      showSuccess(`Invitation sent to ${inviteModalCandidate.name}!`);
      setTimeout(() => {
        setInviteModalCandidate(null);
        setInviteSuccess(false);
      }, 1500);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDirectConnect = (candidate) => {
    navigate('/chat', { state: { recipient: candidate } });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSkillFilter('');
    setRoleFilter('');
    setExperienceFilter('');
    setCollegeFilter('');
    setAvailabilityFilter('');
    setInterestFilter('');
    setMinMatchFilter('0');
    setSortBy('best_match');
  };

  // Filter & Sort Candidate Logic
  const filteredCandidates = candidates.filter(cand => {
    if (experienceFilter && cand.experienceLevel !== experienceFilter) return false;
    if (availabilityFilter && cand.availability !== availabilityFilter) return false;
    if (collegeFilter && !cand.college?.toLowerCase().includes(collegeFilter.toLowerCase())) return false;
    if (interestFilter && !cand.interests?.some(i => i.toLowerCase().includes(interestFilter.toLowerCase()))) return false;
    
    const candMatch = cand.matchScore !== undefined ? cand.matchScore : 85;
    if (parseInt(minMatchFilter, 10) > 0 && candMatch < parseInt(minMatchFilter, 10)) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'most_experienced') {
      const expMap = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
      return (expMap[b.experienceLevel] || 2) - (expMap[a.experienceLevel] || 2);
    }
    if (sortBy === 'recently_active') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    // Default: Best Match
    const scoreA = a.matchScore !== undefined ? a.matchScore : 85;
    const scoreB = b.matchScore !== undefined ? b.matchScore : 85;
    return scoreB - scoreA;
  });

  const activeFilterCount = [
    skillFilter, roleFilter, experienceFilter, collegeFilter, 
    availabilityFilter, interestFilter, minMatchFilter !== '0'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* Discover Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2.5">
              <Users className="w-7 h-7 text-cyan-400 flex-shrink-0" />
              <span>Discover</span>
            </h1>
            <p className="text-xs text-gray-400">Discover potential teammates based on technical skills, experience and compatibility</p>
          </div>

          {/* Project Context Match Picker */}
          {myProjects.length > 0 && (
            <div className="flex items-center space-x-2 bg-gray-900/90 px-3.5 py-2 rounded-2xl border border-gray-800 text-xs w-full sm:w-auto">
              <span className="text-gray-400 font-semibold flex-shrink-0">Match for Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer text-xs truncate max-w-[180px]"
              >
                {myProjects.map(p => (
                  <option key={p._id} value={p._id} className="bg-gray-900 text-white">{p.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by skill, role or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 shadow-md"
            />
          </div>

          <div className="flex gap-2">
            {/* Mobile / Desktop Filter Button */}
            <button
              onClick={() => setFilterSheetOpen(true)}
              className={`px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all flex-shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500 font-bold shadow-lg'
                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sorting Dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold"
              >
                <option value="best_match">Sort: Best Match</option>
                <option value="most_experienced">Sort: Most Experienced</option>
                <option value="recently_active">Sort: Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Title & Results Count */}
        <div className="flex justify-between items-center min-w-0 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Recommended Teammates</span>
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'} found
          </span>
        </div>

        {/* Teammate Cards Grid */}
        {loading ? (
          <SkeletonLoader count={6} type="card" />
        ) : filteredCandidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching teammates found"
            description="Try loosening your search filters or resetting your selection criteria."
            actionText="Clear All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredCandidates.map((candidate) => {
              const matchScore = candidate.matchScore !== undefined ? candidate.matchScore : 88;
              return (
                <div key={candidate._id} className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between space-y-4 shadow-xl min-w-0">
                  <div className="space-y-3 min-w-0">
                    
                    {/* Header Row: Image, Name, Role & Match Score */}
                    <div className="flex justify-between items-start gap-2 min-w-0">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-base flex-shrink-0 overflow-hidden shadow-md">
                          {candidate.avatar ? (
                            <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover" />
                          ) : (
                            candidate.name?.charAt(0)?.toUpperCase() || 'C'
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">{candidate.name}</h3>
                          <p className="text-xs text-cyan-400 font-semibold truncate">
                            {candidate.preferredRoles?.[0] || 'Software Engineer'}
                          </p>
                        </div>
                      </div>

                      <MatchScoreBadge
                        score={matchScore}
                        onClick={() => setExplainModalCandidate(candidate)}
                      />
                    </div>

                    {/* Academic & Experience Details */}
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center space-x-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{candidate.college || 'Stanford University'}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-gray-400 pt-0.5">
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
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {candidate.bio || 'Software developer passionate about building innovative Web & AI projects.'}
                    </p>

                    {/* Technical Skill Chips */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Skills</span>
                      <div className="flex flex-wrap gap-1.5 min-w-0">
                        {candidate.skills?.slice(0, 4).map(s => (
                          <span key={s.name || s} className="px-2 py-0.5 rounded-md text-[11px] bg-gray-800 text-gray-300 font-medium border border-gray-700/60">
                            {s.name || s}
                          </span>
                        ))}
                        {candidate.skills?.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">
                            +{candidate.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Card Actions: View Profile, Connect, Invite */}
                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2">
                    <Link
                      to={`/candidates/${candidate._id}`}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDirectConnect(candidate)}
                        className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-200 hover:text-white flex items-center space-x-1 transition-colors"
                        title="Direct Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Connect</span>
                      </button>

                      {myProjects.length > 0 && (
                        <button
                          onClick={() => setInviteModalCandidate(candidate)}
                          className="gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Invite</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Filter Bottom Sheet Panel */}
        <BottomSheet
          isOpen={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="Filter Teammates & Developers"
        >
          <div className="space-y-4 py-2">
            {/* Filter 1: Specific Skill */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Technical Skill</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Python, Flutter"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Filter 2: Professional Role */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Target Role</label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer, ML Engineer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Filter 3: Experience Level */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Experience Level</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Experience Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Filter 4: Availability */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Weekly Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Availability</option>
                <option value="1-5 hrs/week">1-5 hrs/week</option>
                <option value="5-10 hrs/week">5-10 hrs/week</option>
                <option value="10-15 hrs/week">10-15 hrs/week</option>
                <option value="15-20 hrs/week">15-20 hrs/week</option>
                <option value="20+ hrs/week">20+ hrs/week</option>
                <option value="Weekends Only">Weekends Only</option>
              </select>
            </div>

            {/* Filter 5: Minimum Match Percentage */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Minimum AI Match Compatibility</label>
              <select
                value={minMatchFilter}
                onChange={(e) => setMinMatchFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="0">All Match Scores</option>
                <option value="50">50%+ Match</option>
                <option value="70">70%+ Match (High Alignment)</option>
                <option value="85">85%+ Match (Strict Compatibility)</option>
              </select>
            </div>

            {/* Actions: Clear & Apply */}
            <div className="flex gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </BottomSheet>

        {/* Invite Candidate Modal */}
        {inviteModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Invite {inviteModalCandidate.name} to Team</h3>
                <button onClick={() => setInviteModalCandidate(null)} className="p-1 text-gray-400 hover:text-white">
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
                    <label className="text-xs font-semibold text-gray-300">Target Role</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React Developer"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Personal Invitation Note</label>
                    <textarea
                      rows="3"
                      placeholder="We loved your profile skills and would love to have you on our project team!"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalCandidate(null)}
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
