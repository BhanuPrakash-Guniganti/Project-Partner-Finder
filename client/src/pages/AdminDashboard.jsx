import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { fetchAdminStats, fetchAdminUsers, toggleUserStatus, fetchAdminProjects, fetchAdminReports, updateReportStatus } from '../services/api';
import { ShieldAlert, Users, Briefcase, FileText, CheckCircle, Ban, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, pRes, rRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(),
        fetchAdminProjects(),
        fetchAdminReports()
      ]);
      setStats(sRes.data);
      setUsersList(uRes.data || []);
      setProjectsList(pRes.data || []);
      setReportsList(rRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await toggleUserStatus(userId);
      setUsersList(usersList.map(u => u._id === userId ? res.data : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Platform Administration</h1>
            <p className="text-xs text-gray-400">User moderation, project controls, reports management, and analytics</p>
          </div>
        </div>

        {/* Analytics Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-extrabold text-cyan-400">{stats?.totalUsers || 0}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Total Users</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-extrabold text-indigo-400">{stats?.totalProjects || 0}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Total Projects</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-extrabold text-purple-400">{stats?.activeTeams || 0}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Active Teams</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-extrabold text-emerald-400">{stats?.totalApplications || 0}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Applications</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-extrabold text-cyan-300">{stats?.teamFormationRate || 0}%</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Team Rate</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-extrabold text-amber-400">{stats?.pendingReports || 0}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Pending Reports</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400'
            }`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'projects' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400'
            }`}
          >
            Projects Moderation ({projectsList.length})
          </button>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-2xl border border-gray-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Skills</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-gray-900/40">
                    <td className="p-4 font-bold text-white">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-4 uppercase font-semibold text-cyan-400">{u.role}</td>
                    <td className="p-4 max-w-xs truncate">{u.skills?.map(s => s.name || s).join(', ')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                          u.status === 'active' ? 'bg-red-950/40 text-red-400 hover:bg-red-900/60' : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="glass-panel rounded-2xl border border-gray-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {projectsList.map(p => (
                  <tr key={p._id} className="hover:bg-gray-900/40">
                    <td className="p-4 font-bold text-white">{p.title}</td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4">{p.type}</td>
                    <td className="p-4 text-cyan-300">{p.ownerId?.name || 'Owner'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
