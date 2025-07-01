// frontend/src/pages/DiaryStatsPage.jsx
import React, { useState, useEffect } from 'react';
import { diariesApi } from '../api';

const DiaryStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    diariesApi.getDiaryStats()
      .then(response => {
        setStats(response.data);
      })
      .catch(err => {
        console.error("获取统计数据失败", err);
        setError("无法加载日记统计数据。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-8">加载统计数据中...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
  }

  if (!stats || stats.total_entries === 0) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            <h1 className="text-3xl font-bold mb-6">日记统计</h1>
            <p>还没有足够的日记来进行统计，快去写一篇吧！</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">日记统计</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">总日记数</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.total_entries}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">总字数</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.total_words}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">平均每篇字数</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.average_words_per_entry.toFixed(1)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">打卡频率</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.check_in_frequency_percentage.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">每日评级分布</h2>
          {Object.keys(stats.daily_ratings_distribution).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(stats.daily_ratings_distribution).map(([rating, count]) => (
                <li key={rating} className="flex justify-between items-center">
                  <span className="font-medium">{rating}</span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">{count} 次</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">暂无评级数据。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryStatsPage;
