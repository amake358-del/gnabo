import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table } from '../components/ui/Table'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { supabase } from '../services/supabase'
import { formatDate } from '../utils/format'
import { toast } from '../utils/notify'
import { Trash2, ExternalLink, Plus } from 'lucide-react'

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
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '', role: 'admin' })
  const [creating, setCreating] = useState(false)

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
      toast('Utilisateur supprimé', 'success')
    } catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom || !form.email || !form.mot_de_passe) return
    setCreating(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.mot_de_passe,
        options: { data: { nom: form.nom, role: form.role } }
      })
      if (error) throw error
      setForm({ nom: '', email: '', mot_de_passe: '', role: 'admin' })
      setShowForm(false)
      toast('Utilisateur créé. Vérifier les emails de confirmation.', 'success')
      setTimeout(load, 2000)
    } catch (err: any) { toast(err.message, 'error') }
    finally { setCreating(false) }
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /><span className="hidden lg:inline">Nouvel utilisateur</span>
          </Button>
          {SUPABASE_PROJECT_URL && (
            <Button variant="secondary" onClick={() => window.open(`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_URL}/auth/users`, '_blank')}>
              <ExternalLink size={16} /><span className="hidden lg:inline">Supabase Auth</span>
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="font-semibold">Nouvel utilisateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nom *" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              <Input label="Email *" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Mot de passe *" type="password" required value={form.mot_de_passe} onChange={e => setForm({ ...form, mot_de_passe: e.target.value })} />
              <Select label="Rôle" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} options={[
                { value: 'pdg', label: 'PDG' },
                { value: 'admin', label: 'Admin' },
              ]} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button type="submit" loading={creating}>Créer</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="Aucun utilisateur" />
      </Card>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer l'utilisateur ?" message="Cette action est irréversible." loading={saving} />
    </div>
  )
}
