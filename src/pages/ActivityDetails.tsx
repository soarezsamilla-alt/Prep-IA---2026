import { useParams, Link } from "react-router-dom";
import { useActivity } from "@/context/ActivityContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function ActivityDetails() {
  const { id } = useParams();
  const { activities } = useActivity();
  const { t } = useLanguage();
  
  const activity = activities.find(a => a.id === id);

  if (!activity || activity.type !== 'quiz' || !activity.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-white p-6 flex flex-col items-center justify-center">
        <p className="text-lg mb-4">Atividade não encontrada ou inválida.</p>
        <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} />
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const { questions } = activity.data;
  const percentage = activity.total ? Math.round(((activity.score || 0) / activity.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-white pb-24 md:pb-6">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detalhes do Simulado</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activity.subject} • {new Date(activity.timestamp).toLocaleDateString()}
            </p>
          </div>
        </header>

        <div className="bg-white dark:bg-[#151B2B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Pontuação</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(activity.score || 0) * 10}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Precisão</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{percentage}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((q: any, index: number) => {
            // We need to infer the user's selected answer if it wasn't explicitly stored in a simple way.
            // However, the current implementation of Practice.tsx doesn't seem to store the *selected option* for each question in the activity data, 
            // only the final score and the questions array. 
            // Wait, looking at Practice.tsx:
            // updateActivity(currentActivityId, { data: { questions, currentQuestionIndex } })
            // It updates 'questions' but doesn't seem to modify the questions array to include the selected answer.
            // Let's check Practice.tsx again.
            
            // Actually, Practice.tsx does NOT store the user's selected answer in the `questions` array. 
            // It only calculates score on the fly. 
            // This is a limitation. I need to update Practice.tsx to store the selected answer in the question object or a separate array.
            
            // For now, I will assume the 'questions' array in activity.data might have been updated if I change Practice.tsx.
            // Let's proceed with creating this file assuming I will fix Practice.tsx to store `selectedAnswer`.
            
            const isCorrect = q.selectedAnswer === q.correctAnswer;
            
            return (
              <div key={index} className="bg-white dark:bg-[#151B2B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{q.question}</ReactMarkdown>
                  </div>
                </div>

                <div className="space-y-2 pl-12 mb-4">
                  {q.options.map((option: string) => {
                    const isSelected = q.selectedAnswer === option;
                    const isOptionCorrect = option.startsWith(q.correctAnswer);
                    
                    let style = "border-gray-200 dark:border-gray-700 opacity-70";
                    if (isSelected && isOptionCorrect) style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 opacity-100";
                    else if (isSelected && !isOptionCorrect) style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 opacity-100";
                    else if (isOptionCorrect) style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 opacity-100";

                    return (
                      <div key={option} className={cn("p-3 rounded-xl border text-sm flex items-center gap-3", style)}>
                        {isSelected && isOptionCorrect && <CheckCircle size={16} />}
                        {isSelected && !isOptionCorrect && <XCircle size={16} />}
                        {!isSelected && isOptionCorrect && <CheckCircle size={16} />}
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pl-12 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <HelpCircle size={16} />
                    <span>Explicação</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                    <ReactMarkdown>{q.explanation}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
