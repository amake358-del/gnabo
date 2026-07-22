import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Table } from '../components/ui/Table'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Badge } from '../components/ui/Badge'
import { supabase } from '../services/supabase'
import { formatCurrency } from '../utils/format'
import { toast } from '../utils/notify'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import type { CatalogType } from '../types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const modeleSchema = z.object({
  type_id: z.string().min(1, 'Le type est requis'),
  name: z.string().min(1, 'Le nom est requis'),
  prix: z.coerce.number().min(0, 'Le prix doit être positif'),
  description: z.string().optional(),
  status: z.string().optional(),
})

type ModeleForm = z.infer<typeof modeleSchema>

export function ModelesPage() {
  const [modeles, setModeles] = useState<any[]>([])
  const [types, setTypes] = useState<CatalogType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ModeleForm>({ resolver: zodResolver(modeleSchema) as any })

  const load = async () => {
    setLoading(true)
    try {
      let query = supabase.from('catalog_modeles').select('*, catalog_types(name)')
      if (filterType) query = query.eq('type_id', filterType)
      if (search) query = query.ilike('name', `%${search}%`)
      const [mRes, tRes] = await Promise.all([query, supabase.from('catalog_types').select('*')])
      const mapped = (mRes.data ?? []).map((m: any) => ({
        ...m,
        type_name: m.catalog_types?.name ?? '',
      }))
      setModeles(mapped)
      setTypes(tRes.data ?? [])
    } catch (err: any) { toast(err.message || 'Erreur chargement', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterType])

  const openCreate = () => { setEditing(null); reset({ status: 'actif', prix: 0 }); setModalOpen(true) }
  const openEdit = (m: any) => { setEditing(m); reset(m); setModalOpen(true) }

  const onSubmit = async (data: ModeleForm) => {
    setSaving(true)
    try {
      if (editing) await supabase.from('catalog_modeles').update(data).eq('id', editing.id)
      else await supabase.from('catalog_modeles').insert(data)
      setModalOpen(false)
      load()
    } catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    try { await supabase.from('catalog_modeles').delete().eq('id', deleteId); setDeleteId(null); load() }
    catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'name', label: 'Modèle' },
    { key: 'type_name', label: 'Type' },
    { key: 'prix', label: 'Prix m²', render: (m: any) => formatCurrency(m.prix) },
    { key: 'status', label: 'Statut', render: (m: any) => <Badge variant={m.status === 'actif' ? 'green' : 'default'}>{m.status}</Badge> },
    { key: 'actions', label: '', hideLabel: true, render: (m: any) => (
      <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil size={14} /></Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(m.id)}><Trash2 size={14} className="text-red-500" /></Button>
      </div>
    ), className: 'w-24' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modèles</h1>
        <Button onClick={openCreate}><Plus size={16} /><span className="hidden lg:inline">Nouveau modèle</span></Button>
      </div>
      <Card>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4">
          <div className="relative w-full lg:flex-1 lg:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select options={types.map(t => ({ value: t.id, label: t.name }))} placeholder="Tous les types" value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full lg:max-w-[200px]" />
        </div>
        <Table columns={columns} data={modeles} loading={loading} emptyMessage="Aucun modèle trouvé" />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le modèle' : 'Nouveau modèle'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Type *" options={types.map(t => ({ value: t.id, label: t.name }))} placeholder="Sélectionner un type" {...register('type_id')} error={errors.type_id?.message} />
          <Input label="Nom *" {...register('name')} error={errors.name?.message} />
          <Input label="Prix au m² *" type="number" step="0.000001" {...register('prix')} error={errors.prix?.message} />
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[80px] resize-none" {...register('description')} />
          </div>
          <Select label="Statut" options={[{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }]} {...register('status')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>{editing ? 'Modifier' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer ce modèle ?" message="Cette action est irréversible." loading={saving} />
    </div>
  )
}