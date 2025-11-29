import { getAllQuestions } from '@/lib/questions';
import EvaluationClient from '@/app/components/EvaluationClient';
import { seededShuffle } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EvaluatePage({ searchParams }: PageProps) {
  const allQuestions = await getAllQuestions();
  const resolvedSearchParams = await searchParams;

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>未能加载任何问题，请检查_answers文件夹。</p>
      </main>
    );
  }

  // 处理随机抽取逻辑
  const seed = resolvedSearchParams.seed;
  const countParam = resolvedSearchParams.count;
  
  let questionsToDisplay = allQuestions;

  // 只有当提供了 seed 时才进行随机打乱和截取
  // 如果没有提供参数（比如直接访问 /evaluate），为了保持向后兼容或避免混乱，
  // 我们可以选择显示所有，或者应用默认策略。
  // 根据用户需求，这里我们默认应用随机策略（如果通过正常流程进入，肯定会有seed）。
  
  if (seed) {
    const seedString = Array.isArray(seed) ? seed[0] : seed;
    // 使用 seed 打乱题目
    const shuffled = seededShuffle(allQuestions, seedString);
    
    // 确定数量
    let count = 5; // 默认为5
    if (countParam) {
      const parsedCount = parseInt(Array.isArray(countParam) ? countParam[0] : countParam, 10);
      if (!isNaN(parsedCount) && parsedCount > 0) {
        count = parsedCount;
      }
    }
    
    // 截取
    questionsToDisplay = shuffled.slice(0, count);
  } else {
    // 如果没有 seed，可能是直接访问。
    // 这里我们也可以强制随机，或者重定向到选择页面。
    // 为了简单起见，如果没有参数，我们假设用户想要全部（或者是开发调试），或者默认随机5个
    // 鉴于用户需求明确，我们也可以在这里应用默认随机（使用固定或时间种子）。
    // 但为了避免刷新变动，如果没参数，最好不要随机变动，或者保持原序。
    // 这里保持原序（显示所有），除非用户经过了选择页面。
  }

  return <EvaluationClient allQuestions={questionsToDisplay} />;
}
