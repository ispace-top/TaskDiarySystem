// frontend/src/components/ProtectedRoute.jsx
// 作用：这是一个路由守卫组件。如果用户未登录，它会将其重定向到登录页面，从而保护需要认证才能访问的页面。

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 将用户重定向到登录页
    // state={{ from: location }} 允许我们在登录后将用户导航回他们最初想访问的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用户已认证，则渲染子组件（即受保护的页面）
  return children;
};

export default ProtectedRoute;
