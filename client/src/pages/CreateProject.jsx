import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import RoleBuilder from '../components/projects/RoleBuilder';
import { createProject } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  PlusCircle, Sparkles, AlertCircle, Plus, Trash2, Github, Link as LinkIcon, 
  ChevronDown, ChevronUp, Layers, Users, Sliders, ShieldCheck, Check, Wand2 
} from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [projectGoals, setProjectGoals] = useState('');
  const [isAiImproving, setIsAiImproving] = useState(false);

  // Skills & Roles
  const [skills, setSkills] = useState(['React', 'Node.js', 'MongoDB']);
  const [newSkill, setNewSkill] = useState('');
  const [requiredRoles, setRequiredRoles] = useState([
    { title: 'Frontend Developer', count: 1, skills: ['React', 'JavaScript'] },
    { title: 'Backend Developer', count: 1, skills: ['Node.js', 'MongoDB'] }
  ]);

  // Creator Participation & Role
  const [creatorParticipation, setCreatorParticipation] = useState(true);
  const [creatorRoleSelect, setCreatorRoleSelect] = useState('Full Stack Developer');
  const [creatorCustomRole, setCreatorCustomRole] = useState('');
  const [creatorSkills, setCreatorSkills] = useState(['React', 'Node.js']);
  const [newCreatorSkill, setNewCreatorSkill] = useState('');

  // Team Specs
  const [minMembers, setMinMembers] = useState(2);
  const [maxMembers, setMaxMembers] = useState(5);
  const [duration, setDuration] = useState('1-3 months');
  const [availability, setAvailability] = useState('10-15 hrs/week');
  const [difficulty, setDifficulty] = useState('Intermediate'); // 'Beginner' | 'Intermediate' | 'Advanced'
  const [visibility, setVisibility] = useState('Public'); // 'Public' | 'Private'

  // Links
  const [githubUrl, setGithubUrl] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  // Expandable Section Toggles for clean mobile experience
  const [basicSectionOpen, setBasicSectionOpen] = useState(true);
  const [creatorSectionOpen, setCreatorSectionOpen] = useState(true);
  const [skillsSectionOpen, setSkillsSectionOpen] = useState(true);
  const [teamSectionOpen, setTeamSectionOpen] = useState(true);
  const [linksSectionOpen, setLinksSectionOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (skillToAdd = newSkill) => {
    if (!skillToAdd.trim()) return;
    if (!skills.includes(skillToAdd.trim())) {
      setSkills([...skills, skillToAdd.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddCreatorSkill = (skillToAdd = newCreatorSkill) => {
    if (!skillToAdd.trim()) return;
    if (!creatorSkills.includes(skillToAdd.trim())) {
      setCreatorSkills([...creatorSkills, skillToAdd.trim()]);
    }
    setNewCreatorSkill('');
  };

  const handleRemoveCreatorSkill = (skillToRemove) => {
    setCreatorSkills(creatorSkills.filter(s => s !== skillToRemove));
  };

  const handleAiImproveDescription = () => {
    if (!description.trim()) {
      showError('Please write a draft description first before enhancing with AI.');
      return;
    }
    setIsAiImproving(true);
    setTimeout(() => {
      setDescription((prev) => 
        `${prev.trim()}\n\n🚀 Key Features & Architecture:\n- High-performance responsive UI with modular components.\n- RESTful API & WebSocket backend for real-time collaboration.\n- Secure JWT authentication and automated CI/CD pipeline deployment.`
      );
      setIsAiImproving(false);
      showSuccess('Description enhanced with AI!');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Project name and description are required.');
      showError('Please fill in required fields.');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please enter a custom project category.');
      showError('Please enter a custom project category.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;

    const finalCreatorRole = creatorParticipation
      ? (creatorRoleSelect === 'Custom Role' ? (creatorCustomRole.trim() || 'Team Member') : creatorRoleSelect)
      : '';

    setLoading(true);
    setError('');

    try {
      const res = await createProject({
        title,
        description: projectGoals ? `${description}\n\nGoals: ${projectGoals}` : description,
        category: finalCategory,
        teamSize: maxMembers,
        duration,
        availability,
        visibility,
        requiredRoles,
        requiredSkills: skills,
        githubUrl,
        referenceUrl,
        difficulty,
        creator: {
          participation: creatorParticipation,
          role: finalCreatorRole,
          skills: creatorParticipation ? creatorSkills : []
        }
      });

      showSuccess('Project created successfully!');
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create project.');
      showError('Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-gray-800 pb-4 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Create Project</h1>
            <p className="text-xs text-gray-400">Publish your project idea and find compatible teammates</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="glass-panel rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setBasicSectionOpen(!basicSectionOpen)}
              className="w-full p-4 sm:p-5 flex justify-between items-center text-left bg-gray-900/60 hover:bg-gray-900/90 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">1. Basic Information</span>
              </div>
              {basicSectionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {basicSectionOpen && (
              <div className="p-5 space-y-4 border-t border-gray-800/80 animate-fadeIn">
                {/* Project Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Resume Analyzer & Matcher"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Project Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Game Dev">Game Dev</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {category === 'Other' && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-[11px] font-semibold text-gray-400">Custom Category Name *</label>
                      <input
                        type="text"
                        placeholder="Enter custom project category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Description + AI Improvement Button */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-300">Project Description *</label>
                    <button
                      type="button"
                      onClick={handleAiImproveDescription}
                      disabled={isAiImproving}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isAiImproving ? 'Improving...' : 'Improve with AI'}</span>
                    </button>
                  </div>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your project vision, target users, and overall architecture..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Project Goals */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Goals & Deliverables</label>
                  <input
                    type="text"
                    placeholder="e.g. Build MVP by end of month, present at hackathon"
                    value={projectGoals}
                    onChange={(e) => setProjectGoals(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CREATOR PARTICIPATION & ROLE */}
          <div className="glass-panel rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setCreatorSectionOpen(!creatorSectionOpen)}
              className="w-full p-4 sm:p-5 flex justify-between items-center text-left bg-gray-900/60 hover:bg-gray-900/90 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">2. Creator Participation & Role</span>
              </div>
              {creatorSectionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {creatorSectionOpen && (
              <div className="p-5 space-y-4 border-t border-gray-800/80 animate-fadeIn">
                {/* Question: Will you be working on this project? */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-200">
                    Will you be working on this project? *
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Specify whether you plan to build alongside teammates or strictly manage applications and project milestones.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Option 1: Yes */}
                    <div
                      onClick={() => setCreatorParticipation(true)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        creatorParticipation
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/30'
                          : 'bg-gray-900/70 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>Yes, I will work on this project</span>
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${creatorParticipation ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-gray-600'}`}>
                          {creatorParticipation && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-400">
                        You take an active role on the team and count toward project team capacity.
                      </p>
                    </div>

                    {/* Option 2: No */}
                    <div
                      onClick={() => setCreatorParticipation(false)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        !creatorParticipation
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-950/30'
                          : 'bg-gray-900/70 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>No, I am only creating/managing</span>
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!creatorParticipation ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-gray-600'}`}>
                          {!creatorParticipation && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-400">
                        You remain the project owner/admin but do NOT consume a development team member slot.
                      </p>
                    </div>
                  </div>
                </div>

                {/* If YES: Creator Role & Skills */}
                {creatorParticipation && (
                  <div className="p-4 bg-gray-900/90 rounded-2xl border border-gray-800 space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Your Project Role *</label>
                      <select
                        value={creatorRoleSelect}
                        onChange={(e) => setCreatorRoleSelect(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Project Lead">Project Lead</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="AI/ML Engineer">AI/ML Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                        <option value="Custom Role">Custom Role</option>
                      </select>
                    </div>

                    {creatorRoleSelect === 'Custom Role' && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-gray-400">Specify Custom Role Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Blockchain Architect / Game Designer"
                          value={creatorCustomRole}
                          onChange={(e) => setCreatorCustomRole(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Creator Skills for Role */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-300">Your Specific Skills for this Role</label>
                      <div className="flex flex-wrap gap-2">
                        {creatorSkills.map((s) => (
                          <span key={s} className="px-3 py-1.5 rounded-xl bg-indigo-950/70 text-indigo-300 border border-indigo-800 text-xs font-semibold flex items-center space-x-1.5">
                            <span>{s}</span>
                            <button type="button" onClick={() => handleRemoveCreatorSkill(s)} className="text-indigo-400 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add your skill (e.g. React, Next.js, PyTorch)"
                          value={newCreatorSkill}
                          onChange={(e) => setNewCreatorSkill(e.target.value)}
                          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCreatorSkill()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: REQUIRED SKILLS & OPEN ROLES */}
          <div className="glass-panel rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSkillsSectionOpen(!skillsSectionOpen)}
              className="w-full p-4 sm:p-5 flex justify-between items-center text-left bg-gray-900/60 hover:bg-gray-900/90 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">3. Required Skills & Open Team Roles</span>
              </div>
              {skillsSectionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {skillsSectionOpen && (
              <div className="p-5 space-y-4 border-t border-gray-800/80 animate-fadeIn">
                {/* Required Skills Chip List */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">Overall Project Required Skills</label>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center space-x-1.5">
                        <span>{s}</span>
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="text-cyan-400 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add skill (e.g. React, Python)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Team Role Builder Component */}
                <RoleBuilder 
                  roles={requiredRoles} 
                  onChange={setRequiredRoles} 
                  creatorInfo={{
                    participation: creatorParticipation,
                    role: creatorRoleSelect === 'Custom Role' ? creatorCustomRole : creatorRoleSelect,
                    skills: creatorSkills
                  }}
                />
              </div>
            )}
          </div>

          {/* SECTION 4: TEAM SPECS & REQUIREMENTS */}
          <div className="glass-panel rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setTeamSectionOpen(!teamSectionOpen)}
              className="w-full p-4 sm:p-5 flex justify-between items-center text-left bg-gray-900/60 hover:bg-gray-900/90 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">4. Team Specs & Requirements</span>
              </div>
              {teamSectionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {teamSectionOpen && (
              <div className="p-5 space-y-4 border-t border-gray-800/80 animate-fadeIn">
                {/* Min / Max Team Members */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Min Members</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={minMembers}
                      onChange={(e) => setMinMembers(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Max Members</label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(parseInt(e.target.value, 10) || 4)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Duration & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Project Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="2 Weeks">2 Weeks (Hackathon)</option>
                      <option value="1 Month">1 Month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Weekly Availability Required</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="1-5 hrs/week">1-5 hrs/week</option>
                      <option value="5-10 hrs/week">5-10 hrs/week</option>
                      <option value="10-15 hrs/week">10-15 hrs/week</option>
                      <option value="15-20 hrs/week">15-20 hrs/week</option>
                      <option value="20+ hrs/week">20+ hrs/week</option>
                      <option value="Weekends Only">Weekends Only</option>
                    </select>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                          difficulty === diff
                            ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Project Visibility</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Public', 'Private'].map(vis => (
                      <button
                        key={vis}
                        type="button"
                        onClick={() => setVisibility(vis)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                          visibility === vis
                            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {vis} {vis === 'Public' ? '(Open to all)' : '(Invite only)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: REPOSITORIES & LINKS */}
          <div className="glass-panel rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setLinksSectionOpen(!linksSectionOpen)}
              className="w-full p-4 sm:p-5 flex justify-between items-center text-left bg-gray-900/60 hover:bg-gray-900/90 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <LinkIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">5. Repositories & Reference Links (Optional)</span>
              </div>
              {linksSectionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {linksSectionOpen && (
              <div className="p-5 space-y-4 border-t border-gray-800/80 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">GitHub Repository URL</label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://github.com/username/project-repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Reference Links (Figma / Notion / Docs)</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://figma.com/file/..."
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY SUBMIT BUTTON */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-white text-xs shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50 transition-transform hover:scale-105"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
};

export default CreateProject;
