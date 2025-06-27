// frontend/src/components/DiaryForm.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

const DiaryForm = ({ initialData = {}, onSubmit, isLoading, error }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [isEncrypted, setIsEncrypted] = useState(initialData.is_encrypted || false);
  const [entryDate, setEntryDate] = useState(initialData.entry_date ? new Date(initialData.entry_date) : new Date());
  const [dailyRating, setDailyRating] = useState(initialData.daily_rating || '');

  useEffect(() => {
    setTitle(initialData.title || '');
    setContent(initialData.content || '');
    setIsEncrypted(initialData.is_encrypted || false);
    setEntryDate(initialData.entry_date ? new Date(initialData.entry_date) : new Date());
    setDailyRating(initialData.daily_rating || '');
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const diaryData = {
      title: title || null,
      content,
      is_encrypted: isEncrypted,
      entry_date: dayjs(entryDate).toISOString(), // 发送 ISO 格式日期
      daily_rating: dailyRating || null,
    };
    onSubmit(diaryData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-1">
          日记日期:
        </label>
        <DatePicker
          id="entryDate"
          selected={entryDate}
          onChange={(date) => setEntryDate(date)}
          dateFormat="yyyy/MM/dd"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          标题 (可选):
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          日记内容:
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="10"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          disabled={isLoading}
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isEncrypted"
          checked={isEncrypted}
          onChange={(e) => setIsEncrypted(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isEncrypted" className="ml-2 block text-sm text-gray-900">
          加密日记 (内容将在服务器端加密存储)
        </label>
      </div>

      <div>
        <label htmlFor="dailyRating" className="block text-sm font-medium text-gray-700 mb-1">
          当日评级 (例如 1-5, 或 "优秀", "一般"):
        </label>
        <input
          type="text"
          id="dailyRating"
          value={dailyRating}
          onChange={(e) => setDailyRating(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? '保存中...' : '保存日记'}
      </button>
    </form>
  );
};

export default DiaryForm;
