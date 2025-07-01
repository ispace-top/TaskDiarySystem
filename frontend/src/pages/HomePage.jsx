import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">欢迎来到日程备忘系统</h1>
        <p className="text-lg text-gray-600 mb-8">高效管理您的任务，用心记录您的每一天。</p>
        <div className="flex justify-center space-x-4">
          <Link to="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            登录
          </Link>
          <Link to="/auth/register" className="border border-indigo-600 text-indigo-600 hover:bg-indigo-100 font-bold py-3 px-6 rounded-lg transition-colors">
            注册
          </Link>
        </div>
      </div>
    </div>
  );
};
export default HomePage;