// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskFormPage from './pages/TaskFormPage';
import TaskDetail from './pages/TaskDetail';
import DiariesPage from './pages/DiariesPage';
import DiaryFormPage from './pages/DiaryFormPage';
import DiaryDetail from './pages/DiaryDetail';
import TimelinePage from './pages/TimelinePage';
import DiaryStatsPage from './pages/DiaryStatsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout'; // 导入 Layout 组件

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    {/* 确保 AuthPage 能够处理登录和注册两个路径 */}
                    <Route path="/auth/login" element={<AuthPage />} />
                    <Route path="/auth/register" element={<AuthPage />} />

                    {/* 保护的路由，需要用户登录才能访问 */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}> {/* 使用 Layout 包裹需要导航栏的页面 */}
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route path="/tasks/new" element={<TaskFormPage />} />
                            <Route path="/tasks/edit/:id" element={<TaskFormPage />} />
                            <Route path="/tasks/:id" element={<TaskDetail />} />
                            <Route path="/diaries" element={<DiariesPage />} />
                            <Route path="/diaries/new" element={<DiaryFormPage />} />
                            <Route path="/diaries/edit/:id" element={<DiaryFormPage />} />
                            <Route path="/diaries/:id" element={<DiaryDetail />} />
                            <Route path="/timeline" element={<TimelinePage />} />
                            <Route path="/stats" element={<DiaryStatsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
