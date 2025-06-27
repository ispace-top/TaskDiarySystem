// frontend/src/pages/DiaryDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diariesApi } from '../api';
import DiaryForm from '../components/DiaryForm'; // 引入日记表单组件
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const DiaryDetail = () => {
  const { id } = useParams(); // 从 URL 获取日记 ID
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 控制是否处于编辑模式
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [decryptedContent, setDecryptedContent] = useState(''); // 用于显示解密后的内容

  useEffect(() => {
    fetchDiary();
  }, [id]);

  const fetchDiary = async () => {
    setLoading(true);
    setError('');
    try {
      // 尝试解密获取日记内容。如果日记未加密，后端会直接返回内容。
      // 如果日记已加密，后端会尝试使用用户的盐值和哈希密码派生密钥进行解密。
      // 注意：如果日记加密时使用的密钥不是直接通过用户哈希密码和盐派生的，
      // 或者需要用户在客户端提供密码才能解密，这里需要更复杂的逻辑。
      // 目前实现是假设服务器可以解密。
      const response = await diariesApi.getDiary(id, true); // 明确要求解密
      setDiary(response.data);
      setDecryptedContent(response.data.content); // 存储解密后的内容
    } catch (err) {
      console.error('获取日记详情失败:', err);
      setError(err.response?.data?.detail || '未能加载日记详情。');
      // 如果日记不存在或无权访问，重定向到日记列表
      if (err.response && err.response.status === 404) {
        navigate('/diaries');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiary = async (updatedData) => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const response = await diariesApi.updateDiary(id, updatedData);
      setDiary(response.data); // 更新日记状态
      setDecryptedContent(response.data.content); // 更新解密内容
      setIsEditing(false); // 退出编辑模式
    } catch (err) {
      console.error('更新日记失败:', err);
      setSubmitError(err.response?.data?.detail || '未能更新日记，请重试。');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteDiary = async () => {
    if (window.confirm('您确定要删除此日记吗？此操作不可逆！')) {
      try {
        await diariesApi.deleteDiary(id);
        navigate('/diaries'); // 删除成功后跳转回日记列表
      } catch (err) {
        console.error('删除日记失败:', err);
        setError('未能删除日记。');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-600 text-lg">加载中...</p></div>;
  }

  if (error && !diary) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!diary) {
    return <div className="text-center text-gray-500">日记未找到。</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">日记详情</h1>

      {isEditing ? (
        <DiaryForm
          initialData={diary}
          onSubmit={handleUpdateDiary}
          isLoading={submitLoading}
          error={submitError}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-purple-700">
              {diary.title || `日记 - ${dayjs(diary.entry_date).format('LL')}`}
            </h2>
            {diary.is_encrypted && (
              <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                加密日记
              </span>
            )}
            {diary.daily_rating && (
              <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                评级: {diary.daily_rating}
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{decryptedContent}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <p className="font-semibold">日记日期:</p>
              <p>{dayjs(diary.entry_date).format('LL')}</p>
            </div>
            <div>
              <p className="font-semibold">创建日期:</p>
              <p>{dayjs(diary.created_at).format('LLL')}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-md shadow-md transition-colors"
            >
              编辑
            </button>
            <button
              onClick={handleDeleteDiary}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-md transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/diaries')}
          className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
        >
          返回日记列表
        </button>
      </div>
    </div>
  );
};

export default DiaryDetail;
