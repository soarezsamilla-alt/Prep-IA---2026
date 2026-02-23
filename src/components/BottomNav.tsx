import { Home, BookOpen, Camera, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.sidebar.home, path: "/" },
    { icon: BookOpen, label: t.sidebar.practice, path: "/practice" },
    { icon: Camera, label: t.sidebar.scan, path: "/scan" },
    { icon: MessageSquare, label: t.sidebar.chat, path: "/chat" },
    { icon: User, label: t.sidebar.profile, path: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0B1120] border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 z-50 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 transition-colors relative",
                isActive ? "text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
