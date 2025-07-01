import { getAllQuestions } from '@/lib/questions';
import EvaluationClient from '@/app/components/EvaluationClient';

export default async function EvaluatePage() {
  const allQuestions = await getAllQuestions();

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>未能加载任何问题，请检查_answers文件夹。</p>
      </main>
    );
  }

  return <EvaluationClient allQuestions={allQuestions} />;
} 