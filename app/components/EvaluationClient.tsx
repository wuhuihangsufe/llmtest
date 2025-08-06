"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import EvaluationCard from './EvaluationCard'; // 我们将创建这个新卡片组件

// 定义评价数据的结构
interface EvaluationData {
  score: number;
  pros: string[];
  cons: string[];
}

interface EvaluationState {
  [questionId: string]: {
    [modelId: string]: EvaluationData;
  };
}

// 定义布局模式的类型
type LayoutMode = '1x10' | '2x5';

export default function EvaluationClient({ allQuestions }: { allQuestions: Question[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [userInfo, setUserInfo] = useState<{ name: string, profile: object, startTime: string } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 升级为通用分页索引
  const [evaluations, setEvaluations] = useState<EvaluationState>({});
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('2x5'); // 默认改为 2x5

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 新增：用于加载历史记录的loading状态

  // Effect to run on component mount
  useEffect(() => {
    const initialize = async () => {
      // 1. 获取用户信息
      const storedUserInfo = localStorage.getItem('fineval_user_info');
      if (!storedUserInfo) {
        router.push('/');
        return;
      }
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);

      // 2. 初始化空的评价状态
      const initialEvals: EvaluationState = {};
      let lastQuestionId: string | null = null;
      allQuestions.forEach(q => {
        initialEvals[q.id] = {};
        q.answers.forEach(a => {
          initialEvals[q.id][a.modelId] = { score: 0, pros: [], cons: [] };
        });
      });

      // 3. 加载用户历史进度
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('question_id, model_id, evaluation_data')
        .eq('user_id', parsedUserInfo.name);

      if (error) {
        console.error('获取进度失败:', error);
      } else if (progress && progress.length > 0) {
        progress.forEach(item => {
          if (initialEvals[item.question_id] && initialEvals[item.question_id][item.model_id]) {
            initialEvals[item.question_id][item.model_id] = item.evaluation_data;
            lastQuestionId = item.question_id;
          }
        });

        // 恢复到上次作答的问题
        if (lastQuestionId) {
          const lastIndex = allQuestions.findIndex(q => q.id === lastQuestionId);
          if (lastIndex !== -1) {
            setCurrentQuestionIndex(lastIndex);
          }
        }
      }

      setEvaluations(initialEvals);
      setIsLoading(false);
    };

    initialize();
  }, [allQuestions, router, supabase]);

  const handleUpdateEvaluation = useCallback(async (questionId: string, modelId: string, data: EvaluationData) => {
    // 立即更新UI
    setEvaluations(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [modelId]: data,
      },
    }));

    // 后台保存到数据库
    if (userInfo) {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userInfo.name,
          question_id: questionId,
          model_id: modelId,
          evaluation_data: data,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('保存进度失败:', error);
        // 可以在这里给用户一些提示
      }
    }
  }, [supabase, userInfo]);

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < allQuestions.length) {
      setCurrentQuestionIndex(index);
      setCurrentPageIndex(0); // 切换问题时，重置分页索引
    }
  };

  const isEvaluationComplete = () => {
    return Object.values(evaluations).every(questionEvals =>
      Object.values(questionEvals).every(modelEval => modelEval.score > 0)
    );
  }

  const handleEarlySubmit = async () => {
    if (!userInfo) {
      setSubmitMessage("无法获取用户信息，请刷新重试。");
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage("正在保存您的评测进度，请稍候...");

    const submissionData = {
      user_name: userInfo.name,
      user_profile: userInfo.profile,
      evaluation_data: evaluations,
      duration_seconds: Math.floor((new Date().getTime() - new Date(userInfo.startTime).getTime()) / 1000),
      status: 'in-progress', // 新增状态字段
    };

    // 使用 upsert 来更新或插入提交
    const { error } = await supabase.from('submissions').upsert(submissionData, { onConflict: 'user_name' });

    setIsSubmitting(false);
    if (error) {
      setSubmitMessage(`保存失败: ${error.message}`);
      console.error("Early submit error:", error);
    } else {
      setSubmitMessage('您的进度已成功保存！您可以随时关闭页面，下次使用相同昵称登录即可继续。');
      // 5秒后自动清除消息
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  const handleSubmit = async () => {
    if (!isEvaluationComplete()) {
      setSubmitMessage("您还有未完成评分的项目，请检查。");
      return;
    }
    if (!userInfo) {
      setSubmitMessage("无法获取用户信息，请刷新重试。");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("正在提交所有评价，请稍候...");

    const submissionData = {
      user_name: userInfo.name,
      user_profile: userInfo.profile,
      evaluation_data: evaluations,
      duration_seconds: Math.floor((new Date().getTime() - new Date(userInfo.startTime).getTime()) / 1000),
      status: 'completed', // 状态为完成
    };

    // 最终提交也用 upsert，以防用户直接点这个
    const { error } = await supabase.from('submissions').upsert(submissionData, { onConflict: 'user_name' });

    if (error) {
      setIsSubmitting(false);
      setSubmitMessage(`提交失败: ${error.message}`);
    } else {
      // 提交成功后，清理该用户的进度
      await supabase.from('user_progress').delete().eq('user_id', userInfo.name);
      localStorage.removeItem('fineval_user_info');
      router.push('/thank-you');
    }
  };

  if (isLoading || !userInfo) {
    return <div className="flex min-h-screen items-center justify-center">正在加载您的答题进度...</div>;
  }

  const currentQuestion = allQuestions[currentQuestionIndex];

  // 新增：根据布局模式返回对应的CSS类
  const getLayoutClasses = () => {
    switch (layoutMode) {
      case '1x10':
        return 'grid-cols-1';
      case '2x5':
      default:
        return 'grid-cols-1 md:grid-cols-2'; // 在中等屏幕上2列
    }
  };

  // 根据布局和分页获取要展示的答案
  const getAnswersToDisplay = () => {
    const answers = currentQuestion.answers;
    switch (layoutMode) {
      case '1x10':
        return answers.slice(currentPageIndex, currentPageIndex + 1);
      case '2x5':
      default:
        // 每页2个，根据分页索引计算
        return answers.slice(currentPageIndex * 2, currentPageIndex * 2 + 2);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar for Navigation */}
      <aside className="w-64 bg-white p-6 shadow-md hidden md:block overflow-y-auto">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">当前用户</p>
          <h2 className="text-lg font-bold text-blue-600 break-words">{userInfo?.name}</h2>
        </div>
        <h2 className="text-lg font-bold mb-4">问题列表</h2>
        <nav className="space-y-2">
          {allQuestions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${index === currentQuestionIndex ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100'
                }`}
            >
              问题 {q.id}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col">
        <div className="flex-shrink-0">
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              问题 {currentQuestion.id}/{allQuestions.length}:
            </h1>
            <p className="mt-1 text-lg text-gray-600">{currentQuestion.text}</p>
          </div>
        </div>

        <div className={`flex-1 grid ${getLayoutClasses()} gap-4 p-4 overflow-y-auto`}>
          {getAnswersToDisplay().map((answer, index) => (
            <EvaluationCard
              key={`${currentQuestion.id}-${answer.modelId}-${index}`}
              questionId={currentQuestion.id}
              answer={answer}
              evaluation={evaluations[currentQuestion.id]?.[answer.modelId]}
              onUpdate={handleUpdateEvaluation}
            />
          ))}
        </div>

        {/* 升级：通用分页器 */}
        {(() => {
          const totalPages = layoutMode === '1x10' ? 10 : 5;
          const pageUnit = layoutMode === '1x10' ? '模型' : '组';
          const navUnit = layoutMode === '1x10' ? '模型' : '组';

          return (
            <div className="mt-4 flex justify-between items-center flex-shrink-0 px-4">
              <button
                onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPageIndex === 0}
                className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 text-sm"
              >
                上一个{navUnit}
              </button>
              <span className="text-sm font-semibold text-gray-700">
                {pageUnit} {currentPageIndex + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPageIndex === totalPages - 1}
                className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 text-sm"
              >
                下一个{navUnit}
              </button>
            </div>
          );
        })()}

        {/* 页面布局选择器 */}
        <div className="mt-6 flex justify-center items-center space-x-2 md:space-x-4 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700 hidden md:inline">页面布局:</span>
          <button onClick={() => setLayoutMode('1x10')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${layoutMode === '1x10' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border hover:bg-gray-50'}`}>1 × 10</button>
          <button onClick={() => setLayoutMode('2x5')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${layoutMode === '2x5' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border hover:bg-gray-50'}`}>2 × 5</button>
        </div>

        {/* Navigation Buttons and Submission */}
        <div className="mt-10 flex justify-between items-center flex-shrink-0">
          <button
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
          >
            上一个问题
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleEarlySubmit}
              disabled={isSubmitting}
              className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold"
            >
              {isSubmitting ? '处理中...' : '随时交卷 (保存进度)'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isEvaluationComplete()}
              className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-bold"
            >
              {isSubmitting ? '处理中...' : '完成并提交所有评价'}
            </button>
          </div>

          <button
            onClick={() => goToQuestion(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === allQuestions.length - 1}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
          >
            下一个问题
          </button>
        </div>
        {submitMessage && (
          <p className={`mt-4 text-sm text-center ${submitMessage.includes('失败') ? 'text-red-600' : 'text-green-600'}`}>
            {submitMessage}
          </p>
        )}
      </main>
    </div>
  );
} 