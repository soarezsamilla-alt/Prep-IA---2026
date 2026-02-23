import { useState } from "react";
import { User, Settings, LogOut, Bell, Shield, HelpCircle, ChevronLeft, Camera, Mail, Save, Globe } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/translations";

type View = "main" | "personal" | "notifications" | "privacy" | "settings" | "help";

export default function Profile() {
  const { user, updateUser, updatePreferences, logout } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<View>("main");
  
  // Local state for forms
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateUser({ name, email, role });
    setCurrentView("main");
  };

  const renderHeader = (title: string, backTo: View = "main") => (
    <header className="flex items-center gap-4 mb-8">
      <button 
        onClick={() => setCurrentView(backTo)}
        className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{title}</h1>
    </header>
  );

  if (currentView === "personal") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {renderHeader(t.profile.personalData)}
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.profile.name}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.profile.email}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.profile.role}</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleSaveProfile}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {t.profile.save}
          </button>
        </div>
      </div>
    );
  }

  if (currentView === "notifications") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {renderHeader(t.profile.notifications)}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t.profile.pushNotifications}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.profile.pushDesc}</p>
            </div>
            <button 
              onClick={() => updatePreferences({ notifications: !user.preferences.notifications })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                user.preferences.notifications ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                user.preferences.notifications ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "privacy") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {renderHeader(t.profile.privacy)}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t.profile.publicProfile}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.profile.publicDesc}</p>
            </div>
            <button 
              onClick={() => updatePreferences({ publicProfile: !user.preferences.publicProfile })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                user.preferences.publicProfile ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                user.preferences.publicProfile ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "settings") {
    const languages: { code: Language; label: string; flag: string }[] = [
      { code: 'pt', label: 'Português', flag: '🇧🇷' },
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'es', label: 'Español', flag: '🇪🇸' },
    ];

    return (
      <div className="p-6 max-w-2xl mx-auto">
        {renderHeader(t.profile.settings)}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe size={18} />
                {t.profile.language}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all",
                      language === lang.code 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </span>
                    {language === lang.code && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>{t.profile.appVersion}: 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "help") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {renderHeader(t.profile.help)}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t.profile.howItWorks}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{t.profile.howItWorksDesc}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t.profile.contact}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{t.profile.contactDesc}</p>
            <a href="mailto:suporte@prepia.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">suporte@prepia.com</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 dark:text-blue-400 text-2xl md:text-3xl font-bold">
                {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
            <Camera size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors">{user.name}</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 transition-colors">{user.role}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{user.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 transition-colors">{t.profile.account}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden transition-colors">
              <button 
                onClick={() => setCurrentView("personal")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <User size={20} />
                  <span className="font-medium">{t.profile.personalData}</span>
                </div>
              </button>
              <button 
                onClick={() => setCurrentView("notifications")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <Bell size={20} />
                  <span className="font-medium">{t.profile.notifications}</span>
                </div>
                {user.preferences.notifications && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-bold">On</span>
                )}
              </button>
              <button 
                onClick={() => setCurrentView("privacy")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <Shield size={20} />
                  <span className="font-medium">{t.profile.privacy}</span>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 transition-colors">{t.profile.support}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden transition-colors">
              <button 
                onClick={() => setCurrentView("settings")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <Settings size={20} />
                  <span className="font-medium">{t.profile.settings}</span>
                </div>
              </button>
              <button 
                onClick={() => setCurrentView("help")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <HelpCircle size={20} />
                  <span className="font-medium">{t.profile.help}</span>
                </div>
              </button>
            </div>
          </section>

          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
          >
            <LogOut size={20} />
            {t.profile.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
