// frontend/src/components/Layout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            日程备忘系统
          </Link>
          <nav>
            {isAuthenticated ? (
              <ul className="flex space-x-6 items-center">
                <li><Link to="/tasks" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">任务</Link></li>
                <li><Link to="/diaries" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">日记</Link></li>
                <li className="text-gray-600">欢迎, {user?.username}</li>
                <li>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors"
                  >
                    退出
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="flex space-x-6 items-center">
                <li><Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">登录</Link></li>
                <li>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors"
                  >
                    注册
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>

      {/* --- 调试关键区域 --- */}
      {/* 我们给主要内容区域添加了显眼的背景色和边框 */}
      <main 
        className="flex-grow container mx-auto p-4 py-8"
        style={{ backgroundColor: '#e0f7fa', border: '5px solid red' }}
      >
        <h2 style={{color: 'black', fontSize: '20px', fontWeight: 'bold'}}>主内容区域 (红色边框内):</h2>
        <Outlet /> {/* DashboardPage 的内容应该会出现在这里 */}
      </main>
      {/* -------------------- */}

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} 日程安排与任务备忘系统. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
