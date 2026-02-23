import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAI } from "@/services/ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useActivity } from "@/context/ActivityContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function Chat() {
  const { t, language } = useLanguage();
  const { addActivity } = useActivity();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t.chat.welcome,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      // Only update the first message if it's the welcome message
      if (prev.length > 0 && prev[0].id === "1") {
        const newMessages = [...prev];
        newMessages[0] = { ...newMessages[0], content: t.chat.welcome };
        return newMessages;
      }
      return prev;
    });
  }, [t.chat.welcome]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      content: m.content
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithAI(input, history, language);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response || "Desculpe, não consegui processar sua mensagem.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Log activity only once per session or periodically? 
      // Let's log it as a new activity if it's the first user message in a while or just update a "Chat Session" activity.
      // For simplicity, let's just log a "Chat" activity for every interaction for now, or maybe just once.
      // Better: Log a completed activity for each interaction to show usage.
      addActivity({
        id: Date.now().toString(),
        type: 'chat',
        timestamp: Date.now(),
        status: 'completed',
        score: 0,
        total: 1
      });

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 md:rounded-3xl overflow-hidden transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white transition-colors">{t.chat.title}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.chat.online}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ id: "1", role: "assistant", content: t.chat.welcome, timestamp: new Date() }])}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
          title="Limpar conversa"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3 max-w-[85%] md:max-w-[70%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                message.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700"
              )}>
                {message.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              
              <div className={cn(
                "p-3 md:p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed",
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
              )}>
                <div className={cn(
                  "prose prose-sm max-w-none",
                  message.role === "user" ? "prose-invert" : "dark:prose-invert"
                )}>
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <span className={cn(
                  "text-[10px] mt-2 block opacity-70",
                  message.role === "user" ? "text-blue-100" : "text-gray-400"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-gray-100 dark:border-gray-700 text-blue-600 dark:text-blue-400">
              <Sparkles size={16} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t.chat.typing}</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 z-10 md:static pb-24 md:pb-4 transition-colors">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t.chat.placeholder}
            className="w-full pl-4 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
