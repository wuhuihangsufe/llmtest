import type { ModelAnswer } from "@/lib/types";

type EvaluationData = {
  score: number;
  pros: string[];
  cons: string[];
};

type EvaluationCardProps = {
  questionId: string;
  answer: ModelAnswer;
  evaluation: EvaluationData;
  onUpdate: (questionId: string, modelId: string, data: EvaluationData) => void;
};

const PROS_OPTIONS = ["逻辑清晰", "内容全面", "代码正确", "富有创意"];
const CONS_OPTIONS = ["存在事实错误", "逻辑混乱", "回答不完整", "代码有bug"];

export default function EvaluationCard({ questionId, answer, evaluation, onUpdate }: EvaluationCardProps) {
  
  if (!evaluation) return null; // In case data is not ready yet

  const handleScoreChange = (newScore: number) => {
    onUpdate(questionId, answer.modelId, { ...evaluation, score: newScore });
  };

  const handleCheckboxChange = (option: string, type: 'pro' | 'con') => {
    const list = type === 'pro' ? evaluation.pros : evaluation.cons;
    const newList = list.includes(option)
      ? list.filter(item => item !== option)
      : [...list, option];
    
    if (type === 'pro') {
      onUpdate(questionId, answer.modelId, { ...evaluation, pros: newList });
    } else {
      onUpdate(questionId, answer.modelId, { ...evaluation, cons: newList });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-gray-700 text-white">
        <h3 className="text-xl font-bold">{answer.modelDisplayName}</h3>
      </div>
      <div className="flex-1 border-t border-b border-gray-200">
        <iframe
          srcDoc={answer.contentHtml}
          className="w-full h-full min-h-[300px] border-0"
          title={`${answer.modelDisplayName}'s Answer`}
        />
      </div>
      <div className="p-4 bg-gray-50">
        {/* Scoring */}
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 mb-2">评分 (1-10分)</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
              <button
                key={s}
                onClick={() => handleScoreChange(s)}
                className={`w-8 h-8 rounded-full transition-colors text-sm ${
                  evaluation.score === s ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {/* Pros */}
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 mb-1">优点 (可多选)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {PROS_OPTIONS.map(pro => (
              <label key={pro} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={evaluation.pros.includes(pro)}
                  onChange={() => handleCheckboxChange(pro, 'pro')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{pro}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Cons */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">缺点 (可多选)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {CONS_OPTIONS.map(con => (
              <label key={con} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={evaluation.cons.includes(con)}
                  onChange={() => handleCheckboxChange(con, 'con')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{con}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 