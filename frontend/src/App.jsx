// frontend/src/App.jsx
// 作用：这是React应用的顶层组件，负责管理整个应用的页面路由。
// 它会使用您创建的 Layout 和 AuthContext。

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import TasksPage from './pages/TasksPage';
import DiariesPage from './pages/DiariesPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { loading } = useAuth();

  // 在验证状态确定前显示加载指示
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">正在加载...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 使用您创建的Layout组件作为通用布局 */}
        <Route path="/" element={<Layout />}>
          {/* 公共路由 */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />

          {/* 受保护的路由，只有登录用户才能访问 */}
          <Route
            path="tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="diaries"
            element={
              <ProtectedRoute>
                <DiariesPage />
              </ProtectedRoute>
            }
          />
          
          {/* 可以添加一个404页面 */}
          <Route path="*" element={<div>页面未找到</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
