// frontend/src/pages/AuthPage.jsx

import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function AuthPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/auth/register') {
            setIsRegister(true);
        } else {
            setIsRegister(false);
        }
        setError('');
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await register(username, password, email);
                alert('注册成功！请登录。');
                navigate('/auth/login'); // 注册成功后跳转到登录页
            } else {
                await login(username, password);
                navigate('/dashboard'); // 登录成功后跳转到仪表盘
            }
        } catch (err) {
            console.error(`${isRegister ? '注册' : '登录'}失败`, err);
            let errorMessage = '操作失败，请重试。';
            if (err.response && err.response.data && err.response.data.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(detail => detail.msg).join('; ');
                } else if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    {isRegister ? '注册' : '登录'}
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            用户名
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    {isRegister && (
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                邮箱 (可选)
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            密码
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    {isRegister ? (
                        <p className="text-gray-600">
                            已有账号？{' '}
                            <button
                                onClick={() => navigate('/auth/login')}
                                className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none"
                                disabled={loading}
                            >
                                立即登录
                            </button>
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            没有账号？{' '}
                            <button
                                onClick={() => navigate('/auth/register')}
                                className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none"
                                disabled={loading}
                            >
                                立即注册
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
