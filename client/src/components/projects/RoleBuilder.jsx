import React, { useState } from 'react';
import { Plus, Trash2, UserCheck, Shield, Sparkles } from 'lucide-react';

const SUGGESTED_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'UI/UX Designer', 'AI/ML Engineer', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer'
];

const RoleBuilder = ({ roles = [], onChange, creatorInfo = null }) => {
  const [roleTitle, setRoleTitle] = useState('');
  const [roleCount, setRoleCount] = useState(1);
  const [roleSkills, setRoleSkills] = useState('');

  const handleAddRole = (titleToAdd = roleTitle) => {
    if (!titleToAdd.trim()) return;
    const skillsArray = roleSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newRole = {
      title: titleToAdd.trim(),
      count: Number(roleCount) || 1,
      skills: skillsArray
    };
    onChange([...roles, newRole]);
    setRoleTitle('');
    setRoleCount(1);
    setRoleSkills('');
  };

  const handleRemoveRole = (index) => {
    const updated = roles.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4 bg-gray-900/60 p-4 sm:p-5 rounded-2xl border border-gray-800 shadow-inner">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Required Open Roles to Recruit</h4>
        </div>
        <span className="text-[11px] text-gray-400 font-semibold">
          {roles.reduce((acc, r) => acc + (Number(r.count) || 1), 0)} positions open
        </span>
      </div>

      {/* Creator Role Highlight if participating */}
      {creatorInfo && creatorInfo.participation && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold flex-shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{creatorInfo.role || 'Project Lead'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Filled by Creator
                </span>
              </div>
              {creatorInfo.skills && creatorInfo.skills.length > 0 && (
                <div className="text-[11px] text-indigo-300/80 mt-0.5">
                  Skills: {creatorInfo.skills.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Open Roles */}
      <div className="space-y-2">
        {roles.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-500 bg-gray-950/40 rounded-xl border border-gray-800/60">
            No open roles added yet. Add specific team roles you need to recruit below.
          </div>
        ) : (
          roles.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-800/80 p-3 rounded-xl border border-gray-700/60 text-xs transition-all hover:border-cyan-500/30">
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-cyan-300 truncate">{r.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                    {r.count} {r.count > 1 ? 'positions' : 'position'}
                  </span>
                </div>
                {r.skills && r.skills.length > 0 && (
                  <div className="text-[11px] text-gray-400 mt-1 truncate">
                    Skills: {r.skills.join(', ')}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRole(idx)}
                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors ml-2"
                title="Remove Role"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Suggested Quick Roles */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quick Add Popular Roles:</label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_ROLES.map(sugRole => (
            <button
              key={sugRole}
              type="button"
              onClick={() => handleAddRole(sugRole)}
              className="px-2.5 py-1 rounded-lg bg-gray-800/70 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 border border-gray-700/60 text-[11px] font-medium text-gray-300 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3 h-3 text-cyan-400" />
              <span>{sugRole}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Role Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-800">
        <input
          type="text"
          placeholder="Custom Role Title (e.g. AI Prompt Engineer)"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Count (Default: 1)"
          value={roleCount}
          onChange={(e) => setRoleCount(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          placeholder="Skills required (comma-separated)"
          value={roleSkills}
          onChange={(e) => setRoleSkills(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
      </div>
      <button
        type="button"
        onClick={() => handleAddRole()}
        className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Custom Open Role</span>
      </button>
    </div>
  );
};

export default RoleBuilder;
