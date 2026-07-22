import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Database, ExternalLink } from 'lucide-react'

export function BackupsPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center pt-12">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
          <Database size={28} className="text-primary-500" />
        </div>
        <h1 className="text-2xl font-bold">Sauvegardes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Les sauvegardes sont gérées automatiquement par Supabase.
        </p>
      </div>
      <Card className="p-6 space-y-4">
        <p className="text-sm text-gray-500">
          Votre base de données PostgreSQL est automatiquement sauvegardée chaque jour par Supabase.
          Les sauvegardes sont conservées pendant 7 jours (plan gratuit) ou plus selon votre abonnement.
        </p>
        <Button onClick={() => window.open('https://supabase.com/dashboard/project/nurtpoplxxpvxifwoynm/database/backups', '_blank')}>
          <ExternalLink size={16} /> Voir les sauvegardes Supabase
        </Button>
      </Card>
    </div>
  )
}
