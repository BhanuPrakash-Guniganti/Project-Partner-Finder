import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/api';
import { 
  User, Mail, Github, Linkedin, ExternalLink, Edit3, Check, Plus, 
  Trash2, Sun, Moon, Monitor, GraduationCap, MapPin, AtSign, BookOpen, 
  Calendar, Briefcase, Clock, Sparkles, Image, Search 
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfileState } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(true);
  
  // Profile Fields
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || 'alex_rivera');
  const [professionalTitle, setProfessionalTitle] = useState(user?.preferredRoles?.[0] || 'Full Stack Developer');
  const [bio, setBio] = useState(user?.bio || '');
  const [college, setCollege] = useState(user?.college || 'Stanford University');
  const [course, setCourse] = useState(user?.course || 'Computer Science');
  const [gradYear, setGradYear] = useState(user?.gradYear || '2026');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA');
  const [availability, setAvailability] = useState(user?.availability || '10-15 hrs/week');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  // Skills
  const [skills, setSkills] = useState(user?.skills || [
    { name: 'React', proficiency: 'Advanced' },
    { name: 'Node.js', proficiency: 'Intermediate' },
    { name: 'MongoDB', proficiency: 'Advanced' }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Intermediate');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Project Interests
  const [interests, setInterests] = useState(user?.interests || ['Web Development', 'AI', 'Mobile Development']);

  // Social Links
  const [github, setGithub] = useState(user?.links?.github || '');
  const [linkedin, setLinkedin] = useState(user?.links?.linkedin || '');
  const [portfolio, setPortfolio] = useState(user?.links?.portfolio || '');
  const [saving, setSaving] = useState(false);

  const availableInterests = [
    'AI', 'Web Development', 'Mobile Development', 
    'Data Science', 'Cybersecurity', 'Cloud', 
    'DevOps', 'Blockchain', 'Other'
  ];

  const popularSkills = [
    'React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 
    'Express.js', 'Next.js', 'GraphQL', 'Tailwind CSS', 'Docker'
  ];

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  const handleAddSkill = (skillNameToAdd = newSkillName) => {
    if (!skillNameToAdd.trim()) return;
    setSkills([
      ...skills,
      {
        name: skillNameToAdd.trim(),
        proficiency: newSkillProf
      }
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const toggleInterest = (interestItem) => {
    if (interests.includes(interestItem)) {
      setInterests(interests.filter(i => i !== interestItem));
    } else {
      setInterests([...interests, interestItem]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({
        name,
        bio,
        skills,
        availability,
        experienceLevel,
        interests,
        avatar: avatarUrl,
        preferredRoles: [professionalTitle],
        links: { github, linkedin, portfolio }
      });
      updateUserProfileState(res.data);
      showSuccess('Profile changes saved successfully!');
      setIsEditing(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSuggestedSkills = popularSkills.filter(s => 
    s.toLowerCase().includes(skillSearchQuery.toLowerCase()) && 
    !skills.some(existing => (existing.name || existing).toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-36 md:pb-12 pb-[calc(9rem+env(safe-area-inset-bottom))] w-full min-w-0 flex-1 space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4 min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>{isEditing ? 'Edit Candidate Profile' : 'Developer Profile'}</span>
            </h1>
            <p className="text-xs text-gray-400">Update your technical skills, bio, interests, and social accounts</p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-white rounded-xl flex items-center space-x-1.5 transition-colors flex-shrink-0"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>{isEditing ? 'View Mode' : 'Edit Mode'}</span>
          </button>
        </div>

        {/* Profile Container */}
        <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl">
          
          {isEditing ? (
            <div className="space-y-6">
              
              {/* SECTION 1: PROFILE PHOTO */}
              <div className="space-y-3 border-b border-gray-800/80 pb-6">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Profile Photo & Avatar</label>
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border-2 border-cyan-400 text-white flex items-center justify-center font-bold text-2xl shadow-xl overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>

                  <div className="space-y-2 w-full min-w-0">
                    <div className="flex gap-2">
                      {defaultAvatars.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Avatar ${i}`}
                          onClick={() => setAvatarUrl(url)}
                          className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                            avatarUrl === url ? 'border-cyan-400 scale-105 shadow-md' : 'border-transparent opacity-60'
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste profile image URL..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERSONAL & ACADEMIC INFO */}
              <div className="space-y-4 border-b border-gray-800/80 pb-6">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Personal & Academic Details</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Username</label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Professional Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer / ML Developer"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Location / Timezone</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Student Bio / Summary</label>
                  <textarea
                    rows="3"
                    placeholder="Share your developer background, technical stack and goal..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">College / University</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Course / Degree</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Graduation Year</label>
                    <select
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Weekly Availability</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white"
                    >
                      <option value="1-5 hrs/week">1-5 hrs/week</option>
                      <option value="5-10 hrs/week">5-10 hrs/week</option>
                      <option value="10-15 hrs/week">10-15 hrs/week</option>
                      <option value="15-20 hrs/week">15-20 hrs/week</option>
                      <option value="20+ hrs/week">20+ hrs/week</option>
                      <option value="Weekends Only">Weekends Only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SKILLS & PROFICIENCY */}
              <div className="space-y-4 border-b border-gray-800/80 pb-6">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Technical Skills & Proficiency</label>
                
                {/* Active Skills Chips */}
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    const skillProf = typeof s === 'string' ? 'Intermediate' : (s.proficiency || 'Intermediate');
                    return (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs">
                        <span className="font-bold text-cyan-300">{skillName}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 text-[10px] font-semibold border border-cyan-800">
                          {skillProf}
                        </span>
                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-red-400 hover:text-red-300 p-0.5 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Skill Input + Proficiency Selector */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. React, Node.js, Python)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newSkillProf}
                    onChange={(e) => setNewSkillProf(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>

                {/* Search Skill Suggestions */}
                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search skill suggestions..."
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500"
                    />
                  </div>
                  {filteredSuggestedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {filteredSuggestedSkills.map(suggested => (
                        <button
                          key={suggested}
                          type="button"
                          onClick={() => handleAddSkill(suggested)}
                          className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-[11px] text-gray-300 hover:text-cyan-300 font-medium transition-colors"
                        >
                          + {suggested}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: PROJECT INTERESTS */}
              <div className="space-y-3 border-b border-gray-800/80 pb-6">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Project Interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: SOCIAL & PORTFOLIO LINKS */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Social & Portfolio Links</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">GitHub URL</label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">LinkedIn URL</label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Portfolio Website</label>
                    <div className="relative">
                      <ExternalLink className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://portfolio.dev"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-6 border-t border-gray-800 flex justify-end w-full">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-btn w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 transition-transform hover:scale-105"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* READ-ONLY VIEW */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left border-b border-gray-800 pb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border-2 border-cyan-400 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shadow-lg flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{user?.name}</h2>
                  <p className="text-xs text-cyan-400 font-semibold">{professionalTitle}</p>
                  <p className="text-xs text-gray-400">{college} • {course} ('{gradYear})</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">About</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{user?.bio || 'No bio specified.'}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    const skillProf = typeof s === 'string' ? 'Intermediate' : (s.proficiency || 'Intermediate');
                    return (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-cyan-950/40 text-cyan-300 font-semibold border border-cyan-800 text-xs flex items-center space-x-2">
                        <span>{skillName}</span>
                        <span className="text-[10px] text-cyan-300/80 px-1.5 py-0.5 bg-gray-900 rounded font-medium">
                          {skillProf}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800 text-xs">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase text-[10px]">Weekly Availability</h4>
                  <span className="text-white font-semibold">{user?.availability || '10-15 hrs/wk'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-400 uppercase text-[10px]">Social Profiles</h4>
                  <div className="flex space-x-3 text-cyan-400 pt-1">
                    {user?.links?.github && (
                      <a href={user.links.github} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:underline">
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {user?.links?.portfolio && (
                      <a href={user.links.portfolio} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:underline">
                        <ExternalLink className="w-4 h-4" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
