import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProjectCard from '../components/projects/ProjectCard';
import BottomSheet from '../components/common/BottomSheet';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { fetchProjects, fetchMyProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, SlidersHorizontal, Briefcase, PlusCircle, Plus, 
  FolderSearch, Users, Clock, Tag, ArrowRight, Sparkles 
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'my_projects' | 'joined'
  const [projects, setProjects] = useState([]);
  const [myProjectsData, setMyProjectsData] = useState({ created: [], joined: [] });
  
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  
  const [loading, setLoading] = useState(true);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    loadProjectsData();
  }, [search, category, type, sort]);

  const loadProjectsData = async () => {
    setLoading(true);
    try {
      const [projRes, myProjRes] = await Promise.all([
        fetchProjects({ search, category, type, sort }),
        fetchMyProjects()
      ]);
      setProjects(projRes.data || []);
      setMyProjectsData(myProjRes.data || { created: [], joined: [] });
    } catch (err) {
      console.error('[Projects Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setType('');
    setSort('newest');
  };

  // Determine displayed projects based on activeTab & search
  let displayedProjects = [];
  if (activeTab === 'my_projects') {
    displayedProjects = myProjectsData.created || [];
  } else if (activeTab === 'joined') {
    displayedProjects = myProjectsData.joined || [];
  } else {
    displayedProjects = projects;
  }

  // Filter displayed projects locally if search/category active for tabs
  if (activeTab !== 'discover' && (search || category || type)) {
    displayedProjects = displayedProjects.filter(p => {
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (type && p.type !== type) return false;
      return true;
    });
  }

  const activeFilterCount = [category, type, sort !== 'newest'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-28 md:pb-10 pb-[calc(7rem+env(safe-area-inset-bottom))] w-full space-y-6 flex-1 min-w-0">
        
        {/* Header Title & Create Button */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <span>Projects</span>
            </h1>
            <p className="text-xs text-gray-400 truncate">Discover open projects or manage your active team workspaces</p>
          </div>

          <Link
            to="/projects/new"
            className="gradient-btn px-4 py-2.5 rounded-2xl font-bold text-white text-xs shadow-lg flex items-center space-x-1.5 flex-shrink-0 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create</span>
          </Link>
        </div>

        {/* Tab Navigation Segment */}
        <div className="flex p-1 rounded-2xl bg-gray-900/80 border border-gray-800 max-w-md w-full">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'discover'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => setActiveTab('my_projects')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
              activeTab === 'my_projects'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Projects
            {myProjectsData.created?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono">
                {myProjectsData.created.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('joined')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
              activeTab === 'joined'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Joined
            {myProjectsData.joined?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono">
                {myProjectsData.joined.length}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search projects, skills or tech stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 shadow-md"
            />
          </div>

          <div className="flex gap-2">
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

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold flex-shrink-0"
            >
              <option value="newest">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="deadline">Upcoming Deadline</option>
            </select>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <SkeletonLoader count={6} type="card" />
        ) : displayedProjects.length === 0 ? (
          activeTab === 'my_projects' ? (
            <EmptyState
              icon={PlusCircle}
              title="Start building something."
              description="Create your first project to find compatible teammates and collaborate."
              actionText="Create Your First Project"
              onAction={() => navigate('/projects/new')}
            />
          ) : activeTab === 'joined' ? (
            <EmptyState
              icon={Users}
              title="No Joined Projects Yet"
              description="Explore open projects looking for developer teammates and apply to join."
              actionText="Discover Projects to Join"
              onAction={() => setActiveTab('discover')}
            />
          ) : (
            <EmptyState
              icon={FolderSearch}
              title="No projects match your filter criteria"
              description="Try clearing search filters or create a new project."
              actionText="Clear Filters"
              onAction={clearFilters}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {displayedProjects.map((project) => {
              const teamSize = project.teamSize || 4;
              const currentMembers = project.currentMemberCount !== undefined ? project.currentMemberCount : 0;
              const openPositions = Math.max(0, teamSize - currentMembers);
              const fillPct = teamSize > 0 ? Math.round((currentMembers / teamSize) * 100) : 0;

              return (
                <div key={project._id} className="glass-card rounded-3xl p-5 border border-gray-800 flex flex-col justify-between space-y-4 shadow-xl min-w-0">
                  <div className="space-y-3 min-w-0">
                    
                    {/* Top Row: Category & Status */}
                    <div className="flex justify-between items-start gap-2 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {project.category || 'Web Development'}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        openPositions === 0 || project.status === 'Team Full' || project.status === 'Team Complete'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      }`}>
                        {openPositions === 0 ? 'Team Full' : `${openPositions} open`}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{project.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">{project.description}</p>
                    </div>

                    {/* Team Members Count & Real Fill Status */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[11px] text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span><span className="text-white font-bold">{currentMembers} of {teamSize}</span> positions filled</span>
                        </span>
                        <span className="text-cyan-400 font-mono text-[10px]">{fillPct}%</span>
                      </div>

                      {/* Real Capacity Fill Bar */}
                      <div className="w-full h-1.5 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Required Skills</span>
                      <div className="flex flex-wrap gap-1.5 min-w-0">
                        {project.requiredSkills?.slice(0, 4).map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-800 text-gray-300 font-medium border border-gray-700/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Card Action Button */}
                  <Link
                    to={activeTab === 'my_projects' || activeTab === 'joined' ? `/workspace/${project._id}` : `/projects/${project._id}`}
                    className="gradient-btn w-full py-2.5 rounded-2xl text-xs font-bold text-white text-center shadow-md flex items-center justify-center space-x-1"
                  >
                    <span>{activeTab === 'my_projects' || activeTab === 'joined' ? 'Open Workspace' : 'Open Project'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Bottom Sheet Filters */}
        <BottomSheet
          isOpen={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="Filter Projects & Workspaces"
        >
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Mobile App">Mobile App</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Blockchain">Blockchain</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Project Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Project Types</option>
                <option value="Academic">Academic</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Open Source">Open Source</option>
                <option value="Research">Research</option>
                <option value="Side Project">Side Project</option>
                <option value="Startup">Startup</option>
              </select>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 py-2.5 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl"
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

      </main>

      <Footer />
    </div>
  );
};

export default Projects;
