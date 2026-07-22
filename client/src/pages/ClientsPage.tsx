import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { toast } from '../utils/notify';
import { Plus, Search, Users } from 'lucide-react';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  ville: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', email: '', ville: '' });
  const [saving, setSaving] = useState(false);

  async function loadClients() {
    setLoading(true);
    let query = supabase.from('clients').select('*').order('nom', { ascending: true });
    if (search) query = query.ilike('nom', `%${search}%`);
    const { data } = await query;
    setClients(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadClients() }, [search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('clients').insert({
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        email: form.email,
        ville: form.ville,
      });
      if (error) throw error;
      setForm({ nom: '', prenom: '', telephone: '', email: '', ville: '' });
      setShowForm(false);
      loadClients();
      toast('Client créé avec succès', 'success');
    } catch (err: any) {
      toast(err.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'email', label: 'Email' },
    { key: 'ville', label: 'Ville' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          <span className="hidden lg:inline">{showForm ? 'Annuler' : 'Nouveau client'}</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom *"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <Input
                label="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Téléphone"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <Input
              label="Ville"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button type="submit" loading={saving}>Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="relative w-full lg:max-w-sm mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size={32} /></div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title="Aucun client"
            description="Commencez par ajouter votre premier client."
            action={!showForm ? <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Ajouter un client</Button> : undefined}
          />
        ) : (
          <Table columns={columns} data={clients} emptyMessage="Aucun client trouvé" />
        )}
      </Card>
    </div>
  );
}