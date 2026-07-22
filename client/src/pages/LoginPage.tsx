import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('parametres').select('cle, valeur')
        if (data) {
          const cfg: Record<string, string> = {}
          for (const r of data) cfg[r.cle] = r.valeur
          setCompanyName(cfg.entreprise_nom || '')
          setLogoUrl(cfg.entreprise_logo || '')
        }
      } catch (err) { console.error('Erreur chargement paramètres:', err) }
    })()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, motDePasse);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_50%)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,179,66,0.1),transparent_50%)]" aria-hidden="true" />
        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-white/20">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-12 h-12 object-contain" />
            ) : (
              <Building2 size={36} className="text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">{companyName || 'GNABO MULTI-SERVICES'}</h2>
          <p className="text-white/70 text-lg">ERP professionnel de gestion</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-semibold text-sm">Aluminium & Inox</p>
              <p className="text-white/50 text-xs mt-1">Fabrication sur mesure</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-semibold text-sm">Métallique</p>
              <p className="text-white/50 text-xs mt-1">Serrurerie</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-semibold text-sm">Électronique</p>
              <p className="text-white/50 text-xs mt-1">Réparation</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-gray-950">
        <div className="w-full max-w-sm animate-fade-in" data-testid="login-form">
          <div className="text-center mb-8 lg:hidden">
            <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{companyName || 'Connexion'}</h1>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Connexion</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accédez à votre espace de gestion</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm mb-6">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                required
              />
              <Input
                label="Mot de passe"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button type="submit" className="w-full justify-center" size="lg" loading={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            GNABO MULTI-SERVICES ERP &mdash; v3.0
          </p>
        </div>
      </div>
    </div>
  );
}
