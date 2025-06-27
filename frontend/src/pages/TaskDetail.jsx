// frontend/src/pages/TaskDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi } from '../api';
import TaskForm from '../components/TaskForm'; // 引入任务表单组件
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

const TaskDetail = () => {
  const { id } = useParams(); // 从 URL 获取任务 ID
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 控制是否处于编辑模式
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');


  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tasksApi.getTask(id);
      setTask(response.data);
    } catch (err) {
      console.error('获取任务详情失败:', err);
      setError('未能加载任务详情。');
      // 如果任务不存在或无权访问，重定向到任务列表
      if (err.response && err.response.status === 404) {
        navigate('/tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (updatedData) => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const response = await tasksApi.updateTask(id, updatedData);
      setTask(response.data); // 更新任务状态
      setIsEditing(false); // 退出编辑模式
    } catch (err) {
      console.error('更新任务失败:', err);
      setSubmitError(err.response?.data?.detail || '未能更新任务，请重试。');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('您确定要删除此任务吗？此操作不可逆！')) {
      try {
        await tasksApi.deleteTask(id);
        navigate('/tasks'); // 删除成功后跳转回任务列表
      } catch (err) {
        console.error('删除任务失败:', err);
        setError('未能删除任务。');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-600 text-lg">加载中...</p></div>;
  }

  if (error && !task) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!task) {
    return <div className="text-center text-gray-500">任务未找到。</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">任务详情</h1>

      {isEditing ? (
        <TaskForm
          initialData={task}
          onSubmit={handleUpdateTask}
          isLoading={submitLoading}
          error={submitError}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-3xl font-bold ${task.completed ? 'line-through text-gray-500' : 'text-indigo-700'}`}>
              {task.title}
            </h2>
            <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${getImportanceColor(task.importance)}`}>
              {task.importance.toUpperCase()}
            </span>
          </div>

          {task.description && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <p className="font-semibold">状态:</p>
              <p>{task.completed ? '已完成' : '未完成'}</p>
            </div>
            <div>
              <p className="font-semibold">创建日期:</p>
              <p>{dayjs(task.created_at).format('LLL')}</p>
            </div>
            {task.due_date && (
              <div>
                <p className="font-semibold">截止日期:</p>
                <p>{dayjs(task.due_date).format('LLL')} ({dayjs(task.due_date).fromNow()})</p>
              </div>
            )}
            {task.reminder_time && (
              <div>
                <p className="font-semibold">提醒时间:</p>
                <p>{dayjs(task.reminder_time).format('LLL')} ({dayjs(task.reminder_time).fromNow()})</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-md transition-colors"
            >
              编辑
            </button>
            <button
              onClick={handleDeleteTask}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-md transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/tasks')}
          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          返回任务列表
        </button>
      </div>
    </div>
  );
};

export default TaskDetail;
