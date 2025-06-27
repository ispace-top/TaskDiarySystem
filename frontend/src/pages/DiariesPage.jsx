// frontend/src/pages/DiariesPage.jsx
import React, { useState, useEffect } from 'react';
import { diariesApi } from '../api';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const DiariesPage = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  useEffect(() => {
    fetchDiaries();
  }, [filterStartDate, filterEndDate]); // 依赖过滤条件变化

  const fetchDiaries = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStartDate) {
        params.start_date = dayjs(filterStartDate).startOf('day').toISOString();
      }
      if (filterEndDate) {
        params.end_date = dayjs(filterEndDate).endOf('day').toISOString();
      }
      // 默认在列表页不解密，需要进入详情页才解密
      // params.decrypt = true; // 如果你想在列表页直接显示解密内容，可以设置此项

      const response = await diariesApi.getDiaries(params);
      setDiaries(response.data);
    } catch (err) {
      console.error('获取日记失败:', err);
      setError('未能加载日记列表。');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiary = async (diaryId) => {
    if (window.confirm('您确定要删除此日记吗？此操作不可逆！')) {
      try {
        await diariesApi.deleteDiary(diaryId);
        fetchDiaries(); // 重新获取日记列表
      } catch (err) {
        console.error('删除日记失败:', err);
        setError('未能删除日记。');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-600 text-lg">加载中...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">我的日记</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* 过滤和操作区域 */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <label htmlFor="filterStartDate" className="text-gray-700 text-sm font-medium">从:</label>
          <input
            type="date"
            id="filterStartDate"
            value={filterStartDate ? dayjs(filterStartDate).format('YYYY-MM-DD') : ''}
            onChange={(e) => setFilterStartDate(e.target.value ? new Date(e.target.value) : null)}
            className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />

          <label htmlFor="filterEndDate" className="text-gray-700 text-sm font-medium">到:</label>
          <input
            type="date"
            id="filterEndDate"
            value={filterEndDate ? dayjs(filterEndDate).format('YYYY-MM-DD') : ''}
            onChange={(e) => setFilterEndDate(e.target.value ? new Date(e.target.value) : null)}
            className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
           <button
            onClick={() => { setFilterStartDate(null); setFilterEndDate(null); }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md shadow-sm transition-colors text-sm"
          >
            清除筛选
          </button>
        </div>
        <Link
          to="/diaries/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors"
        >
          记录新日记
        </Link>
      </div>

      {/* 日记列表 */}
      {diaries.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          没有找到日记。
        </div>
      ) : (
        <ul className="space-y-4">
          {diaries.map((diary) => (
            <li
              key={diary.id}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 border-l-8 border-purple-400"
            >
              <div className="flex-grow mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {diary.title || `日记 - ${dayjs(diary.entry_date).format('LL')}`}
                  </h3>
                  {diary.is_encrypted && (
                    <span className="ml-3 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      加密
                    </span>
                  )}
                  {diary.daily_rating && (
                    <span className="ml-3 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      评级: {diary.daily_rating}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  日期: {dayjs(diary.entry_date).format('LL')}
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  {/* 如果是加密日记，这里只显示提示，具体内容在详情页解密 */}
                  {diary.is_encrypted ? "该日记已加密，请点击查看详情以解密。" : (diary.content.length > 200 ? `${diary.content.substring(0, 200)}...` : diary.content)}
                </p>
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <Link
                  to={`/diaries/${diary.id}`}
                  className="py-2 px-4 rounded-md text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white text-center"
                >
                  查看详情
                </Link>
                <button
                  onClick={() => handleDeleteDiary(diary.id)}
                  className="py-2 px-4 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 text-white"
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiariesPage;
