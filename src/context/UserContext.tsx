import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
  };
};

type UserContextType = {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (updates: Partial<User["preferences"]>) => void;
};

const defaultUser: User = {
  name: "Usuário",
  email: "",
  role: "Estudante",
  avatarUrl: null,
  preferences: {
    notifications: true,
    publicProfile: false,
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        // If session is invalid, ensure we are logged out
        supabase.auth.signOut();
        setIsAuthenticated(false);
        setUser(defaultUser);
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || "Usuário",
          email: session.user.email || "",
          role: session.user.user_metadata.role || "Estudante",
          avatarUrl: session.user.user_metadata.avatar_url || null,
          preferences: defaultUser.preferences, // Load from DB if available
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event as string) === 'TOKEN_REFRESH_REVOKED' || event === 'SIGNED_OUT') {
        setUser(defaultUser);
        setIsAuthenticated(false);
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || "Usuário",
          email: session.user.email || "",
          role: session.user.user_metadata.role || "Estudante",
          avatarUrl: session.user.user_metadata.avatar_url || null,
          preferences: defaultUser.preferences,
        });
        setIsAuthenticated(true);
      } else {
        setUser(defaultUser);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "Estudante",
        },
      },
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(defaultUser);
  };

  const updateUser = async (updates: Partial<User>) => {
    // Optimistic update
    setUser((prev) => ({ ...prev, ...updates }));

    if (isAuthenticated) {
      const data: any = {};
      if (updates.name !== undefined) data.name = updates.name;
      if (updates.role !== undefined) data.role = updates.role;
      if (updates.avatarUrl !== undefined) data.avatar_url = updates.avatarUrl;

      const attributes: any = { data };

      if (updates.email && updates.email !== user.email) {
        attributes.email = updates.email;
      }

      const { error } = await supabase.auth.updateUser(attributes);
      
      if (error) {
        console.error("Error updating user:", error);
        alert("Erro ao atualizar perfil: " + error.message);
      }
    }
  };

  const updatePreferences = (updates: Partial<User["preferences"]>) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
    // TODO: Save preferences to DB
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser, updatePreferences }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
