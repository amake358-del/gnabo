import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
const AuthContext = createContext(null);
async function fetchProfile(userId, email) {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('nom, role')
        .eq('id', userId)
        .maybeSingle();
    if (!profile && !error) {
        const nom = email.split('@')[0];
        const role = email === 'pdg@gnabo.com' ? 'pdg' : 'admin';
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
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const appUser = await fetchProfile(session.user.id, session.user.email ?? '');
                setUser(appUser);
            }
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const appUser = await fetchProfile(session.user.id, session.user.email ?? '');
                setUser(appUser);
            }
            else {
                setUser(null);
            }
        });
        return () => subscription.unsubscribe();
    }, []);
    async function login(email, mot_de_passe) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: mot_de_passe,
        });
        if (error)
            throw new Error(error.message);
    }
    async function logout() {
        await supabase.auth.signOut();
        setUser(null);
    }
    return (_jsx(AuthContext.Provider, { value: { user, login, logout, loading }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
