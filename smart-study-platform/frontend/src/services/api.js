import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injection automatique du token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_study_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Gestion globale des erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('smart_study_token');
        localStorage.removeItem('smart_study_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Endpoints APIs
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const subjectApi = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const documentApi = {
  getAll: (subjectId) => api.get('/documents', { params: { subjectId } }),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const noteApi = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const quizApi = {
  getAll: (subjectId) => api.get('/quizzes', { params: { subjectId } }),
  getById: (id) => api.get(`/quizzes/${id}`),
  generate: (data) => api.post('/quizzes/generate', data),
  submit: (data) => api.post('/quizzes/submit', data),
  getAttempts: (quizId) => api.get('/quizzes/attempts', { params: { quizId } }),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

export const flashcardApi = {
  getAll: (params) => api.get('/flashcards', { params }),
  create: (data) => api.post('/flashcards', data),
  generate: (data) => api.post('/flashcards/generate', data),
  updateStatus: (id, status) => api.put(`/flashcards/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/flashcards/${id}`),
};

export const aiApi = {
  summarize: (data) => api.post('/ai/summarize', data),
  tutorChat: (data) => api.post('/ai/tutor', data),
  getTutorHistory: (params) => api.get('/ai/tutor/history', { params }),
  generateStudyPlan: (data) => api.post('/ai/study-plan', data),
  getStudyPlans: () => api.get('/ai/study-plan'),
  toggleSession: (planId, sessionId) => api.put(`/ai/study-plan/${planId}/sessions/${sessionId}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
