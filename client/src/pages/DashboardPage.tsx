import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/LoadingState';
import { Users, Smartphone, FileText, DollarSign, Zap, Wrench, Layers, ArrowRight, Receipt } from 'lucide-react';

interface DashboardStats {
  clients: number
  appareils_en_cours: number
  devis_en_attente: number
  caisse_jour: number
}

const services = [
  {
    slug: 'electronique',
    label: 'Électronique',
    desc: 'Réception, diagnostic, réparation, livraison',
    icon: Zap,
    color: '#2980B9',
    bg: 'bg-[#2980B9]/10',
    links: [
      { to: '/electronique/reception', label: 'Nouvelle réception' },
      { to: '/electronique/appareils', label: 'Voir les appareils' },
    ],
  },
  {
    slug: 'aluminium',
    label: 'Aluminium & Inox',
    desc: 'Devis, fabrication, pose',
    icon: Layers,
    color: '#A8B5B8',
    bg: 'bg-[#A8B5B8]/20',
    links: [
      { to: '/devis', label: 'Nouveau devis' },
      { to: '/catalogue', label: 'Catalogue' },
    ],
  },
  {
    slug: 'metallique',
    label: 'Métallique',
    desc: 'Devis, fabrication, installation',
    icon: Wrench,
    color: '#7F8C8D',
    bg: 'bg-[#7F8C8D]/20',
    links: [
      { to: '/devis', label: 'Nouveau devis' },
      { to: '/modeles', label: 'Modèles' },
    ],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('appareils').select('id', { count: 'exact', head: true }).eq('statut', 'en_cours'),
      supabase.from('devis').select('id', { count: 'exact', head: true }).eq('statut', 'brouillon'),
      supabase.from('caisse').select('montant').gte('cree_le', new Date().toISOString().slice(0, 10)),
    ]).then(([clients, appareils, devis, caisse]) => {
      const caisseJour = caisse.data?.reduce((sum, row) => sum + (row.montant || 0), 0) ?? 0;
      setStats({
        clients: clients.count ?? 0,
        appareils_en_cours: appareils.count ?? 0,
        devis_en_attente: devis.count ?? 0,
        caisse_jour: caisseJour,
      });
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Clients', value: stats?.clients ?? 0, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Appareils en cours', value: stats?.appareils_en_cours ?? 0, icon: Smartphone, color: 'text-electronique', bg: 'bg-electronique/10' },
    { label: 'Devis en attente', value: stats?.devis_en_attente ?? 0, icon: FileText, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/20' },
    { label: 'Caisse du jour', value: stats ? `${stats.caisse_jour.toLocaleString()} FG` : '-', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  if (loading) return <LoadingState message="Chargement du tableau de bord..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary-600 dark:text-white">Tableau de bord</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bienvenue, {user?.nom || 'Utilisateur'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <Card key={svc.slug} hover className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: svc.color }} />
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${svc.bg} flex items-center justify-center shrink-0`}>
                <svc.icon size={24} style={{ color: svc.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{svc.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{svc.desc}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {svc.links.map((link) => (
                    <button
                      key={link.to}
                      onClick={() => navigate(link.to)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      {link.label} <ArrowRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {user?.role === 'pdg' && (
          <Card hover className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Receipt size={24} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Finances</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Accès réservé au PDG</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => navigate('/historique')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    Voir l'historique <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}