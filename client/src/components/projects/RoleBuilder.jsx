import React, { useState } from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';

const RoleBuilder = ({ roles = [], onChange }) => {
  const [roleTitle, setRoleTitle] = useState('');
  const [roleCount, setRoleCount] = useState(1);
  const [roleSkills, setRoleSkills] = useState('');

  const handleAddRole = () => {
    if (!roleTitle.trim()) return;
    const skillsArray = roleSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newRole = {
      title: roleTitle.trim(),
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
    <div className="space-y-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
      <div className="flex items-center space-x-2">
        <UserCheck className="w-4 h-4 text-cyan-400" />
        <h4 className="text-sm font-bold text-white">Dynamic Role Builder</h4>
      </div>

      {/* Existing Roles */}
      <div className="space-y-2">
        {roles.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-800/80 p-3 rounded-lg border border-gray-700/60 text-xs">
            <div>
              <span className="font-bold text-cyan-300">{r.title}</span>
              <span className="text-gray-400 ml-2">({r.count} required)</span>
              {r.skills && r.skills.length > 0 && (
                <div className="text-[11px] text-gray-400 mt-1">
                  Skills: {r.skills.join(', ')}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveRole(idx)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Role Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-800">
        <input
          type="text"
          placeholder="Role Title (e.g. Frontend Developer)"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Count"
          value={roleCount}
          onChange={(e) => setRoleCount(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={roleSkills}
          onChange={(e) => setRoleSkills(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
      </div>
      <button
        type="button"
        onClick={handleAddRole}
        className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Open Role</span>
      </button>
    </div>
  );
};

export default RoleBuilder;
