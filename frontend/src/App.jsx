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
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
          <Route path="tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="diaries" element={<ProtectedRoute><DiariesPage /></ProtectedRoute>} />
          <Route path="*" element={<div>页面未找到</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;