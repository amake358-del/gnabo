import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { AlertTriangle, Building2 } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('sb-nurtpoplxxpvxifwoynm-auth-token')
    if (session) navigate(location.state?.from?.pathname || '/select-service', { replace: true })
    ;(async () => {
      const { data } = await supabase.from('parametres').select('cle, valeur')
      if (data) {
        const cfg: Record<string, string> = {}
        for (const r of data) cfg[r.cle] = r.valeur
        setCompanyName(cfg.entreprise_nom || '')
        setLogoUrl(cfg.entreprise_logo || '')
      }
    })()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { setError('Identifiants requis'); return }
    setSaving(true); setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      })
      if (authError) { setError(authError.message); return }
      if (!data.user) { setError('Erreur de connexion'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setAuth(data.session.access_token, { id: data.user.id, email: data.user.email, nom: profile?.nom, role: profile?.role })
      navigate('/select-service', { replace: true })
    } catch { setError('Erreur réseau') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-2" />
            ) : (
              <Building2 size={28} className="text-blue-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{companyName || 'Votre entreprise'}</h1>
          <p className="text-sm text-gray-500 mt-1">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4 shadow-sm">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}

          <Button className="w-full" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  )
}
