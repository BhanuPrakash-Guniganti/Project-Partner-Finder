import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import { fetchUserApplications, respondApplication } from '../services/api';
import { Send, Check, X, ArrowRight, Clock } from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await fetchUserApplications();
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await respondApplication(id, status);
      loadApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Send className="w-6 h-6 text-cyan-400" />
            <span>Applications & Invitations Hub</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage project join requests and invitations</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 text-xs">
            No active applications or invitations.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app._id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {app.type === 'invitation' ? 'Project Invitation' : 'Sent Application'}
                    </span>
                    <h3 className="text-lg font-bold text-white">{app.projectId?.title}</h3>
                    <p className="text-xs text-gray-400">Requested Role: <span className="text-cyan-300 font-semibold">{app.requestedRole}</span></p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {app.matchScore && <MatchScoreBadge score={app.matchScore} />}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      app.status === 'Rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {app.message && (
                  <p className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800 italic">
                    "{app.message}"
                  </p>
                )}

                {/* Actions for invitations */}
                {app.type === 'invitation' && app.status === 'Pending' && (
                  <div className="pt-2 border-t border-gray-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleRespond(app._id, 'Declined')}
                      className="px-4 py-1.5 bg-gray-800 text-xs font-semibold text-gray-300 rounded-lg"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(app._id, 'Accepted')}
                      className="gradient-btn px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Invitation & Join Team</span>
                    </button>
                  </div>
                )}

                {app.status === 'Accepted' && (
                  <div className="pt-2 border-t border-gray-800 flex justify-end">
                    <Link
                      to={`/workspace/${app.projectId?._id}`}
                      className="gradient-btn px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Applications;
