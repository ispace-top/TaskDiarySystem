// frontend/src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

const importanceOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'critical', label: '紧急' },
];

const TaskForm = ({ initialData = {}, onSubmit, isLoading, error }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [importance, setImportance] = useState(initialData.importance || 'medium');
  const [completed, setCompleted] = useState(initialData.completed || false);
  const [dueDate, setDueDate] = useState(initialData.due_date ? new Date(initialData.due_date) : null);
  const [reminderTime, setReminderTime] = useState(initialData.reminder_time ? new Date(initialData.reminder_time) : null);

  // 当 initialData 改变时更新表单状态 (例如，编辑不同的任务时)
  useEffect(() => {
    setTitle(initialData.title || '');
    setDescription(initialData.description || '');
    setImportance(initialData.importance || 'medium');
    setCompleted(initialData.completed || false);
    setDueDate(initialData.due_date ? new Date(initialData.due_date) : null);
    setReminderTime(initialData.reminder_time ? new Date(initialData.reminder_time) : null);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      title,
      description: description || null, // 确保空字符串转为 null
      importance,
      completed,
      due_date: dueDate ? dayjs(dueDate).toISOString() : null,
      reminder_time: reminderTime ? dayjs(reminderTime).toISOString() : null,
    };
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          任务标题:
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          描述:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        ></textarea>
      </div>

      <div>
        <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
          重要程度:
        </label>
        <select
          id="importance"
          value={importance}
          onChange={(e) => setImportance(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        >
          {importanceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
          已完成
        </label>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          截止日期:
        </label>
        <DatePicker
          id="dueDate"
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          showTimeSelect
          dateFormat="yyyy/MM/dd HH:mm"
          timeFormat="HH:mm"
          timeIntervals={15}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
          placeholderText="选择截止日期"
          isClearable
        />
      </div>

      <div>
        <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
          提醒时间:
        </label>
        <DatePicker
          id="reminderTime"
          selected={reminderTime}
          onChange={(date) => setReminderTime(date)}
          showTimeSelect
          dateFormat="yyyy/MM/dd HH:mm"
          timeFormat="HH:mm"
          timeIntervals={15}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
          placeholderText="选择提醒时间"
          isClearable
        />
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? '保存中...' : '保存任务'}
      </button>
    </form>
  );
};

export default TaskForm;
