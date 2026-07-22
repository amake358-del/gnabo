import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '../ui/Button'

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 max-w-xs space-y-3">
      <button type="button" onClick={() => setVisible(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <Download size={20} className="text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-semibold">Installer l'application</p>
          <p className="text-xs text-gray-500">Ajoutez l'application à votre écran d'accueil</p>
        </div>
      </div>
      <Button size="sm" className="w-full" onClick={handleInstall}>
        <Download size={14} /> Installer
      </Button>
    </div>
  )
}
