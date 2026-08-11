import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProjectCard from '../components/projects/ProjectCard';
import { fetchRecommendedProjects } from '../services/api';
import { Sparkles, Target } from 'lucide-react';

const Recommendations = () => {
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetchRecommendedProjects();
      setRecommendedProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>AI & Weighted Matching Recommendations</span>
          </h1>
          <p className="text-xs text-gray-400">Projects tailored specifically to your skill set, proficiency, and weekly availability</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : recommendedProjects.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 text-xs">
            No recommendations available. Try completing your profile skills!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProjects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Recommendations;
