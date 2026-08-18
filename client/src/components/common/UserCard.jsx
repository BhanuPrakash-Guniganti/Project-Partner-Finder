import React from 'react';
import { useNavigate } from 'react-router-dom';
import SkillBadge from './SkillBadge';
import { MessageSquare, UserCheck, CheckCircle2 } from 'lucide-react';

const UserCard = ({ userCandidate, onConnect }) => {
  const navigate = useNavigate();

  if (!userCandidate) return null;

  const matchScore = userCandidate.matchPercentage || userCandidate.matchScore || 88;
  const skills = userCandidate.skills || ['React', 'Node.js', 'MongoDB'];

  return (
    <div className="glass-panel p-5 rounded-3xl border border-gray-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group">
      
      {/* User Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white font-extrabold flex items-center justify-center text-sm shadow-md overflow-hidden">
              {userCandidate.avatar ? (
                <img src={userCandidate.avatar} alt={userCandidate.name} className="w-full h-full object-cover" />
              ) : (
                userCandidate.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-gray-900" title="Online" />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
              {userCandidate.name}
            </h3>
            <p className="text-xs text-cyan-400 truncate">{userCandidate.role || 'Full Stack Developer'}</p>
            <span className="text-[10px] text-gray-400 truncate block mt-0.5">{userCandidate.college || 'University'}</span>
          </div>
        </div>

        {/* Skill Match Badge */}
        <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-[10px] font-extrabold font-mono flex-shrink-0">
          {matchScore}% Match
        </span>
      </div>

      {/* Skills Badges */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {skills.slice(0, 4).map(skill => (
          <SkillBadge key={skill} skill={skill} variant="cyan" />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-800/80">
        <button
          onClick={() => onConnect ? onConnect(userCandidate) : navigate('/chat', { state: { recipient: userCandidate } })}
          className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1.5 shadow-md"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Connect</span>
        </button>

        <button
          onClick={() => navigate(`/candidates/${userCandidate._id}`)}
          className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          View Profile
        </button>
      </div>

    </div>
  );
};

export default UserCard;
