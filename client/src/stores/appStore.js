import { create } from 'zustand';
export const useAppStore = create()((set) => ({
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: window.innerWidth >= 1024,
    toggleDarkMode: () => set((state) => {
        const next = !state.darkMode;
        localStorage.setItem('darkMode', String(next));
        if (next)
            document.documentElement.classList.add('dark');
        else
            document.documentElement.classList.remove('dark');
        return { darkMode: next };
    }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
