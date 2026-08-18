import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import BottomNav from './components/common/BottomNav';
import { ToastProvider } from './context/ToastContext';

import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Candidates from './pages/Candidates';
import CandidateProfile from './pages/CandidateProfile';
import Recommendations from './pages/Recommendations';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Applications from './pages/Applications';
import Teams from './pages/Teams';
import TeamWorkspace from './pages/TeamWorkspace';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-[#0b0f19]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Authenticated Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/invitations" element={<Applications />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/workspace/:projectId" element={<TeamWorkspace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin Only Route */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}

export default App;
