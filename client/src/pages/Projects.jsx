import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProjectCard from '../components/projects/ProjectCard';
import { fetchProjects } from '../services/api';
import { Search, Filter, Briefcase, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [search, category, type, sort]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetchProjects({
        search,
        category,
        type,
        sort
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-cyan-400" />
              <span>Project Discovery</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">Explore student projects seeking teammates and collaborators</p>
          </div>

          <Link
            to="/projects/new"
            className="gradient-btn px-4 py-2 rounded-xl font-bold text-white text-xs shadow-lg flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Project</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Mobile App">Mobile App</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Blockchain">Blockchain</option>
          </select>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Project Types</option>
            <option value="Academic">Academic</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Open Source">Open Source</option>
            <option value="Research">Research</option>
            <option value="Side Project">Side Project</option>
            <option value="Startup">Startup</option>
          </select>

          {/* Sorting */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Upcoming Deadline</option>
          </select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 space-y-2">
            <p className="text-sm font-semibold">No projects match your filter criteria.</p>
            <p className="text-xs text-gray-500">Try clearing filters or creating a new project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Projects;
