import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntrepriseStore } from '../stores/entrepriseStore'
import { Building2, ChevronRight, Loader2, Cpu, Wrench, Zap } from 'lucide-react'

const services = [
  { id: 'aluminium', name: 'Aluminium & Inox', icon: 'aluminium', description: 'Fabrication et pose', primary_color: '#A8B5B8' },
  { id: 'metallique', name: 'Métallique', icon: 'metal', description: 'Serrurerie et construction', primary_color: '#7F8C8D' },
  { id: 'electronique', name: 'Électronique', icon: 'cpu', description: 'Réparation et maintenance', primary_color: '#2980B9' },
]

const serviceIcons: Record<string, typeof Building2> = {
  aluminium: Wrench,
  metal: Building2,
  cpu: Cpu,
}

export function ServiceSelectPage() {
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const { setCurrent } = useEntrepriseStore()
  const navigate = useNavigate()

  useEffect(() => {
    import('../services/supabase').then(({ supabase }) =>
      supabase.from('parametres').select('cle, valeur').then(({ data }) => {
        const cfg: Record<string, string> = {}
        if (data) for (const r of data) cfg[r.cle] = r.valeur
        setCompanyName(cfg.entreprise_nom || '')
      })
    ).finally(() => setLoading(false))
  }, [])

  const handleSelect = async (s: typeof services[0]) => {
    setCurrent({ id: s.id, company_name: companyName, slug: s.id, logo_url: '', primary_color: s.primary_color, icon: s.icon })
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{companyName || ''}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Logiciel de gestion</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6 font-medium">Choisissez un service</p>
        </div>

        <div className="space-y-4">
          {services.map(s => {
            const Icon = serviceIcons[s.icon] || Building2
            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="w-full group flex items-center gap-5 p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 text-left"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: s.primary_color }}
                >
                  <Icon size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  {s.description && <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{s.description}</p>}
                </div>
                <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-10">
          {companyName || ''} &middot; v3.0
        </p>
      </div>
    </div>
  )
}