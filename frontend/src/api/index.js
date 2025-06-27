// frontend/src/api/index.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // 使用自定义事件或重定向
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authApi = {
  register: (username, password, email) => apiClient.post('/register', { username, password, email }),
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return apiClient.post('/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getMe: () => apiClient.get('/me'),
};

// --- Tasks ---
export const tasksApi = {
  getTasks: (params = {}) => apiClient.get('/tasks/', { params }),
  getTask: (taskId) => apiClient.get(`/tasks/${taskId}`),
  createTask: (taskData) => apiClient.post('/tasks/', taskData),
  updateTask: (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
};

// --- Diaries ---
export const diariesApi = {
  getDiaries: (params = {}) => apiClient.get('/diaries/', { params }),
  getDiary: (diaryId, decrypt = false) => apiClient.get(`/diaries/${diaryId}`, { params: { decrypt } }),
  createDiary: (diaryData) => apiClient.post('/diaries/', diaryData),
  updateDiary: (diaryId, diaryData) => apiClient.put(`/diaries/${diaryId}`, diaryData),
  deleteDiary: (diaryId) => apiClient.delete(`/diaries/${diaryId}`),
  getDiaryStats: () => apiClient.get('/diaries/stats/summary'),
};

// --- Notifications ---
export const notificationsApi = {
  getSettings: () => apiClient.get('/notifications/settings'),
  updateSettings: (settings) => apiClient.put('/notifications/settings', settings),
};

export default apiClient;