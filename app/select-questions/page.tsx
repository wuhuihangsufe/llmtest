"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectQuestionsPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 检查用户信息是否存在
    const storedUserInfo = localStorage.getItem('fineval_user_info');
    if (!storedUserInfo) {
      router.push('/');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));
  }, [router]);

  const handleStart = () => {
    setIsLoading(true);
    // 生成随机种子
    const seed = Date.now().toString() + Math.random().toString(36).substring(2);
    // 跳转到评测页面，带上参数
    router.push(`/evaluate?seed=${seed}&count=${questionCount}`);
  };

  if (!userInfo) {
    return <div className="flex min-h-screen items-center justify-center">正在加载...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          选择题目数量
        </h1>
        
        <p className="text-gray-600 mb-8">
          为了提供更灵活的评测体验，您可以选择本次要回答的题目数量（默认随机抽取5题）。
        </p>

        <div className="mb-8">
            <label htmlFor="questionCount" className="block text-sm font-semibold text-gray-700 mb-2">
                题目数量
            </label>
            <div className="flex items-center justify-center space-x-4">
                <button 
                    onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-xl flex items-center justify-center transition-colors"
                >
                    -
                </button>
                <input
                    id="questionCount"
                    type="number"
                    min="1"
                    max="60"
                    value={questionCount}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                            setQuestionCount(Math.min(60, val)); // 假设最多60题
                        }
                    }}
                    className="w-20 text-center text-2xl font-bold text-blue-600 border-b-2 border-blue-200 focus:border-blue-600 focus:outline-none py-1"
                />
                <button 
                    onClick={() => setQuestionCount(Math.min(60, questionCount + 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-xl flex items-center justify-center transition-colors"
                >
                    +
                </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">建议数量：5-10 题</p>
        </div>

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-4 px-8 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? '正在准备试题...' : '开始答题'}
        </button>
      </div>
    </div>
  );
}

