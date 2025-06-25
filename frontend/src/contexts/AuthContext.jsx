// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api'; // 导入认证相关的 API

// 创建认证上下文
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 存储当前用户信息
  const [token, setToken] = useState(localStorage.getItem('token')); // 存储 JWT Token
  const [loading, setLoading] = useState(true); // 加载状态

  // 检查本地存储中的 token，并在应用加载时获取用户信息
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const response = await authApi.getMe(); // 调用后端 /me 接口验证 token 并获取用户
          setUser(response.data);
        } catch (error) {
          console.error('Token 验证失败:', error);
          localStorage.removeItem('token'); // 清除无效 token
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]); // 依赖 token 变化

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);
      const accessToken = response.data.access_token;
      localStorage.setItem('token', accessToken); // 将 token 存储到本地
      setToken(accessToken); // 更新 token 状态，触发 useEffect 重新验证用户
      return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error; // 抛出错误以便组件处理
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await authApi.register(username, password, email);
      // 注册成功后可以选择自动登录
      await login(username, password);
      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); // 清除本地存储的 token
    setToken(null);
    setUser(null);
  };

  // 提供给子组件的值
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user, // 简化判断是否登录
    login,
    register,
    logout,
    setUser, // 允许更新用户信息 (例如，当用户资料更新后)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义 Hook，方便在组件中使用认证上下文
export const useAuth = () => {
  return useContext(AuthContext);
};
