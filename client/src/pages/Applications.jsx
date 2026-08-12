import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchScoreBadge from '../components/matching/MatchScoreBadge';
import { fetchUserApplications, fetchMyProjects, fetchProjectApplications, respondApplication } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Send, Check, X, ArrowRight, UserCheck, Inbox, User } from 'lucide-react';

const Applications = () => {
  const { socket } = useSocket();
  const [userApplications, setUserApplications] = useState([]);
  const [incomingApplications, setIncomingApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'sent'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllApplications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewApplication = (newApp) => {
        setIncomingApplications(prev => {
          if (newApp._id && prev.some(a => a._id === newApp._id)) {
            return prev;
          }
          const appWithTitle = {
            ...newApp,
            projectTitle: newApp.projectId?.title || newApp.projectTitle || 'Project'
          };
          return [appWithTitle, ...prev];
        });
      };

      const handleStatusUpdate = (data) => {
        const { applicationId, status } = data;
        setUserApplications(prev => prev.map(app => 
          app._id === applicationId ? { ...app, status } : app
        ));
        setIncomingApplications(prev => prev.map(app => 
          app._id === applicationId ? { ...app, status } : app
        ));
      };

      socket.on('new_application', handleNewApplication);
      socket.on('application_status_updated', handleStatusUpdate);

      return () => {
        socket.off('new_application', handleNewApplication);
        socket.off('application_status_updated', handleStatusUpdate);
      };
    }
  }, [socket]);

  const loadAllApplications = async () => {
    setLoading(true);
    try {
      // 1. Fetch applications sent by user
      const userAppsRes = await fetchUserApplications();
      setUserApplications(userAppsRes.data || []);

      // 2. Fetch projects owned by user to load incoming applications
      const myProjRes = await fetchMyProjects();
      const myProjects = myProjRes.data || [];

      let allIncoming = [];
      for (const proj of myProjects) {
        try {
          const projAppsRes = await fetchProjectApplications(proj._id);
          if (projAppsRes.data && projAppsRes.data.length > 0) {
            allIncoming = [...allIncoming, ...projAppsRes.data.map(app => ({ ...app, projectTitle: proj.title }))];
          }
        } catch (e) {
          // ignore single project app fetch error
        }
      }
      setIncomingApplications(allIncoming);
      if (allIncoming.length === 0 && (userAppsRes.data || []).length > 0) {
        setActiveTab('sent');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await respondApplication(id, status);
      loadAllApplications();
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
          <p className="text-xs text-gray-400 mt-1">Review incoming candidate applications for your projects or track sent requests</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'incoming'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Incoming Applications ({incomingApplications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'sent'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>My Sent Requests & Invitations ({userApplications.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : activeTab === 'incoming' ? (
          /* TAB 1: INCOMING APPLICATIONS FOR PROJECT OWNER */
          incomingApplications.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 text-xs space-y-2">
              <UserCheck className="w-8 h-8 text-gray-600 mx-auto" />
              <div>No incoming project applications received yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingApplications.map(app => (
                <div key={app._id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-800/30 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/30">
                        {app.applicantId?.avatar ? (
                          <img src={app.applicantId.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          app.applicantId?.name?.charAt(0) || 'A'
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          Project: {app.projectTitle}
                        </span>
                        <h3 className="text-base font-bold text-white">{app.applicantId?.name || 'Applicant'}</h3>
                        <p className="text-xs text-gray-400">Requested Role: <span className="text-cyan-300 font-semibold">{app.requestedRole}</span></p>
                      </div>
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

                  {/* Actions for Project Owner */}
                  {app.status === 'Pending' && (
                    <div className="pt-2 border-t border-gray-800 flex justify-end space-x-2">
                      <button
                        onClick={() => handleRespond(app._id, 'Rejected')}
                        className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 rounded-lg flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleRespond(app._id, 'Accepted')}
                        className="gradient-btn px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center space-x-1 shadow-lg"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Application & Add to Team</span>
                      </button>
                    </div>
                  )}

                  {app.status === 'Accepted' && (
                    <div className="pt-2 border-t border-gray-800 flex justify-end">
                      <Link
                        to={`/workspace/${app.projectId?._id || app.projectId}`}
                        className="gradient-btn px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                      >
                        <span>Open Team Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* TAB 2: SENT APPLICATIONS & INVITATIONS */
          userApplications.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 text-xs">
              No sent applications or invitations.
            </div>
          ) : (
            <div className="space-y-4">
              {userApplications.map(app => (
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
          )
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Applications;
