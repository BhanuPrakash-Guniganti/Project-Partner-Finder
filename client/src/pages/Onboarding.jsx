import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateOnboarding } from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useToast } from '../context/ToastContext';
import { Check, ArrowRight, ArrowLeft, Sparkles, Plus, Trash2, User, Code2, Clock, Image, Globe, Github, Linkedin } from 'lucide-react';

const Onboarding = () => {
  const { user, updateUserProfileState } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [step, setStep] = useState(1);
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState('');
  const [githubLink, setGithubLink] = useState(user?.links?.github || '');
  const [linkedinLink, setLinkedinLink] = useState(user?.links?.linkedin || '');
  const [portfolioLink, setPortfolioLink] = useState(user?.links?.portfolio || '');

  const [skills, setSkills] = useState(user?.skills || [
    { name: 'React', proficiency: 'Intermediate' },
    { name: 'JavaScript', proficiency: 'Advanced' }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Intermediate');

  const PREDEFINED_DOMAINS = [
    'Web Development', 'Mobile App', 'AI / ML', 'Cloud Computing',
    'Data Science', 'Blockchain', 'Open Source', 'Hackathons',
    'UI/UX Design', 'Cybersecurity', 'Game Dev', 'DevOps'
  ];

  const initialCustomInterest = (user?.interests || []).find(i => !PREDEFINED_DOMAINS.includes(i)) || '';
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [interests, setInterests] = useState(user?.interests || ['Web Development', 'AI / ML']);
  const [isOtherSelected, setIsOtherSelected] = useState(Boolean(initialCustomInterest));
  const [customInterest, setCustomInterest] = useState(initialCustomInterest);
  const [availability, setAvailability] = useState(user?.availability || '10-15 hrs/week');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  ];

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillProf }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const toggleOtherInterest = () => {
    if (isOtherSelected) {
      setIsOtherSelected(false);
      if (customInterest.trim()) {
        setInterests(interests.filter(i => i !== customInterest.trim()));
      }
    } else {
      setIsOtherSelected(true);
      if (customInterest.trim() && !interests.includes(customInterest.trim())) {
        setInterests([...interests, customInterest.trim()]);
      }
    }
  };

  const handleCustomInterestChange = (val) => {
    setCustomInterest(val);
    const trimmed = val.trim();
    const predefinedOnly = interests.filter(i => PREDEFINED_DOMAINS.includes(i));
    if (trimmed) {
      setInterests([...predefinedOnly, trimmed]);
    } else {
      setInterests(predefinedOnly);
    }
  };

  const handleNextStep = () => {
    if (step === 2 && newSkillName.trim()) {
      setSkills(prev => [...prev, { name: newSkillName.trim(), proficiency: newSkillProf }]);
      setNewSkillName('');
    }
    if (step === 4 && isOtherSelected && customInterest.trim()) {
      if (!interests.includes(customInterest.trim())) {
        setInterests(prev => [...prev, customInterest.trim()]);
      }
    }
    setStep(prev => prev + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    const finalSkills = [...skills];
    if (newSkillName.trim()) {
      finalSkills.push({ name: newSkillName.trim(), proficiency: newSkillProf });
    }

    const finalInterests = Array.from(new Set([
      ...interests,
      ...(isOtherSelected && customInterest.trim() ? [customInterest.trim()] : [])
    ])).filter(Boolean);

    try {
      const res = await updateOnboarding({
        bio,
        skills: finalSkills,
        experienceLevel,
        interests: finalInterests,
        availability,
        avatar: avatarUrl,
        links: {
          github: githubLink,
          linkedin: linkedinLink,
          portfolio: portfolioLink
        }
      });
      updateUserProfileState(res.data);
      showSuccess('Profile setup completed successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-6 pb-36 sm:pb-24 md:pb-12 pb-[calc(8rem+env(safe-area-inset-bottom))] w-full min-w-0">
        <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
              <span>Step {step} of 6</span>
              <span className="text-cyan-400 font-bold">{Math.round((step / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Step 1 of 6</span>
                <h3 className="text-xl font-bold text-white">Basic Profile Information</h3>
                <p className="text-xs text-gray-400">Introduce yourself to potential teammates and project owners.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">About / Student Bio</label>
                  <textarea
                    rows="3"
                    placeholder="Share your background, technical interests, or what projects you want to build..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">GitHub Profile URL</label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">LinkedIn Profile URL</label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinLink}
                        onChange={(e) => setLinkedinLink(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TECHNICAL SKILLS */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Step 2 of 6</span>
                <h3 className="text-xl font-bold text-white">Technical Skills & Proficiency</h3>
                <p className="text-xs text-gray-400">Add your skills and explicitly select your proficiency level.</p>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {skills.length === 0 ? (
                  <div className="text-xs text-gray-500 p-4 text-center bg-gray-900/40 rounded-xl border border-gray-800">
                    No skills added yet. Add your first technical skill below!
                  </div>
                ) : (
                  skills.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800 text-xs">
                      <span className="font-bold text-cyan-300">{s.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800 text-[10px] font-semibold">
                          {s.proficiency}
                        </span>
                        <button onClick={() => handleRemoveSkill(idx)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-800">
                <input
                  type="text"
                  placeholder="Skill name (e.g. React, Python, Flutter)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                <button onClick={handleAddSkill} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE LEVEL */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Step 3 of 6</span>
                <h3 className="text-xl font-bold text-white">Experience Level</h3>
                <p className="text-xs text-gray-400">Select your overall software development experience level.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { level: 'Beginner', desc: 'Learning fundamentals & building initial side projects' },
                  { level: 'Intermediate', desc: 'Built multi-tier web/mobile apps & worked in teams' },
                  { level: 'Advanced', desc: 'Proficient in architectures, APIs, databases & CI/CD' },
                  { level: 'Expert', desc: 'Lead developer experience, complex systems & mentoring' }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setExperienceLevel(item.level)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                      experienceLevel === item.level
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg'
                        : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.level}</div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: PROJECT INTERESTS */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Step 4 of 6</span>
                <h3 className="text-xl font-bold text-white">Project Interests & Domains</h3>
                <p className="text-xs text-gray-400">Select domains and project types you want to work on.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_DOMAINS.map(domain => {
                    const selected = interests.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleInterest(domain)}
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
                  
                  {/* Other Option */}
                  <button
                    type="button"
                    onClick={toggleOtherInterest}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isOtherSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    Other
                  </button>
                </div>

                {/* Custom Interest Input when Other is selected */}
                {isOtherSelected && (
                  <div className="space-y-1.5 pt-1 animate-fadeIn">
                    <label className="text-xs font-semibold text-gray-300">Custom Interest / Domain</label>
                    <input
                      type="text"
                      placeholder="Enter your project interest/domain"
                      value={customInterest}
                      onChange={(e) => handleCustomInterestChange(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: AVAILABILITY */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Step 5 of 6</span>
                <h3 className="text-xl font-bold text-white">Weekly Availability</h3>
                <p className="text-xs text-gray-400">How many hours per week can you dedicate to team collaboration?</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {['1-5 hrs/week', '5-10 hrs/week', '10-15 hrs/week', '15-20 hrs/week', '20+ hrs/week', 'Weekends Only'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvailability(opt)}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      availability === opt
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: PROFILE PHOTO */}
          {step === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Step 6 of 6</span>
                <h3 className="text-xl font-bold text-white">Profile Avatar & Photo</h3>
                <p className="text-xs text-gray-400">Choose a developer avatar or paste your image URL.</p>
              </div>

              <div className="flex flex-col items-center space-y-4 pt-1">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border-2 border-cyan-400 text-white flex items-center justify-center font-bold text-2xl shadow-xl overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>

                <div className="w-full space-y-2">
                  <label className="text-xs font-semibold text-gray-300 block text-center">Pick a Developer Avatar</label>
                  <div className="flex justify-center gap-3">
                    {defaultAvatars.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Avatar ${i}`}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                          avatarUrl === url ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/20' : 'border-transparent opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="w-full space-y-1 pt-2 border-t border-gray-800">
                  <label className="text-xs font-semibold text-gray-300">Or Paste Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-gray-800 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl flex items-center space-x-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1 shadow-lg"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="gradient-btn px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Saving Setup...' : 'Complete & Launch Dashboard'}
                <Check className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Onboarding;
