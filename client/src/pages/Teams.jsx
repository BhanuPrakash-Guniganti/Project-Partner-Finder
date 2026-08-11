import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { fetchUserTeams } from '../services/api';
import { Users, ArrowRight, Briefcase } from 'lucide-react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await fetchUserTeams();
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>My Joined Teams</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Teams and collaboration workspaces you are currently part of</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 text-xs space-y-2">
            <p>You are not currently a member of any project team.</p>
            <Link to="/projects" className="text-cyan-400 font-semibold hover:underline">Explore Open Projects →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => (
              <div key={team._id} className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{team.projectId?.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{team.projectId?.category}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
                    {team.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Team Members ({team.members?.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {team.members?.map(m => (
                      <div key={m.userId?._id || m._id} className="flex items-center space-x-2 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800 text-xs">
                        <span className="font-bold text-white">{m.userId?.name}</span>
                        <span className="text-[10px] text-cyan-400">({m.role})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex justify-end">
                  <Link
                    to={`/workspace/${team.projectId?._id}`}
                    className="gradient-btn px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Teams;
