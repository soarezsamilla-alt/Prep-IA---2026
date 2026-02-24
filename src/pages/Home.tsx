import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Camera, MessageSquare, Trophy, Clock, BarChart, Moon, Sun, Monitor, Play, Target, HelpCircle, Globe, User, Upload, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useActivity } from "@/context/ActivityContext";
import { cn } from "@/lib/utils";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { user, updateUser, logout } = useUser();
  const { t, setLanguage, language } = useLanguage();
  const { activities, points, studyTime } = useActivity();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate daily progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysActivities = activities.filter(a => a.timestamp >= today.getTime());
  const dailyQuestions = todaysActivities.reduce((acc, curr) => acc + (curr.total || 0), 0);
  
  const quizActivities = activities.filter(a => a.type === 'quiz' && a.status === 'completed');
  const totalQuestions = quizActivities.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalCorrect = quizActivities.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const handleResumeActivity = (activity: any) => {
    if (activity.type === 'quiz') {
      if (activity.status === 'completed') {
        navigate(`/activity/${activity.id}`);
      } else {
        navigate('/practice', { state: { resumeId: activity.id } });
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-white pb-24 md:pb-6">
      <div className="p-6 space-y-6 max-w-md mx-auto md:max-w-5xl">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.home.hello}, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.home.ready}
            </p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="rounded-full hover:ring-2 ring-blue-500/50 transition-all"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
              )}
            </button>

            <AnimatePresence>
              {showThemeMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-20 overflow-hidden"
                  >
                    {/* Profile Section */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t.profile.account}</p>
                      
                      <div className="mb-2 px-1">
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => updateUser({ name: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          placeholder="Seu nome"
                        />
                      </div>

                      <button 
                        onClick={triggerFileInput}
                        className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Upload size={16} />
                        <span>Alterar Foto</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>

                    {/* Language Section */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t.profile.language}</p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => setLanguage('pt')}
                          className={cn(
                            "px-2 py-1 rounded text-lg flex items-center justify-center transition-colors",
                            language === 'pt' ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          title="Português"
                        >
                          🇧🇷
                        </button>
                        <button
                          onClick={() => setLanguage('en')}
                          className={cn(
                            "px-2 py-1 rounded text-lg flex items-center justify-center transition-colors",
                            language === 'en' ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          title="English"
                        >
                          🇺🇸
                        </button>
                        <button
                          onClick={() => setLanguage('es')}
                          className={cn(
                            "px-2 py-1 rounded text-lg flex items-center justify-center transition-colors",
                            language === 'es' ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          title="Español"
                        >
                          🇪🇸
                        </button>
                      </div>
                    </div>

                    {/* Theme Section */}
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{t.home.theme}</p>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setTheme("light")}
                          className={cn(
                            "w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm transition-colors",
                            theme === "light" 
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          <Sun size={16} />
                          <span>{t.home.light}</span>
                        </button>
                        
                        <button
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm transition-colors",
                            theme === "dark" 
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          <Moon size={16} />
                          <span>{t.home.dark}</span>
                        </button>

                        <button
                          onClick={() => setTheme("system")}
                          className={cn(
                            "w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm transition-colors",
                            theme === "system" 
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          <Monitor size={16} />
                          <span>{t.home.system}</span>
                        </button>
                      </div>
                    </div>

                    {/* Logout Section */}
                    <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 mt-1">
                      <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>{t.profile.logout}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Daily Goal Card */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/20 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full">
                {t.home.dailyGoal}
              </span>
              <Trophy className="text-yellow-300" size={24} />
            </div>
            
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-1">{accuracy}%</h2>
              <p className="text-blue-100 text-sm">
                {t.home.accuracy} • {dailyQuestions} {t.home.questionsToday}
              </p>
              <p className="text-blue-100 text-sm mt-2 flex items-center gap-2">
                <Clock size={16} />
                {t.home.studyTime}: {studyTime}s
              </p>
            </div>

            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/practice" className="block h-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-[#151B2B] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500 mb-4">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t.home.newQuiz}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.home.newQuizDesc}</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/scan" className="block h-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-[#151B2B] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-4">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t.home.askDoubts}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.home.askDesc}</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Recent Activity */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.home.recentActivity}</h2>
            <Link to="/activities" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
              {t.home.seeAll}
            </Link>
          </div>
          
          <div className="bg-white dark:bg-[#151B2B] rounded-3xl border border-gray-100 dark:border-gray-800 min-h-[120px] flex flex-col justify-center">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                {t.home.noActivity}
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activities.slice(0, 3).map((activity) => (
                  <div 
                    key={activity.id} 
                    onClick={() => handleResumeActivity(activity)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer first:rounded-t-3xl last:rounded-b-3xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        activity.status === 'in_progress' 
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      )}>
                        {activity.status === 'in_progress' ? <Play size={18} /> : <BarChart size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.type === 'quiz' ? `${t.home.quizHistory} ${activity.subject}` : 
                           activity.type === 'scan' ? t.home.scanQuestion : t.home.askDoubts}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {activity.status === 'in_progress' ? 'Em andamento' : `${activity.score}/${activity.total} acertos`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
