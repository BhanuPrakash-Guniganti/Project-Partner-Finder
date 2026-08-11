import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateOnboarding } from '../services/api';
import Navbar from '../components/common/Navbar';
import { Check, ArrowRight, ArrowLeft, Sparkles, Plus, Trash2 } from 'lucide-react';

const Onboarding = () => {
  const { user, updateUserProfileState } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || [
    { name: 'React', proficiency: 'Intermediate' },
    { name: 'Node.js', proficiency: 'Intermediate' }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Intermediate');

  const [interests, setInterests] = useState(user?.interests || ['Web Development', 'AI / ML']);
  const [availability, setAvailability] = useState(user?.availability || '10-15 hrs/week');
  const [preferredRoles, setPreferredRoles] = useState(user?.preferredRoles || ['Frontend Developer', 'Backend Developer']);
  const [projectPreferences, setProjectPreferences] = useState(user?.projectPreferences || ['Hackathon', 'Side Project']);
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillProf }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleSelection = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await updateOnboarding({
        bio,
        skills,
        interests,
        availability,
        preferredRoles,
        projectPreferences
      });
      updateUserProfileState(res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-xl glass-panel p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Step {step} of 6</span>
              <span className="text-cyan-400 font-bold">{Math.round((step / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }}></div>
            </div>
          </div>

          {/* STEP 1: BIO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 1: Student Bio & Overview</h3>
                <p className="text-xs text-gray-400">Tell potential project owners and teammates about your background.</p>
              </div>
              <textarea
                rows="4"
                placeholder="Share your technical interests, favorite tech stack, or what you hope to build..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* STEP 2: SKILLS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 2: Skills & Proficiency</h3>
                <p className="text-xs text-gray-400">Add technical skills and select your proficiency level.</p>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {skills.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-900 p-2.5 rounded-lg border border-gray-800 text-xs">
                    <span className="font-bold text-cyan-300">{s.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[11px]">{s.proficiency}</span>
                      <button onClick={() => handleRemoveSkill(idx)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-800">
                <input
                  type="text"
                  placeholder="Skill name (e.g. React, Python)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newSkillProf}
                  onChange={(e) => setNewSkillProf(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button onClick={handleAddSkill} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTERESTS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 3: Domains & Technical Interests</h3>
                <p className="text-xs text-gray-400">Select domains you are interested in working on.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Web Development', 'Mobile App', 'AI / ML', 'Data Science', 'Blockchain', 'UI/UX Design', 'Cloud / DevOps', 'Cybersecurity', 'Game Dev'].map(domain => {
                  const selected = interests.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleSelection(interests, setInterests, domain)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selected 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10' 
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {domain}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: AVAILABILITY */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 4: Weekly Availability</h3>
                <p className="text-xs text-gray-400">How many hours per week can you dedicate to team projects?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['5-10 hrs/week', '10-15 hrs/week', '15-20 hrs/week', '20+ hrs/week'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvailability(opt)}
                    className={`p-4 rounded-xl border text-xs font-bold transition-all text-center ${
                      availability === opt
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: PREFERRED ROLES */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 5: Preferred Team Roles</h3>
                <p className="text-xs text-gray-400">Select roles you prefer to take on in projects.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Machine Learning Engineer', 'DevOps Engineer', 'Project Lead'].map(roleOpt => {
                  const selected = preferredRoles.includes(roleOpt);
                  return (
                    <button
                      key={roleOpt}
                      type="button"
                      onClick={() => toggleSelection(preferredRoles, setPreferredRoles, roleOpt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selected 
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' 
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {roleOpt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: PREFERRED PROJECT TYPES */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 6: Preferred Project Types</h3>
                <p className="text-xs text-gray-400">What kinds of projects do you want to join?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Academic', 'Hackathon', 'Open Source', 'Research', 'Side Project', 'Startup'].map(pType => {
                  const selected = projectPreferences.includes(pType);
                  return (
                    <button
                      key={pType}
                      type="button"
                      onClick={() => toggleSelection(projectPreferences, setProjectPreferences, pType)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        selected
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {pType}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-gray-800 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-lg flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="gradient-btn px-5 py-2 rounded-lg text-xs font-bold text-white flex items-center space-x-1 shadow-lg"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="gradient-btn px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center space-x-1 shadow-lg"
              >
                {loading ? 'Saving...' : 'Finish & Go to Dashboard'}
                <Check className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
