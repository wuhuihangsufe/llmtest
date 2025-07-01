"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, ModelAnswer } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import EvaluationCard from './EvaluationCard'; // 我们将创建这个新卡片组件

// 定义评价数据的结构
interface EvaluationState {
  [questionId: string]: {
    [modelId: string]: {
      score: number;
      pros: string[];
      cons: string[];
    };
  };
}

// 定义布局模式的类型
type LayoutMode = '1x10' | '2x5';

export default function EvaluationClient({ allQuestions }: { allQuestions: Question[] }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [userInfo, setUserInfo] = useState<{name: string, profile: object, startTime: string} | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 升级为通用分页索引
  const [evaluations, setEvaluations] = useState<EvaluationState>({});
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('2x5'); // 默认改为 2x5
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Effect to run on component mount
  useEffect(() => {
    // 1. 获取用户信息
    const storedUserInfo = localStorage.getItem('fineval_user_info');
    if (!storedUserInfo) {
      router.push('/'); // 如果没有用户信息，返回首页
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));

    // 2. 初始化空的评价状态
    const initialEvals: EvaluationState = {};
    allQuestions.forEach(q => {
      initialEvals[q.id] = {};
      q.answers.forEach(a => {
        initialEvals[q.id][a.modelId] = { score: 0, pros: [], cons: [] };
      });
    });
    setEvaluations(initialEvals);

  }, [allQuestions, router]);

  const handleUpdateEvaluation = (questionId: string, modelId: string, data: { score: number; pros: string[]; cons: string[] }) => {
    setEvaluations(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [modelId]: data,
      },
    }));
  };

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
      };

      const { error } = await supabase.from('submissions').insert(submissionData);

      setIsSubmitting(false);

      if (error) {
          setSubmitMessage(`提交失败: ${error.message}`);
      } else {
          localStorage.removeItem('fineval_user_info');
          router.push('/thank-you');
      }
  };

  if (!userInfo) {
    return <div className="flex min-h-screen items-center justify-center">正在加载...</div>;
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
        <h2 className="text-lg font-bold mb-4">问题列表</h2>
        <nav className="space-y-2">
          {allQuestions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                index === currentQuestionIndex ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100'
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
          {getAnswersToDisplay().map(answer => (
            <EvaluationCard 
              key={`${currentQuestion.id}-${answer.modelId}`}
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

          {currentQuestionIndex === allQuestions.length - 1 && (
              <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isEvaluationComplete()}
                  className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-bold"
              >
                  {isSubmitting ? '提交中...' : '完成并提交所有评价'}
              </button>
          )}

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