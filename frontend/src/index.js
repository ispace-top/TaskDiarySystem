// frontend/src/api/index.js
import axios from 'axios';

// 从环境变量中获取后端 API URL
// 在开发环境中，这个变量会在 Vite 配置中被注入
// 在 Docker 环境中，这会通过 Dockerfile 或 docker-compose.yml 注入
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：在每个请求中添加 JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理 401 未授权响应
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token 过期或无效，清除本地存储的 token 并跳转到登录页
      localStorage.removeItem('token');
      // 可以添加一个全局事件或者直接进行页面跳转，例如：
      // window.location.href = '/login';
      console.warn('认证失败或过期，请重新登录。');
    }
    return Promise.reject(error);
  }
);

// --- 认证相关 API ---
export const authApi = {
  register: (username, password, email) => api.post('/register', { username, password, email }),
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return api.post('/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getMe: () => api.get('/me'),
};

// --- 任务相关 API ---
export const tasksApi = {
  getTasks: (params = {}) => api.get('/tasks/', { params }),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  createTask: (taskData) => api.post('/tasks/', taskData),
  updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};

// --- 日记相关 API ---
export const diariesApi = {
  getDiaries: (params = {}) => api.get('/diaries/', { params }),
  getDiary: (diaryId, decrypt = false) => api.get(`/diaries/${diaryId}`, { params: { decrypt } }),
  createDiary: (diaryData) => api.post('/diaries/', diaryData),
  updateDiary: (diaryId, diaryData) => api.put(`/diaries/${diaryId}`, diaryData),
  deleteDiary: (diaryId) => api.delete(`/diaries/${diaryId}`),
  getDiaryStats: () => api.get('/diaries/stats/summary'),
};

// --- 通知相关 API (占位，待后端实现) ---
export const notificationsApi = {
  // sendNotification: (data) => api.post('/notifications/send', data),
  // getNotificationSettings: () => api.get('/notifications/settings'),
  // updateNotificationSettings: (settings) => api.put('/notifications/settings', settings),
};

export default api;
