import { Menu, LogOut, Building2 } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { Sidebar } from './layout/Sidebar'
import { ToastContainer } from './ui/Toast'
import { OfflineBanner } from './pwa/OfflineBanner'
import { PwaInstallPrompt } from './pwa/PwaInstallPrompt'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { useEntrepriseStore } from '../stores/entrepriseStore'
import { setCurrency } from '../utils/format'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { toggleSidebar } = useAppStore()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { companyName, current, load } = useEntrepriseStore()

  useEffect(() => { if (!companyName) load() }, [])
  useEffect(() => { if (current?.currency) setCurrency(current.currency) }, [current?.currency])

  const breadcrumb = () => {
    const path = location.pathname
    if (path === '/') return 'Tableau de bord'
    const parts = path.split('/').filter(Boolean)
    return parts.map((p) => {
      const label = p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')
      return label
    }).join(' / ')
  }

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-gray-900">
      <OfflineBanner />
      <PwaInstallPrompt />
      <ToastContainer />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-b border-surface-200 dark:border-gray-700 sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-3 shadow-warm-sm">
          <button type="button" onClick={toggleSidebar} className="p-2 rounded-xl lg:hidden hover:bg-surface-100 dark:hover:bg-gray-700 transition-colors">
            <Menu size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <Building2 size={14} className="shrink-0" />
            <span className="hidden sm:inline">{companyName || 'ERP'}</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs">{breadcrumb()}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{user?.nom || ''}</span>
            <button type="button"               onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </header>
        <main key={location.pathname} className="flex-1 p-4 lg:p-6 overflow-auto page-enter">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
