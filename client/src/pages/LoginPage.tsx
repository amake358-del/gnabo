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
      } catch {
        // Paramètres non disponibles
      }
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
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in" data-testid="login-form">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-white shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 size={32} className="text-primary-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{companyName || 'Votre entreprise'}</h1>
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
        <p className="text-center text-xs text-white/50 mt-4">
          ERP professionnel de gestion multi-services
        </p>
      </div>
    </div>
  );
}
