import { create } from 'zustand'
import { supabase } from '../services/supabase'

type Notification = {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  cree_le: string
}

type NotificationState = {
  notifications: Notification[]
  unread: number
  load: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unread: 0,
  load: async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('cree_le', { ascending: false })
        .limit(10)
      if (data) {
        set({ notifications: data, unread: data.filter(n => !n.read).length })
      }
    } catch {}
  },
  markRead: async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    const n = get().notifications.map(n => n.id === id ? { ...n, read: true } : n)
    set({ notifications: n, unread: Math.max(0, get().unread - 1) })
  },
  markAllRead: async () => {
    await supabase.from('notifications').update({ read: true }).neq('id', 0)
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })), unread: 0 }))
  },
}))
