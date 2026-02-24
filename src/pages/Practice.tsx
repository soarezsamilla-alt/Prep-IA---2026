import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, Loader2, ChevronRight, RefreshCw, Trophy, ArrowRight, Home, Scale, Briefcase, Gavel, Shield, FileText, Book, Type, Brain, Cpu, Star, Zap, GraduationCap, Target, Calculator, PenTool } from "lucide-react";
import { generatePracticeQuestions } from "@/services/ai";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/context/LanguageContext";
import { useActivity } from "@/context/ActivityContext";
import { Link, useLocation } from "react-router-dom";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
};

type Difficulty = "Easy" | "Medium" | "Hard";

export default function Practice() {
  const { t, language } = useLanguage();
  const { addActivity, updateActivity, addPoints, resumeActivity } = useActivity();
  const location = useLocation();
  
  const [step, setStep] = useState<"setup" | "loading" | "quiz" | "result">("setup");
  
  // Get subjects from translations
  const subjectsList = Object.keys(t.subjects);
  const [subject, setSubject] = useState(subjectsList[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("PF");
  
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [nextQuestions, setNextQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  const currentQuestionIndexRef = useRef(0);

  // Update ref whenever currentQuestionIndex changes
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Check for resume request
  useEffect(() => {
    if (location.state?.resumeId) {
      const activity = resumeActivity(location.state.resumeId);
      if (activity && activity.type === 'quiz' && activity.status === 'in_progress' && activity.data) {
        setSubject(activity.subject || subjectsList[0]);
        setQuestions(activity.data.questions);
        setTotalQuestions(activity.total || activity.data.questions.length);
        setCurrentQuestionIndex(activity.data.currentQuestionIndex);
        setScore(activity.score || 0);
        setCurrentActivityId(activity.id);
        setStep("quiz");
      }
    }
  }, [location.state, resumeActivity]);

  const exams = [
    { id: "PF", name: t.practice.exams.PF },
    { id: "PRF", name: t.practice.exams.PRF },
    { id: "PC", name: t.practice.exams.PC },
    { id: "PM", name: t.practice.exams.PM },
    { id: "TJ", name: t.practice.exams.TJ },
    { id: "OAB", name: t.practice.exams.OAB },
    { id: "ENEM", name: t.practice.exams.ENEM },
    { id: "INSS", name: t.practice.exams.INSS },
    { id: "RFB", name: t.practice.exams.RFB },
  ];

  const subjectIcons: Record<string, { icon: any, color: string }> = {
    "Direito Constitucional": { icon: Scale, color: "bg-blue-600" },
    "Direito Administrativo": { icon: Briefcase, color: "bg-blue-600" },
    "Direito Penal": { icon: Gavel, color: "bg-blue-600" },
    "Processo Penal": { icon: Shield, color: "bg-blue-600" },
    "Direito Civil": { icon: FileText, color: "bg-blue-600" },
    "Processo Civil": { icon: FileText, color: "bg-blue-600" },
    "Legislação Especial": { icon: Book, color: "bg-blue-600" },
    "Língua Portuguesa": { icon: Type, color: "bg-blue-600" },
    "Raciocínio Lógico": { icon: Brain, color: "bg-blue-600" },
    "Informática": { icon: Cpu, color: "bg-blue-600" },
    "Matemática": { icon: Calculator, color: "bg-blue-600" },
    "Outra": { icon: PenTool, color: "bg-blue-600" },
  };

  const handleStart = async () => {
    
    // Map difficulty to localized string
    const difficultyMap: Record<string, string> = {
      "Easy": t.practice.difficulties.Easy,
      "Medium": t.practice.difficulties.Medium,
      "Hard": t.practice.difficulties.Hard
    };
    
    let selectedSubjectName = t.subjects[subject as keyof typeof t.subjects];
    
    if (subject === "Outra") {
      if (!customSubject.trim()) {
        alert("Por favor, digite o nome da matéria.");
        return;
      }
      selectedSubjectName = customSubject;
    }

    setStep("loading");
    
    // Initial batch configuration
    const initialCount = 1; // Reduced to 1 for "speed of light" start
    const finalCount = 5;
    setTotalQuestions(finalCount);
    
    // Fetch initial questions
    const initialQuestions = await generatePracticeQuestions(selectedSubjectName, difficultyMap[difficulty], initialCount, language);
    
    if (initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      
      // Create new activity
      const newActivityId = Date.now().toString();
      setCurrentActivityId(newActivityId);
      addActivity({
        id: newActivityId,
        type: 'quiz',
        subject: selectedSubjectName,
        score: 0,
        total: finalCount,
        timestamp: Date.now(),
        status: 'in_progress',
        data: {
          questions: initialQuestions,
          currentQuestionIndex: 0
        }
      });

      setStep("quiz");

      // Fetch remaining questions in background
      const remainingCount = finalCount - initialCount;
      
      // 1. Fetch remaining of current batch
      generatePracticeQuestions(selectedSubjectName, difficultyMap[difficulty], remainingCount, language)
        .then(remainingQuestions => {
          if (remainingQuestions.length > 0) {
            // Adjust IDs of remaining questions to avoid conflicts
            const lastId = initialQuestions.length;
            const adjustedRemainingQuestions = remainingQuestions.map((q: any, index: number) => ({
              ...q,
              id: lastId + index + 1
            }));
            
            setQuestions(prev => {
              const newQuestions = [...prev, ...adjustedRemainingQuestions];
              
              // Update activity with all questions
              setTimeout(() => {
                updateActivity(newActivityId, {
                  data: {
                    questions: newQuestions,
                    currentQuestionIndex: currentQuestionIndexRef.current
                  }
                });
              }, 0);
              
              return newQuestions;
            });
          }
        })
        .catch(err => console.error("Error fetching remaining questions:", err));

      // 2. Pre-fetch next round (5 questions) IN PARALLEL
      // This ensures the next batch is ready by the time the user finishes the current one
      generatePracticeQuestions(selectedSubjectName, difficultyMap[difficulty], 5, language)
        .then(nextRoundQuestions => setNextQuestions(nextRoundQuestions))
        .catch(e => console.error("Error pre-fetching next round:", e));
        
    } else {
      setStep("setup");
      alert("Erro ao gerar questões. Tente novamente.");
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return; // Prevent changing answer
    setSelectedOption(option);
    
    // Check answer
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option.startsWith(currentQuestion.correctAnswer);
    let newScore = score;
    
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }
    setShowExplanation(true);

    // Update questions with selected answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      selectedAnswer: option,
      isCorrect
    };
    setQuestions(updatedQuestions);

    // Update activity progress
    if (currentActivityId) {
      updateActivity(currentActivityId, {
        score: newScore,
        data: {
          questions: updatedQuestions,
          currentQuestionIndex
        }
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setShowExplanation(false);

      // Update activity progress
      if (currentActivityId) {
        updateActivity(currentActivityId, {
          data: {
            questions,
            currentQuestionIndex: nextIndex
          }
        });
      }
    } else if (questions.length >= totalQuestions) {
      handleComplete();
    }
    // If questions.length < totalQuestions, we do nothing (wait for background load)
  };

  const handleComplete = () => {
    setStep("result");
    if (currentActivityId) {
      updateActivity(currentActivityId, {
        status: 'completed',
        score: score,
        total: questions.length
      });
      addPoints(score * 10); // 10 points per correct answer
    }
  };

  const handleRestart = () => {
    setStep("setup");
    setQuestions([]);
    setTotalQuestions(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setCurrentActivityId(null);
  };

  const handleContinueSameSubject = async () => {
    let questionsToUse = nextQuestions;

    if (questionsToUse.length === 0) {
      // If pre-fetch failed or hasn't finished, fetch now
      setStep("loading");
      const difficultyMap: Record<string, string> = {
        "Easy": t.practice.difficulties.Easy,
        "Medium": t.practice.difficulties.Medium,
        "Hard": t.practice.difficulties.Hard
      };
      let selectedSubjectName = t.subjects[subject as keyof typeof t.subjects];
      if (subject === "Outra") selectedSubjectName = customSubject;
      
      try {
        questionsToUse = await generatePracticeQuestions(selectedSubjectName, difficultyMap[difficulty], 5, language);
      } catch (e) {
        console.error("Error fetching next round:", e);
        handleStart(); // Fallback to restart if fetch fails
        return;
      }
    }

    if (questionsToUse.length > 0) {
      setQuestions(questionsToUse);
      setTotalQuestions(questionsToUse.length);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setScore(0);
      
      const newActivityId = Date.now().toString();
      setCurrentActivityId(newActivityId);
      
      let selectedSubjectName = t.subjects[subject as keyof typeof t.subjects];
      if (subject === "Outra") selectedSubjectName = customSubject;

      addActivity({
        id: newActivityId,
        type: 'quiz',
        subject: selectedSubjectName,
        score: 0,
        total: questionsToUse.length,
        timestamp: Date.now(),
        status: 'in_progress',
        data: {
          questions: questionsToUse,
          currentQuestionIndex: 0
        }
      });

      setStep("quiz");
      setNextQuestions([]);

      // Pre-fetch subsequent round
      const difficultyMap: Record<string, string> = {
        "Easy": t.practice.difficulties.Easy,
        "Medium": t.practice.difficulties.Medium,
        "Hard": t.practice.difficulties.Hard
      };
      generatePracticeQuestions(selectedSubjectName, difficultyMap[difficulty], 5, language)
        .then(qs => setNextQuestions(qs))
        .catch(e => console.error("Error pre-fetching subsequent round:", e));

    } else {
      // Should not happen if fetch succeeds, but just in case
      handleStart();
    }
  };

  // --- Render Functions ---

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white pb-32 md:pb-6 transition-colors duration-300">
        <div className="p-6 max-w-md mx-auto md:max-w-5xl space-y-10">
          <header>
            <h1 className="text-2xl font-bold">Novo Simulado</h1>
            <p className="text-gray-400 text-sm">Personalize seu treino de hoje</p>
          </header>

          {/* Target Exam */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-500">
              <GraduationCap size={22} strokeWidth={2.5} />
              <h2 className="font-bold text-lg">{t.practice.targetExam}</h2>
            </div>
            <div 
              ref={scrollRef}
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeave}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 cursor-grab active:cursor-grabbing select-none"
            >
              {exams.map((exam) => (
                <motion.div
                  key={exam.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isDragging) setSelectedExam(exam.id);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[90px] h-[90px] rounded-xl border-2 transition-all p-2 flex-shrink-0 bg-[#151B2B] cursor-pointer",
                    selectedExam === exam.id
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-transparent"
                  )}
                >
                  <span className={cn(
                    "text-2xl font-bold mb-1",
                    selectedExam === exam.id ? "text-blue-500" : "text-gray-400"
                  )}>{exam.id}</span>
                  <span className="text-[9px] text-center text-gray-500 font-medium leading-tight line-clamp-2 uppercase tracking-wider">{exam.name}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Subject */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-500">
              <Book size={22} strokeWidth={2.5} />
              <h2 className="font-bold text-lg">{t.practice.subject}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjectsList.map((subj) => {
                const config = subjectIcons[subj] || { icon: Book, color: "bg-blue-600" };
                const Icon = config.icon;
                const isSelected = subject === subj;
                return (
                  <motion.button
                    key={subj}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSubject(subj)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left bg-[#151B2B]",
                      isSelected
                        ? "border-blue-600 ring-1 ring-blue-600"
                        : "border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                      config.color
                    )}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className={cn(
                      "text-xs font-bold leading-tight",
                      isSelected ? "text-white" : "text-gray-400"
                    )}>
                      {t.subjects[subj as keyof typeof t.subjects]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {subject === "Outra" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder={t.practice.customSubjectPlaceholder}
                    className="w-full p-4 rounded-2xl bg-[#151B2B] border-2 border-blue-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Difficulty */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-500">
              <Target size={22} strokeWidth={2.5} />
              <h2 className="font-bold text-lg">{t.practice.difficulty}</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((diff) => (
                <motion.button
                  key={diff}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficulty(diff)}
                  className={cn(
                    "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all",
                    difficulty === diff
                      ? "bg-white text-blue-900 border-transparent shadow-xl"
                      : "bg-[#151B2B] border-transparent text-gray-500"
                  )}
                >
                  {diff === "Easy" && <Star size={20} className={difficulty === diff ? "text-yellow-500 fill-yellow-500" : ""} />}
                  {diff === "Medium" && <Zap size={20} className={difficulty === diff ? "text-blue-600 fill-blue-600" : ""} />}
                  {diff === "Hard" && <Trophy size={20} className={difficulty === diff ? "text-red-500 fill-red-500" : ""} />}
                  <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">{t.practice.difficulties[diff]}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Start Button */}
          <div className="fixed bottom-20 left-0 right-0 p-6 md:static md:p-0 z-20 bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-transparent md:bg-none">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all max-w-md mx-auto md:max-w-none text-base"
            >
              {t.practice.start}
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{t.practice.loadingTitle}</h2>
        <p className="text-gray-400 max-w-xs">
          {t.practice.loadingDesc.replace("{subject}", t.subjects[subject as keyof typeof t.subjects])}
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (step === "quiz") {
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto bg-[#0B1120] text-white min-h-screen">
        {/* Quiz Header */}
        <header className="p-4 flex items-center justify-between border-b border-gray-800">
          <button onClick={handleRestart} className="p-2 -ml-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.subjects[subject as keyof typeof t.subjects]}</span>
            <div className="flex items-center gap-1 text-sm font-bold text-white">
              <span>{t.practice.question} {currentQuestionIndex + 1}</span>
              <span className="text-gray-500 font-normal">{t.practice.of} {totalQuestions}</span>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-800 w-full">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
            animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          <div className="prose prose-lg prose-invert max-w-none mb-8 text-white [&_*]:text-white">
            <ReactMarkdown>{currentQuestion.question}</ReactMarkdown>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = option.startsWith(currentQuestion.correctAnswer);
              
              let optionStyle = "border-gray-800 hover:border-blue-700 bg-[#151B2B]";
              
              if (selectedOption) {
                if (isSelected) {
                  optionStyle = isCorrect 
                    ? "border-green-500 bg-green-900/20 ring-1 ring-green-500" 
                    : "border-red-500 bg-red-900/20 ring-1 ring-red-500";
                } else if (isCorrect && showExplanation) {
                  optionStyle = "border-green-500 bg-green-900/20 ring-1 ring-green-500";
                } else {
                  optionStyle = "opacity-50 border-gray-800 bg-[#151B2B]";
                }
              }

              return (
                <motion.button
                  key={option}
                  whileTap={!selectedOption ? { scale: 0.99 } : {}}
                  onClick={() => handleOptionSelect(option)}
                  disabled={!!selectedOption}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border-2 transition-all flex items-start gap-3",
                    optionStyle
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    isSelected 
                      ? (isCorrect ? "border-green-500 bg-green-500 text-white" : "border-red-500 bg-red-500 text-white")
                      : (selectedOption && isCorrect && showExplanation ? "border-green-500 bg-green-500 text-white" : "border-gray-600")
                  )}>
                    {isSelected && (isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />)}
                    {selectedOption && !isSelected && isCorrect && showExplanation && <CheckCircle size={14} />}
                  </div>
                  <span className={cn(
                    "text-sm md:text-base",
                    selectedOption ? "text-gray-100" : "text-gray-300"
                  )}>
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 bg-blue-900/20 rounded-xl border border-blue-800"
              >
                <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold">
                  <HelpCircle size={20} />
                  <h3>{t.practice.explanation}</h3>
                </div>
                <div className="prose prose-sm prose-invert text-blue-100">
                  <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-[#0B1120] sticky bottom-0 z-10">
          <button
            onClick={handleNext}
            disabled={!selectedOption || (currentQuestionIndex >= questions.length - 1 && questions.length < totalQuestions)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {currentQuestionIndex >= questions.length - 1 && questions.length < totalQuestions ? (
              <Loader2 className="animate-spin" />
            ) : (
              currentQuestionIndex < totalQuestions - 1 ? t.practice.next : t.practice.seeResult
            )}
            {!(currentQuestionIndex >= questions.length - 1 && questions.length < totalQuestions) && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    );
  }

  if (step === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <div className="max-w-md mx-auto w-full flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-500 mb-6 border border-yellow-500/20"
          >
            <Trophy size={48} />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {percentage >= 70 ? t.practice.excellent : t.practice.goodEffort}
          </h2>
          
          <p className="text-gray-400 mb-8">
            {t.practice.resultDesc
              .replace("{score}", score.toString())
              .replace("{total}", questions.length.toString())
              .replace("{subject}", t.subjects[subject as keyof typeof t.subjects])
            }
          </p>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="p-4 bg-[#151B2B] rounded-2xl border border-gray-800">
              <p className="text-xs text-gray-500 uppercase font-bold">{t.practice.score}</p>
              <p className="text-2xl font-bold text-blue-400">{score * 10}</p>
            </div>
            <div className="p-4 bg-[#151B2B] rounded-2xl border border-gray-800">
              <p className="text-xs text-gray-500 uppercase font-bold">{t.practice.accuracy}</p>
              <p className="text-2xl font-bold text-green-400">{percentage}%</p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleContinueSameSubject}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowRight size={20} />
              {t.practice.continueSameSubject}
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#151B2B] text-blue-400 font-bold rounded-xl hover:bg-gray-800 border border-blue-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              {t.practice.restart}
            </button>
            <Link to="/" className="block w-full">
              <button className="w-full py-3 bg-[#151B2B] text-gray-300 font-bold rounded-xl hover:bg-gray-800 border border-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Home size={20} />
                {t.practice.backHome}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
