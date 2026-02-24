import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Mail, Lock, User, ArrowRight, CheckCircle, Info } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
      } else {
        const { error } = await signup(email, password, name);
        if (error) throw error;
        alert("Conta criada com sucesso! Verifique seu email para confirmar.");
      }
      navigate("/");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B1120] md:p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-[#151B2B] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[600px]">
        
        {/* Left Side - Hero/Image */}
        <div className="w-full md:w-1/2 bg-blue-600 relative p-8 md:p-12 flex flex-col justify-between text-white overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">P</div>
              <span className="text-2xl font-bold tracking-tight">Prep IA</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Sua jornada para a aprovação começa aqui.
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-md">
              A plataforma de inteligência artificial mais avançada para preparação de concursos públicos.
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-12 space-y-4 hidden md:block">
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle size={20} className="text-blue-300" />
              <span>Simulados personalizados com IA</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle size={20} className="text-blue-300" />
              <span>Tire dúvidas instantaneamente</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle size={20} className="text-blue-300" />
              <span>Acompanhe seu progresso detalhado</span>
            </div>
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl -ml-20 -mb-20 opacity-50" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white dark:bg-[#151B2B] grow">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                {isLogin 
                  ? "Entre para continuar seus estudos." 
                  : "Comece sua preparação hoje mesmo."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          required={!isLogin}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
                          placeholder="Seu nome"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isLogin ? "E-mail" : "E-mail de Compra"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
                    placeholder={isLogin ? "seu@email.com" : "E-mail usado na compra"}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
                    * Use o mesmo e-mail utilizado na compra do acesso.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Entrar na Plataforma" : "Criar Minha Conta"}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-blue-600 dark:text-blue-400 font-bold hover:underline focus:outline-none"
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex gap-3">
                <Info className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" size={18} />
                <div className="space-y-2">
                  <p><strong>Dica importante:</strong> Após criar sua conta com o e-mail de compra, caso ocorra algum erro ao entrar, atualize a página e tente fazer login novamente.</p>
                  <p>Verifique também sua caixa de entrada (Gmail, Outlook) para confirmar o cadastro se necessário.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
