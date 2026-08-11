import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import RoleBuilder from '../components/projects/RoleBuilder';
import { createProject } from '../services/api';
import { PlusCircle, Sparkles, AlertCircle } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [type, setType] = useState('Side Project');
  const [teamSize, setTeamSize] = useState(4);
  const [duration, setDuration] = useState('1-3 months');
  const [availability, setAvailability] = useState('10-15 hrs/week');
  const [visibility, setVisibility] = useState('Public');
  
  const [requiredRoles, setRequiredRoles] = useState([
    { title: 'Frontend Developer', count: 1, skills: ['React', 'JavaScript'] },
    { title: 'Backend Developer', count: 1, skills: ['Node.js', 'MongoDB'] }
  ]);
  const [reqSkillsInput, setReqSkillsInput] = useState('React, Node.js, MongoDB, JavaScript');
  const [optSkillsInput, setOptSkillsInput] = useState('Tailwind CSS, Docker');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requiredSkills = reqSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const optionalSkills = optSkillsInput.split(',').map(s => s.trim()).filter(Boolean);

      const res = await createProject({
        title,
        description,
        category,
        type,
        teamSize,
        duration,
        availability,
        visibility,
        requiredRoles,
        requiredSkills,
        optionalSkills
      });

      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Create New Project</h1>
            <p className="text-xs text-gray-400">Post a project idea, define open roles, and get matched with student teammates.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-6">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-300">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Resume Analyzer & Matcher"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Mobile App">Mobile App</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Project Description & Goals *</label>
            <textarea
              rows="4"
              required
              placeholder="Describe the purpose of your project, key features to build, and technical architecture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type, Team Size, Duration, Availability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Project Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Academic">Academic</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Open Source">Open Source</option>
                <option value="Research">Research</option>
                <option value="Side Project">Side Project</option>
                <option value="Startup">Startup</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Team Size</label>
              <input
                type="number"
                min="2"
                max="10"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="< 1 month">&lt; 1 month</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Weekly Commitment</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="5-10 hrs/week">5-10 hrs/week</option>
                <option value="10-15 hrs/week">10-15 hrs/week</option>
                <option value="15-20 hrs/week">15-20 hrs/week</option>
                <option value="20+ hrs/week">20+ hrs/week</option>
              </select>
            </div>
          </div>

          {/* Dynamic Role Builder Component */}
          <RoleBuilder roles={requiredRoles} onChange={setRequiredRoles} />

          {/* Required & Optional Skills Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Required Core Skills (comma separated)</label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={reqSkillsInput}
                onChange={(e) => setReqSkillsInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Optional / Nice-to-Have Skills</label>
              <input
                type="text"
                placeholder="Tailwind CSS, Docker"
                value={optSkillsInput}
                onChange={(e) => setOptSkillsInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-8 py-3 rounded-xl font-bold text-white text-xs shadow-xl flex items-center space-x-2"
            >
              {loading ? 'Creating Project...' : 'Publish Project & Find Teammates'}
            </button>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
};

export default CreateProject;
