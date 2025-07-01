// frontend/src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const getImportanceClass = (importance) => {
  switch (importance) {
    case 'critical': return 'border-red-500';
    case 'high': return 'border-orange-400';
    case 'medium': return 'border-yellow-400';
    case 'low': return 'border-blue-300';
    default: return 'border-gray-300';
  }
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tasksApi.getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error('获取任务失败:', err);
      setError('未能加载任务列表。');
    } finally {
      setLoading(false);
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
    return <div className="text-center p-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">我的任务</h1>
        <Link to="/tasks/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors">
          创建新任务
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {tasks.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          太棒了，没有待办任务！
        </div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`bg-white p-4 rounded-lg shadow-md flex items-center justify-between border-l-4 ${getImportanceClass(task.importance)}`}
            >
              <div>
                <Link to={`/tasks/${task.id}`} className={`text-lg font-semibold hover:text-indigo-600 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </Link>
                {task.due_date && (
                  <p className="text-sm text-gray-500">
                    截止于: {dayjs(task.due_date).format('YYYY-MM-DD HH:mm')} ({dayjs(task.due_date).fromNow()})
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {task.completed ? '已完成' : '待办'}
                </span>
                <Link to={`/tasks/${task.id}/edit`} className="text-sm text-blue-500 hover:underline">编辑</Link>
                <button onClick={() => handleDeleteTask(task.id)} className="text-sm text-red-500 hover:underline">删除</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TasksPage;
