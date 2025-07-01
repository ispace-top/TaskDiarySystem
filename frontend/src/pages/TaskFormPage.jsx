// frontend/src/pages/TaskFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi } from '../api';
import TaskForm from '../components/TaskForm';

const TaskFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      tasksApi.getTask(id)
        .then(response => {
          setInitialData(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("加载任务失败", err);
          setError("无法加载任务数据进行编辑。");
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleSubmit = async (taskData) => {
    setSubmitLoading(true);
    setError('');
    try {
      if (isEditing) {
        await tasksApi.updateTask(id, taskData);
      } else {
        await tasksApi.createTask(taskData);
      }
      navigate('/tasks');
    } catch (err) {
      console.error("保存任务失败", err);
      setError(err.response?.data?.detail || "保存任务失败，请检查输入。");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">加载编辑数据中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditing ? '编辑任务' : '创建新任务'}</h1>
      <TaskForm
        initialData={initialData || {}}
        onSubmit={handleSubmit}
        isLoading={submitLoading}
        error={error}
      />
    </div>
  );
};

export default TaskFormPage;
