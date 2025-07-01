// frontend/src/api/index.js
import axios from 'axios';

// 从 .env.local 文件中获取后端的基地址
// 它应该是类似 'http://127.0.0.1:8000/api/v1'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：在每个请求头中自动添加认证 Token
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

// 响应拦截器：处理认证失败 (401) 的情况
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 如果 token 无效或过期，清除本地 token 并触发一个全局事件
      localStorage.removeItem('token');
      // AuthContext 可以监听此事件来更新 UI
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

// --- Auth API 方法 ---
export const authApi = {
  // 注册接口
  register: (username, password, email) => apiClient.post('/auth/register', { username, password, email }),
  // 登录接口
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return apiClient.post('/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  // 获取当前用户信息接口
  getMe: () => apiClient.get('/auth/me'),
};

// --- Tasks API 方法 ---
export const tasksApi = {
  getTasks: (params = {}) => apiClient.get('/tasks/', { params }),
  getTask: (taskId) => apiClient.get(`/tasks/${taskId}`),
  createTask: (taskData) => apiClient.post('/tasks/', taskData),
  updateTask: (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
};

// --- Diaries API 方法 ---
export const diariesApi = {
  getDiaries: (params = {}) => apiClient.get('/diaries/', { params }),
  getDiary: (diaryId, decrypt = false) => apiClient.get(`/diaries/${diaryId}`, { params: { decrypt } }),
  createDiary: (diaryData) => apiClient.post('/diaries/', diaryData),
  updateDiary: (diaryId, diaryData) => apiClient.put(`/diaries/${diaryId}`, diaryData),
  deleteDiary: (diaryId) => apiClient.delete(`/diaries/${diaryId}`),
  getDiaryStats: () => apiClient.get('/diaries/stats/summary'),
};

// --- Notifications API 方法 ---
export const notificationsApi = {
  getSettings: () => apiClient.get('/notifications/settings'),
  updateSettings: (settings) => apiClient.put('/notifications/settings', settings),
};

export default apiClient;
