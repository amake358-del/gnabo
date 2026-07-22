import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: { id: string; username: string; role: string; entreprise_id: string } | null
  loading: boolean
  setAuth: (token: string, user: any) => void
  logout: () => void
  setLoading: (v: boolean) => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    set({ token, user, loading: false })
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    set({ token: null, user: null, loading: false })
  },
  setLoading: (loading) => set({ loading }),
  hydrate: () => {
    const token = localStorage.getItem('auth_token')
    const raw = localStorage.getItem('auth_user')
    if (token && raw) {
      try { set({ token, user: JSON.parse(raw), loading: false }) }
      catch { set({ token: null, user: null, loading: false }) }
    } else {
      set({ loading: false })
    }
  },
}))
