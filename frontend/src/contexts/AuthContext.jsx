// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 导入 apiClient 和新的 authApi 方法
import apiClient, { authApi } from '../api/index';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 这个 effect 在应用加载时运行一次，用于检查本地是否存在有效的 token
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // 使用修正后的 authApi.getMe() 方法
          const response = await authApi.getMe();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token 无效或已过期", error);
          localStorage.removeItem('token'); // 清除无效 token
        }
      }
      // 无论成功与否，最后都必须结束加载状态，以显示页面
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      // 使用修正后的 authApi.login() 方法
      const response = await authApi.login(username, password);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // 登录成功后，立即获取用户信息
      const userResponse = await authApi.getMe();
      setUser(userResponse.data);
      setIsAuthenticated(true);
      navigate('/tasks'); // 登录后跳转到任务页
    } catch (error) {
      console.error("登录失败", error);
      throw error; // 抛出错误以便在 AuthPage 中显示
    }
  };

  const register = async (username, password, email) => {
    try {
        // 使用修正后的 authApi.register() 方法
        await authApi.register(username, password, email);
        // 注册成功后，自动为用户登录
        await login(username, password);
    } catch (error) {
        console.error("注册失败", error);
        throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login'); // 登出后跳转到登录页
  };

  const value = { user, isAuthenticated, loading, login, register, logout };

  // 在 AuthContext.Provider 外部添加一个事件监听器，用于处理 API 401 错误
  useEffect(() => {
    const handleAuthError = () => {
      // 当 api/index.js 中捕获到 401 错误时，会触发此事件
      logout();
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
