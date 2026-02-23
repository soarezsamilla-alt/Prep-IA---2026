import { Home, BookOpen, Camera, MessageSquare, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useUser();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.sidebar.home, path: "/" },
    { icon: BookOpen, label: t.sidebar.practice, path: "/practice" },
    { icon: Camera, label: t.sidebar.scan, path: "/scan" },
    { icon: MessageSquare, label: t.sidebar.chat, path: "/chat" },
    { icon: User, label: t.sidebar.profile, path: "/profile" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">P</span>
          Prep IA
        </h1>
      </div>

      <div className="px-6 pb-6 flex items-center gap-3">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
        ) : (
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
            {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>{t.sidebar.logout}</span>
        </button>
      </div>
    </aside>
  );
}
