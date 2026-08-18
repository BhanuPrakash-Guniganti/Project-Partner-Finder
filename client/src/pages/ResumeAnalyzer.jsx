import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ScoreGauge from '../components/resume/ScoreGauge';
import ProjectCard from '../components/projects/ProjectCard';
import { analyzeResumeApi, fetchResumeHistory, syncProfileSkillsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FileText, UploadCloud, Bot, Sparkles, CheckCircle2, 
  AlertTriangle, RefreshCw, Plus, Check, Trash2, ArrowRight, 
  ShieldCheck, File, Folder, CheckSquare, Loader2, Lock 
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const { user, updateUserProfileState } = useAuth();
  const { showSuccess, showError } = useToast();

  const [file, setFile] = useState(null);
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  const processingSteps = [
    'Uploading resume...',
    'Extracting text & sections...',
    'Analyzing skills & experience...',
    'Checking project impact...',
    'Generating AI recommendations...'
  ];

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
      validateAndSetFile(e.dataTransfer.files[0]);
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
      showError('Only PDF files are supported.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      showError('File size exceeds 10MB limit.');
      return;
    }
    setFile(f);
    setFileSizeStr(`${(f.size / (1024 * 1024)).toFixed(1)} MB`);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError('');
    setProgressStep(0);

    // Simulate animated step progress
    const stepInterval = setInterval(() => {
      setProgressStep(prev => {
        if (prev < processingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await analyzeResumeApi(formData);
      clearInterval(stepInterval);
      setProgressStep(processingSteps.length - 1);
      
      setAnalysisResult(res.data.analysis);
      setRecommendedProjects(res.data.recommendedProjects || []);
      showSuccess('Resume analysis complete!');
      loadHistory();
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.message || 'Failed to analyze resume with Grok AI.');
      showError('Failed to analyze resume.');
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
      showSuccess('Skills synced to your profile!');
      setTimeout(() => setSyncedSuccess(false), 3000);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to sync skills.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* HERO SECTION */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 text-center space-y-3 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Resume Intelligence Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Know how strong your resume really is.
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Upload your resume and get AI-powered recommendations to improve it for internships and jobs.
          </p>
        </div>

        {/* UPLOAD CARD */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl">
          
          <form 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 transition-all text-center ${
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

            {!file ? (
              <label htmlFor="resume-upload" className="cursor-pointer space-y-4 block">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Upload your resume</h3>
                  <p className="text-xs text-gray-400 font-mono">PDF only • Maximum 10 MB</p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <span className="gradient-btn px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-md inline-flex items-center space-x-1.5">
                    <UploadCloud className="w-4 h-4" />
                    <span>Choose PDF</span>
                  </span>
                  <span className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 inline-flex items-center space-x-1.5">
                    <Folder className="w-4 h-4 text-gray-400" />
                    <span>Take from Files</span>
                  </span>
                </div>
              </label>
            ) : (
              /* FILE UPLOAD PREVIEW & ANALYZE ACTION */
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-3 max-w-md mx-auto text-left">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{file.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">{fileSizeStr || '2.4 MB'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 rounded-xl bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* ANALYZE BUTTON & PROCESSING STEPPER */}
                {!analyzing ? (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="gradient-btn px-8 py-3.5 rounded-2xl font-bold text-white text-xs shadow-xl inline-flex items-center space-x-2 transition-transform hover:scale-105"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Analyze Resume</span>
                  </button>
                ) : (
                  <div className="space-y-4 max-w-md mx-auto py-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-cyan-300">
                      <span>{processingSteps[progressStep]}</span>
                      <span className="font-mono">{Math.round(((progressStep + 1) / processingSteps.length) * 100)}%</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${((progressStep + 1) / processingSteps.length) * 100}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 text-left text-[11px] text-gray-400 pt-1">
                      {processingSteps.map((stepText, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          {idx < progressStep ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : idx === progressStep ? (
                            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-700 flex-shrink-0" />
                          )}
                          <span className={idx <= progressStep ? 'text-white font-medium' : 'text-gray-600'}>
                            {stepText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl flex items-center justify-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TRUST FOOTER / SECURITY BADGE */}
          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-center space-x-2 text-xs text-gray-400 font-medium">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Your resume is analyzed securely.</span>
          </div>
        </div>

        {/* ANALYSIS RESULTS DASHBOARD */}
        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Score Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Circular Score Gauge */}
              <ScoreGauge 
                score={analysisResult.overallScore || 85} 
                label={`Resume Match Score`} 
              />

              {/* Quality Sub-Score Breakdown */}
              <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quality Sub-Scores</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Skills Demonstration</span>
                      <span className="text-cyan-300 font-bold">{analysisResult.scoreCategoryBreakdown?.skills || 88}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${analysisResult.scoreCategoryBreakdown?.skills || 88}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Project Impact</span>
                      <span className="text-indigo-300 font-bold">{analysisResult.scoreCategoryBreakdown?.projects || 82}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${analysisResult.scoreCategoryBreakdown?.projects || 82}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>ATS Keyword Coverage</span>
                      <span className="text-purple-300 font-bold">{analysisResult.atsAnalysis?.coveragePercentage || 76}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysisResult.atsAnalysis?.coveragePercentage || 76}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Structure & Clarity</span>
                      <span className="text-emerald-300 font-bold">{analysisResult.scoreCategoryBreakdown?.structure || 90}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisResult.scoreCategoryBreakdown?.structure || 90}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Skill Sync Banner */}
            {analysisResult.missingProfileSkills && analysisResult.missingProfileSkills.length > 0 && (
              <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/40 bg-cyan-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center space-x-2">
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

            {/* AI Recommendations */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI Actionable Recommendations</span>
              </h3>

              <div className="space-y-3">
                {analysisResult.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-cyan-300 text-sm">{rec.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        rec.priority === 'High' ? 'bg-red-950/60 text-red-300 border border-red-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1">
                      <p><span className="text-gray-500 font-semibold">Recommendation:</span> {rec.recommendation}</p>
                      <p><span className="text-gray-500 font-semibold">Suggested Action:</span> {rec.suggestedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Matched Projects */}
            {recommendedProjects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Projects Matching Your Resume Skills</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
