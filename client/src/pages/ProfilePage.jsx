import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { User, Mail, Github, Linkedin, ExternalLink, Edit3, Check, Plus, Trash2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfileState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [availability, setAvailability] = useState(user?.availability || '10-15 hrs/week');
  const [github, setGithub] = useState(user?.links?.github || '');
  const [portfolio, setPortfolio] = useState(user?.links?.portfolio || '');
  const [saving, setSaving] = useState(false);

  const [newSkill, setNewSkill] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Beginner');

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([
      ...skills,
      {
        name: newSkill.trim(),
        proficiency: newSkillProf
      }
    ]);
    setNewSkill('');
    setNewSkillProf('Beginner');
  };

  const handleRemoveSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({
        name,
        bio,
        skills,
        availability,
        links: { github, portfolio }
      });
      updateUserProfileState(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-6">
          
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-cyan-700/30 border-2 border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-2xl">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-xs text-cyan-400 font-semibold">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Bio</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-white"
                />
              </div>

              {/* Skills & Proficiency Section */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-300">Technical Skills & Proficiency</label>
                
                {/* Active Skills List */}
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    const skillProf = typeof s === 'string' ? 'Intermediate' : (s.proficiency || 'Beginner');
                    return (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-xs">
                        <span className="font-bold text-cyan-300">{skillName}</span>
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[11px] font-medium border border-gray-700">
                          {skillProf}
                        </span>
                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-red-400 hover:text-red-300 p-0.5 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Skill Input + Dropdown */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. Python, React)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newSkillProf}
                    onChange={(e) => setNewSkillProf(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-w-[130px]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">GitHub Link</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Portfolio Link</label>
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-btn px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-gray-800 text-xs">
              <div>
                <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Bio</h4>
                <p className="text-gray-300 leading-relaxed mt-1">{user?.bio || 'No bio specified.'}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-2">Technical Skills & Proficiency</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    const skillProf = typeof s === 'string' ? 'Intermediate' : (s.proficiency || 'Beginner');
                    return (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-cyan-950/40 text-cyan-300 font-semibold border border-cyan-800/60 text-xs flex items-center space-x-2">
                        <span>{skillName}</span>
                        <span className="text-[10px] text-cyan-300/80 px-1.5 py-0.5 bg-gray-900/80 rounded border border-gray-800 font-medium">
                          {skillProf}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase text-[10px]">Weekly Availability</h4>
                  <span className="text-white font-semibold">{user?.availability || '10-15 hrs/wk'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-400 uppercase text-[10px]">Links</h4>
                  <div className="flex space-x-3 text-cyan-400">
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
