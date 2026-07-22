import { create } from 'zustand';
export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unread: 0,
    load: async () => {
        try {
            const res = await fetch('/api/v1/notifications?limit=10');
            const data = await res.json();
            if (data.data) {
                set({ notifications: data.data, unread: data.unread || 0 });
            }
        }
        catch { }
    },
    markRead: async (id) => {
        await fetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
        const n = get().notifications.map(n => n.id === id ? { ...n, read: 1 } : n);
        set({ notifications: n, unread: Math.max(0, get().unread - 1) });
    },
    markAllRead: async () => {
        await fetch('/api/v1/notifications/read-all', { method: 'PUT' });
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: 1 })), unread: 0 }));
    },
}));
