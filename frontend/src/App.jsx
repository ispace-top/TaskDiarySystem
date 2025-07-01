// frontend/src/App.jsx
import React from 'react';
// 1. Router 已被移到 main.jsx，这里不再需要导入它
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetail';
import TaskFormPage from './pages/TaskFormPage';
import DiariesPage from './pages/DiariesPage';
import DiaryDetailPage from './pages/DiaryDetail';
import DiaryFormPage from './pages/DiaryFormPage';
import DashboardPage from './pages/DashboardPage';
import TimelinePage from './pages/TimelinePage';
import DiaryStatsPage from './pages/DiaryStatsPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">正在加载...</div>
      </div>
    );
  }

  // 2. 移除这里的 <Router> 包裹
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        
        <Route path="tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="tasks/new" element={<ProtectedRoute><TaskFormPage /></ProtectedRoute>} />
        <Route path="tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
        <Route path="tasks/:id/edit" element={<ProtectedRoute><TaskFormPage /></ProtectedRoute>} />

        <Route path="diaries" element={<ProtectedRoute><DiariesPage /></ProtectedRoute>} />
        <Route path="diaries/new" element={<ProtectedRoute><DiaryFormPage /></ProtectedRoute>} />
        <Route path="diaries/:id" element={<ProtectedRoute><DiaryDetailPage /></ProtectedRoute>} />
        {/* 3. (额外修正) 修复了编辑日记时错误的组件路径 */}
        <Route path="diaries/:id/edit" element={<ProtectedRoute><DiaryFormPage /></ProtectedRoute>} />
        
        <Route path="timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
        <Route path="stats" element={<ProtectedRoute><DiaryStatsPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Fallback Route */}
        <Route path="*" element={<div>页面未找到</div>} />
      </Route>
    </Routes>
  );
}

export default App;
