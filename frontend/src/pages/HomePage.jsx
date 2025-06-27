import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="text-center bg-white p-12 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        欢迎来到日程备忘系统
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        高效管理您的任务，用心记录您的每一天。
      </p>
      {isAuthenticated ? (
        <div>
          <p className="text-xl mb-6">你好, <span className="font-semibold text-indigo-600">{user?.username || '用户'}</span>! 你想做什么？</p>
          <div className="flex justify-center space-x-4">
            <Link to="/tasks" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              查看任务
            </Link>
            <Link to="/diaries" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              写日记
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xl mb-6">请先登录或注册以开始使用。</p>
          <div className="flex justify-center space-x-4">
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              登录
            </Link>
            <Link to="/register" className="border border-indigo-600 text-indigo-600 hover:bg-indigo-100 font-bold py-3 px-6 rounded-lg transition-colors">
              注册
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};