import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MatchScoreBadge from '../matching/MatchScoreBadge';
import ExplainableMatchModal from '../matching/ExplainableMatchModal';
import { Clock, Users, Tag, ArrowRight, Calendar } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex justify-between items-start gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {project.type || 'Side Project'}
          </span>

          {project.matchScore !== undefined && (
            <MatchScoreBadge 
              score={project.matchScore} 
              onClick={() => setModalOpen(true)} 
            />
          )}
        </div>

        {/* Title & Description */}
        <div>
          <Link to={`/projects/${project._id}`} className="text-lg font-bold text-white hover:text-cyan-400 transition-colors line-clamp-1">
            {project.title}
          </Link>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Meta Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-1">
          <div className="flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{project.category || 'Web Development'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Team of {project.teamSize || 4}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{project.availability || '10-15 hrs/wk'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{project.duration || '1-2 months'}</span>
          </div>
        </div>

        {/* Required Skills Chips */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">Required Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills?.slice(0, 4).map(skill => (
              <span key={skill} className="px-2 py-0.5 rounded-md text-[11px] bg-gray-800 text-gray-300 font-medium border border-gray-700/60">
                {skill}
              </span>
            ))}
            {project.requiredSkills?.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">
                +{project.requiredSkills.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Owner & Action */}
      <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
            {project.ownerId?.avatar ? (
              <img src={project.ownerId.avatar} alt="Owner" className="w-full h-full rounded-full object-cover" />
            ) : (
              project.ownerId?.name?.charAt(0) || 'O'
            )}
          </div>
          <span className="text-xs text-gray-300 truncate max-w-[110px]">
            {project.ownerId?.name || 'Owner'}
          </span>
        </div>

        <Link
          to={`/projects/${project._id}`}
          className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Explainable Match Modal */}
      <ExplainableMatchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        matchScore={project.matchScore}
        matchBreakdown={project.matchBreakdown}
        reasons={project.reasons}
        title={`Match with ${project.title}`}
      />
    </div>
  );
};

export default ProjectCard;
