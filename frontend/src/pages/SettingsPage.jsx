// frontend/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../api/index'; // 确保从 api/index.js 导入

const SettingsPage = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState({ message: '', type: '' }); // 用于显示保存状态

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await notificationsApi.getSettings();
                setSettings(response.data);
            } catch (err) {
                console.error("无法加载设置", err);
                setError('无法加载您的通知设置，请稍后重试。');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveStatus({ message: '保存中...', type: 'info' });
        try {
            await notificationsApi.updateSettings(settings);
            setSaveStatus({ message: '设置已成功保存！', type: 'success' });
        } catch (err) {
            console.error("保存设置失败", err);
            setSaveStatus({ message: err.response?.data?.detail || '保存失败，请检查您的输入。', type: 'error' });
        }
    };

    if (loading) {
        return <div className="text-center p-8">正在加载设置...</div>;
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">通知设置</h1>
            <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                
                {/* Email Settings */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">邮件通知</legend>
                    <div className="flex items-center mb-4">
                        <input type="checkbox" id="email_enabled" name="email_enabled" checked={settings.email_enabled || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="email_enabled" className="ml-3 block text-sm font-medium text-gray-700">启用邮件通知</label>
                    </div>
                    {settings.email_enabled && (
                        <div>
                            <label htmlFor="email_address" className="block text-sm font-medium text-gray-700">接收邮箱地址</label>
                            <input type="email" id="email_address" name="email_address" value={settings.email_address || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="user@example.com" />
                        </div>
                    )}
                </fieldset>

                {/* WeCom Settings */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">企业微信机器人</legend>
                    <div className="flex items-center mb-4">
                        <input type="checkbox" id="wecom_enabled" name="wecom_enabled" checked={settings.wecom_enabled || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="wecom_enabled" className="ml-3 block text-sm font-medium text-gray-700">启用企业微信通知</label>
                    </div>
                    {settings.wecom_enabled && (
                        <div>
                            <label htmlFor="wecom_webhook_url" className="block text-sm font-medium text-gray-700">Webhook URL</label>
                            <input type="url" id="wecom_webhook_url" name="wecom_webhook_url" value={settings.wecom_webhook_url || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..." />
                        </div>
                    )}
                </fieldset>
                
                {/* DingTalk Settings (可根据需要添加) */}
                {/* Telegram Settings (可根据需要添加) */}

                <div className="flex items-center justify-end space-x-4">
                    {saveStatus.message && (
                        <span className={`text-sm ${
                            saveStatus.type === 'success' ? 'text-green-600' : 
                            saveStatus.type === 'error' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                            {saveStatus.message}
                        </span>
                    )}
                    <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-md transition-colors disabled:opacity-50" disabled={saveStatus.type === 'info'}>
                        {saveStatus.type === 'info' ? '保存中...' : '保存设置'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
