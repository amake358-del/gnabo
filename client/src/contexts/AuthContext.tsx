import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface AppUser {
  id: string;
  nom: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, mot_de_passe: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string, email: string): Promise<AppUser> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('nom, role')
    .eq('id', userId)
    .maybeSingle();

  if (!profile && !error) {
    const nom = email.split('@')[0];
    const role = 'admin';
    await supabase.from('profiles').insert({ id: userId, nom, role });
    return { id: userId, email, nom, role };
  }

  return {
    id: userId,
    email,
    nom: profile?.nom ?? 'Utilisateur',
    role: profile?.role ?? 'admin',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await fetchProfile(session.user.id, session.user.email ?? '');
        setUser(appUser);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const appUser = await fetchProfile(session.user.id, session.user.email ?? '');
          setUser(appUser);
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, mot_de_passe: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: mot_de_passe,
    });
    if (error) throw new Error(error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
