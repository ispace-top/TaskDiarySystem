import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">
                    仪表盘（调试模式）
                </h1>
                <p className="text-gray-600 mt-2">
                    如果您能看到此页面，说明路由和基本渲染是正常的。
                </p>
                <p className="text-gray-600 mt-2">
                    当前用户: <span className="font-bold text-indigo-600">{user ? user.username : '加载中...'}</span>
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">快捷操作</h2>
                <div className="flex flex-col space-y-3">
                    <Link to="/tasks" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-center transition-colors">
                        前往任务列表
                    </Link>
                    <Link to="/diaries" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-center transition-colors">
                        前往日记列表
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
