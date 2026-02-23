import { Link, useNavigate } from "react-router-dom";
import { useActivity } from "@/context/ActivityContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, Trash2, Play, BarChart, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Activities() {
  const { activities, clearActivities } = useActivity();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleResumeActivity = (activity: any) => {
    if (activity.type === 'quiz') {
      if (activity.status === 'completed') {
        navigate(`/activity/${activity.id}`);
      } else {
        navigate('/practice', { state: { resumeId: activity.id } });
      }
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico?")) {
      clearActivities();
      alert("Histórico limpo com sucesso!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-white pb-24 md:pb-6">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">Histórico de Atividades</h1>
          </div>
          
          {activities.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <Trash2 size={16} />
              Limpar Histórico
            </button>
          )}
        </header>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma atividade recente</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Comece um simulado ou tire uma dúvida para ver seu histórico aqui.</p>
            <Link to="/practice">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Começar Simulado
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                onClick={() => handleResumeActivity(activity)}
                className="bg-white dark:bg-[#151B2B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    activity.status === 'in_progress' 
                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500"
                      : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500"
                  )}>
                    {activity.status === 'in_progress' ? <Play size={20} /> : <BarChart size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {activity.type === 'quiz' ? `${t.home.quizHistory} ${activity.subject}` : 
                       activity.type === 'scan' ? t.home.scanQuestion : t.home.askDoubts}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        {activity.status === 'in_progress' ? 'Em andamento' : `${activity.score}/${activity.total} acertos`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                  <ArrowLeft size={20} className="rotate-180" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
