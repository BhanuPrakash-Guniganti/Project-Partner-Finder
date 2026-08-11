import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import { fetchUserById } from '../services/api';
import { User, Github, Linkedin, ExternalLink, ArrowLeft, Mail, Clock } from 'lucide-react';

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    setLoading(true);
    try {
      const res = await fetchUserById(id);
      setCandidate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20">Candidate not found</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        <Link to="/candidates" className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidates</span>
        </Link>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-cyan-700/30 border-2 border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-2xl">
                {candidate.avatar ? (
                  <img src={candidate.avatar} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  candidate.name?.charAt(0) || 'C'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{candidate.name}</h1>
                <p className="text-xs text-cyan-400 font-semibold">{candidate.preferredRoles?.join(' • ') || 'Software Engineer'}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{candidate.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Candidate</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{candidate.bio || 'No bio provided.'}</p>
          </div>

          {/* Skills & Proficiency */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills & Proficiency</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {candidate.skills?.map(s => (
                <div key={s.name} className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800 text-xs flex justify-between items-center">
                  <span className="font-bold text-cyan-300">{s.name}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{s.proficiency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800 text-xs">
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[10px]">Weekly Availability</span>
              <span className="text-white font-semibold">{candidate.availability || '10-15 hrs/wk'}</span>
            </div>
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[10px]">Preferred Project Types</span>
              <span className="text-white font-semibold">{candidate.projectPreferences?.join(', ') || 'Side Project'}</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateProfile;
