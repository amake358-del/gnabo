import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { supabase } from '../services/supabase'
import { formatDate } from '../utils/format'
import { toast } from '../utils/notify'
import { Trash2, ExternalLink } from 'lucide-react'

const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '') || ''

interface ProfileUser {
  id: string
  nom: string
  role: string
  cree_le: string
}

export function UsersPage() {
  const [users, setUsers] = useState<ProfileUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('profiles').select('*').order('cree_le', { ascending: false })
      setUsers(data ?? [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', deleteId)
      if (error) throw error
      setDeleteId(null)
      load()
    } catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'role', label: 'Rôle' },
    { key: 'cree_le', label: 'Créé le', render: (u: ProfileUser) => formatDate(u.cree_le) },
    { key: 'actions', label: '', hideLabel: true, render: (u: ProfileUser) => (
      <div className="flex justify-end" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(u.id)}><Trash2 size={14} className="text-red-500" /></Button>
      </div>
    ), className: 'w-20' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        {SUPABASE_PROJECT_URL && (
          <Button onClick={() => window.open(`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_URL}/auth/users`, '_blank')}>
            <ExternalLink size={16} /><span className="hidden lg:inline">Gérer dans Supabase</span>
          </Button>
        )}
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="Aucun utilisateur" />
      </Card>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer l'utilisateur ?" message="Cette action est irréversible." loading={saving} />
    </div>
  )
}