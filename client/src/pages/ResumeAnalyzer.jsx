import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ScoreGauge from '../components/resume/ScoreGauge';
import ProjectCard from '../components/projects/ProjectCard';
import { analyzeResumeApi, fetchResumeHistory, syncProfileSkillsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, UploadCloud, Bot, Sparkles, CheckCircle2, 
  AlertTriangle, RefreshCw, Plus, Check, Trash2, ArrowRight 
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const { user, updateUserProfileState } = useAuth();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetchResumeHistory();
      setHistory(res.data || []);
      if (res.data && res.data.length > 0) {
        setAnalysisResult(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f) => {
    setError('');
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await analyzeResumeApi(formData);
      setAnalysisResult(res.data.analysis);
      setRecommendedProjects(res.data.recommendedProjects || []);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume with Grok AI.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSyncSkills = async () => {
    if (!analysisResult?.missingProfileSkills || analysisResult.missingProfileSkills.length === 0) return;

    try {
      const res = await syncProfileSkillsApi(analysisResult.missingProfileSkills);
      updateUserProfileState({ skills: res.data.skills });
      setSyncedSuccess(true);
      setTimeout(() => setSyncedSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sync skills.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header Title Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>xAI Grok API Powered</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Resume Analyzer</h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Upload your PDF resume to extract skills, evaluate ATS keyword coverage, receive actionable recommendations, and sync detected skills to your profile.
            </p>
          </div>
        </div>

        {/* Upload Dropzone Section */}
        <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center space-y-4 relative">
          
          <form 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${
              dragActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
            }`}
          >
            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
            />

            <label htmlFor="resume-upload" className="cursor-pointer space-y-3 block">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {file ? file.name : 'Drag & Drop PDF Resume or Click to Browse'}
                </span>
                <span className="text-xs text-gray-500 block mt-1">Supports PDF format up to 10MB</span>
              </div>
            </label>
          </form>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-lg flex items-center justify-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {file && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="gradient-btn px-8 py-3 rounded-xl font-bold text-white text-xs shadow-xl inline-flex items-center space-x-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Grok AI Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>Start Grok AI Resume Analysis</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ANALYSIS RESULTS DASHBOARD */}
        {analysisResult && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Score Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Circular Score Gauge */}
              <ScoreGauge 
                score={analysisResult.overallScore || 82} 
                label={`Analysis for ${analysisResult.fileName}`} 
              />

              {/* Sub-Score Category Breakdown */}
              <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quality Sub-Scores</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Skills Demonstration</span>
                      <span className="text-cyan-300 font-bold">{analysisResult.scoreCategoryBreakdown?.skills || 85}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${analysisResult.scoreCategoryBreakdown?.skills || 85}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Project Quality</span>
                      <span className="text-indigo-300 font-bold">{analysisResult.scoreCategoryBreakdown?.projects || 80}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${analysisResult.scoreCategoryBreakdown?.projects || 80}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>ATS Keyword Coverage</span>
                      <span className="text-purple-300 font-bold">{analysisResult.atsAnalysis?.coveragePercentage || 74}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysisResult.atsAnalysis?.coveragePercentage || 74}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Structure & Clarity</span>
                      <span className="text-emerald-300 font-bold">{analysisResult.scoreCategoryBreakdown?.structure || 88}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisResult.scoreCategoryBreakdown?.structure || 88}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Skill Sync Banner */}
            {analysisResult.missingProfileSkills && analysisResult.missingProfileSkills.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>{analysisResult.missingProfileSkills.length} skills detected in your resume are missing from your profile!</span>
                  </h4>
                  <p className="text-xs text-gray-300">
                    Detected missing skills: {analysisResult.missingProfileSkills.join(', ')}
                  </p>
                </div>

                <button
                  onClick={handleSyncSkills}
                  disabled={syncedSuccess}
                  className="gradient-btn px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg flex items-center space-x-1.5 flex-shrink-0"
                >
                  {syncedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Synced to Profile!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Sync All Skills to Profile</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Actionable Recommendations */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span>Grok AI Actionable Recommendations</span>
              </h3>

              <div className="space-y-3">
                {analysisResult.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-cyan-300 text-sm">{rec.title}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        rec.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1">
                      <p><span className="text-gray-500 font-semibold">Problem:</span> {rec.problem}</p>
                      <p><span className="text-gray-500 font-semibold">Recommendation:</span> {rec.recommendation}</p>
                      <p><span className="text-gray-500 font-semibold">Suggested Action:</span> {rec.suggestedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Skills Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Strong Skills Demonstrated</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsAnalysis?.strongSkills?.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 text-xs font-medium border border-emerald-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Mentioned Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsAnalysis?.mentionedSkills?.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-300 text-xs font-medium border border-cyan-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Recommended Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillsAnalysis?.missingRecommendedSkills?.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 text-xs font-medium border border-amber-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Matched Projects */}
            {recommendedProjects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Projects Matching Your Resume Skills</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedProjects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ResumeAnalyzer;
