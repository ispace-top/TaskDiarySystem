// frontend/src/pages/DiaryFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diariesApi } from '../api';
import DiaryForm from '../components/DiaryForm';

const DiaryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // 编辑时获取解密后的日记内容
      diariesApi.getDiary(id, true)
        .then(response => {
          setInitialData(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("加载日记失败", err);
          setError("无法加载日记数据进行编辑。");
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleSubmit = async (diaryData) => {
    setSubmitLoading(true);
    setError('');
    try {
      if (isEditing) {
        await diariesApi.updateDiary(id, diaryData);
      } else {
        await diariesApi.createDiary(diaryData);
      }
      navigate('/diaries');
    } catch (err) {
      console.error("保存日记失败", err);
      setError(err.response?.data?.detail || "保存日记失败，请检查输入。");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">加载编辑数据中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditing ? '编辑日记' : '记录新日记'}</h1>
      <DiaryForm
        initialData={initialData || {}}
        onSubmit={handleSubmit}
        isLoading={submitLoading}
        error={error}
      />
    </div>
  );
};

export default DiaryFormPage;
