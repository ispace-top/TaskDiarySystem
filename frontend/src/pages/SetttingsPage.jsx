// frontend/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../api';

const SettingsPage = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await notificationsApi.getSettings();
                setSettings(response.data);
            } catch (error) {
                console.error("无法加载设置", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await notificationsApi.updateSettings(settings);
            alert("设置已保存！");
        } catch (error) {
            alert("保存失败！");
        }
    };
    
    // ... (这里将是渲染设置表单的 JSX) ...
    
    if (loading) return <p>加载中...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">通知设置</h1>
            {/* 示例：企业微信设置 */}
            <div>
                <label>企业微信 Webhook URL</label>
                <input 
                    type="text" 
                    value={settings.wecom_webhook_url || ''}
                    onChange={e => setSettings({...settings, wecom_webhook_url: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
            </div>
            <button onClick={handleSave} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
                保存设置
            </button>
        </div>
    );
};

export default SettingsPage;