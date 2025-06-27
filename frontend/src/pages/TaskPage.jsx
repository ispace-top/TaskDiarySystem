// frontend/src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { tasksApi } from '../api';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const getImportanceColor = (importance) => {
  switch (importance) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-400 text-white';
    case 'medium':
      return 'bg-yellow-300 text-gray-800';
    case 'low':
      return 'bg-green-300 text-gray-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCompleted, setFilterCompleted] = useState(null); // null: all, true: completed, false: incomplete
  const [filterImportance, setFilterImportance] = useState(''); // '': all, 'low', 'medium', 'high', 'critical'
  const [filterDueDate, setFilterDueDate] = useState(''); // '', 'today', 'week', 'upcoming'

  useEffect(() => {
    fetchTasks();
  }, [filterCompleted, filterImportance, filterDueDate]); // 依赖过滤条件变化

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterCompleted !== null) {
        params.completed = filterCompleted;
      }
      if (filterImportance) {
        params.importance = filterImportance;
      }
      const now = dayjs();
      if (filterDueDate === 'today') {
        params.due_date_after = now.startOf('day').toISOString();
        params.due_date_before = now.endOf('day').toISOString();
      } else if (filterDueDate === 'week') {
        params.due_date_after = now.startOf('week').toISOString();
        params.due_date_before = now.endOf('week').toISOString();
      } else if (filterDueDate === 'upcoming') {
        params.due_date_after = now.toISOString(); // 从现在开始的所有未来任务
      }

      const response = await tasksApi.getTasks(params);
      setTasks(response.data);
    } catch (err) {
      console.error('获取任务失败:', err);
      setError('未能加载任务列表。');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      await tasksApi.updateTask(taskId, { completed: !currentStatus });
      // 重新获取任务列表以更新 UI
      fetchTasks();
    } catch (err) {
      console.error('更新任务状态失败:', err);
      setError('未能更新任务状态。');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('您确定要删除此任务吗？')) {
      try {
        await tasksApi.deleteTask(taskId);
        fetchTasks(); // 重新获取任务列表
      } catch (err) {
        console.error('删除任务失败:', err);
        setError('未能删除任务。');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-600 text-lg">加载中...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">我的任务</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* 过滤和操作区域 */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <label htmlFor="filterCompleted" className="text-gray-700 text-sm font-medium">状态:</label>
          <select
            id="filterCompleted"
            value={filterCompleted === null ? 'all' : filterCompleted.toString()}
            onChange={(e) => setFilterCompleted(e.target.value === 'all' ? null : e.target.value === 'true')}
            className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">所有</option>
            <option value="false">未完成</option>
            <option value="true">已完成</option>
          </select>

          <label htmlFor="filterImportance" className="text-gray-700 text-sm font-medium">重要性:</label>
          <select
            id="filterImportance"
            value={filterImportance}
            onChange={(e) => setFilterImportance(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">所有</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="critical">紧急</option>
          </select>

          <label htmlFor="filterDueDate" className="text-gray-700 text-sm font-medium">截止日期:</label>
          <select
            id="filterDueDate"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">所有</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="upcoming">即将到来</option>
          </select>
        </div>
        <Link
          to="/tasks/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors"
        >
          添加新任务
        </Link>
      </div>

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          没有找到任务。
        </div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 ${
                task.completed ? 'opacity-70 border-l-8 border-green-400' : 'border-l-8 border-indigo-400'
              }`}
            >
              <div className="flex-grow mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mr-3 ${getImportanceColor(task.importance)}`}>
                    {task.importance.toUpperCase()}
                  </span>
                  <h3 className={`text-xl font-semibold text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                </div>
                {task.description && (
                  <p className="text-gray-600 text-sm mt-1 ml-1">
                    {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
                  </p>
                )}
                {task.due_date && (
                  <p className="text-gray-500 text-xs mt-2 ml-1">
                    截止日期: {dayjs(task.due_date).format('LLL')} ({dayjs(task.due_date).fromNow()})
                  </p>
                )}
                 {task.reminder_time && (
                  <p className="text-gray-500 text-xs mt-1 ml-1">
                    提醒时间: {dayjs(task.reminder_time).format('LLL')} ({dayjs(task.reminder_time).fromNow()})
                  </p>
                )}
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    task.completed
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {task.completed ? '取消完成' : '标记完成'}
                </button>
                <Link
                  to={`/tasks/${task.id}`}
                  className="py-2 px-4 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white text-center"
                >
                  查看详情
                </Link>
                <button
                  onClick={() => handleDeleteTask(task.id)}
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

export default TasksPage;
