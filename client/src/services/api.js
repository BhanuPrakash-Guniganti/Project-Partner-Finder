import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const fetchMe = () => API.get('/auth/me');

// User & Profile APIs
export const fetchProfile = () => API.get('/users/me');
export const updateProfile = (data) => API.put('/users/me', data);
export const updateOnboarding = (data) => API.put('/users/me/onboarding', data);
export const searchCandidates = (params) => API.get('/users/search', { params });
export const fetchUserById = (id, projectId) => API.get(`/users/${id}`, { params: { projectId } });

// Project APIs
export const fetchProjects = (params) => API.get('/projects', { params });
export const fetchMyProjects = () => API.get('/projects/my-projects');
export const fetchProjectById = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Matching & Recommendations APIs
export const fetchRecommendedProjects = () => API.get('/matches/projects');
export const fetchRecommendedCandidates = (projectId) => API.get(`/matches/candidates/${projectId}`);

// Application & Invitation APIs
export const applyToProject = (projectId, data) => API.post(`/applications/projects/${projectId}/apply`, data);
export const inviteCandidate = (data) => API.post('/applications/invite', data);
export const fetchUserApplications = () => API.get('/applications/user');
export const fetchProjectApplications = (projectId) => API.get(`/applications/projects/${projectId}`);
export const respondApplication = (id, status) => API.patch(`/applications/${id}`, { status });

// Team & Workspace APIs
export const fetchUserTeams = () => API.get('/teams/user');
export const fetchTeamByProjectId = (projectId) => API.get(`/teams/project/${projectId}`);
export const updateTeamMember = (projectId, data) => API.patch(`/teams/project/${projectId}/members`, data);

// Tasks, Milestones & Resources
export const fetchTasks = (projectId) => API.get(`/tasks/project/${projectId}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.patch(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const fetchMilestones = (projectId) => API.get(`/tasks/milestones/project/${projectId}`);
export const createMilestone = (data) => API.post('/tasks/milestones', data);
export const updateMilestone = (id, data) => API.patch(`/tasks/milestones/${id}`, data);

export const fetchResources = (projectId) => API.get(`/tasks/resources/project/${projectId}`);
export const createResource = (data) => API.post('/tasks/resources', data);

// Real-time Chat APIs
export const fetchDirectMessages = (userId) => API.get(`/chat/direct/${userId}`);
export const fetchProjectMessages = (projectId) => API.get(`/chat/project/${projectId}`);
export const sendMessageApi = (data) => API.post('/chat/send', data);

// Notification APIs
export const fetchNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');

// Resume Analyzer APIs
export const analyzeResumeApi = (formData) => API.post('/resume/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const fetchResumeHistory = () => API.get('/resume/history');
export const fetchResumeById = (id) => API.get(`/resume/${id}`);
export const deleteResumeAnalysis = (id) => API.delete(`/resume/${id}`);
export const syncProfileSkillsApi = (skillsToAdd) => API.post('/resume/sync-profile', { skillsToAdd });

// Admin APIs
export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchAdminUsers = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/status`);
export const fetchAdminProjects = () => API.get('/admin/projects');
export const submitReport = (data) => API.post('/admin/reports', data);
export const fetchAdminReports = () => API.get('/admin/reports');
export const updateReportStatus = (id, data) => API.patch(`/admin/reports/${id}`, data);

export default API;
