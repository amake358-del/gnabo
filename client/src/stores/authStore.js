import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    token: null,
    user: null,
    loading: true,
    setAuth: (token, user) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        set({ token, user, loading: false });
    },
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        set({ token: null, user: null, loading: false });
    },
    setLoading: (loading) => set({ loading }),
    hydrate: () => {
        const token = localStorage.getItem('auth_token');
        const raw = localStorage.getItem('auth_user');
        if (token && raw) {
            try {
                set({ token, user: JSON.parse(raw), loading: false });
            }
            catch {
                set({ token: null, user: null, loading: false });
            }
        }
        else {
            set({ loading: false });
        }
    },
}));
