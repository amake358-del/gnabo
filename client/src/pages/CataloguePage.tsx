import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { toast } from '../utils/notify'
import { Plus, Package, Pencil, Trash2 } from 'lucide-react'
import type { CatalogType } from '../types'

export function CataloguePage() {
  const [types, setTypes] = useState<CatalogType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogType | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('catalog_types').select('*')
      setTypes(data ?? [])
    } catch (err: any) { toast(err.message || 'Erreur chargement', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setName(''); setModalOpen(true) }
  const openEdit = (t: CatalogType) => { setEditing(t); setName(t.name); setModalOpen(true) }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) await supabase.from('catalog_types').update({ name: name.trim() }).eq('id', editing.id)
      else await supabase.from('catalog_types').insert({ name: name.trim() })
      setModalOpen(false)
      load()
    } catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    try { await supabase.from('catalog_types').delete().eq('id', deleteId); setDeleteId(null); load() }
    catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size={40} /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalogue</h1>
        <Button onClick={openCreate}><Plus size={16} /><span className="hidden lg:inline">Nouveau type</span></Button>
      </div>
      {types.length === 0 ? (
        <Card><div className="text-center py-12 text-gray-500"><Package size={48} className="mx-auto mb-4 opacity-50" /><p>Aucun type de catalogue</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map(t => (
            <Card key={t.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{t.name}</h3>
                  <p className="text-sm text-gray-500">Créé le {new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)}><Trash2 size={14} className="text-red-500" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le type' : 'Nouveau type'}>
        <Input label="Nom du type" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Aluminium, Vitrerie..." />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Modifier' : 'Créer'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer ce type ?" message="Cette action est irréversible si des modèles ou devis y sont liés." loading={saving} />
    </div>
  )
}