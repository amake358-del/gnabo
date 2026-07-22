import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', email: '', ville: '' });
    const [saving, setSaving] = useState(false);
    async function loadClients() {
        setLoading(true);
        let query = supabase.from('clients').select('*').order('nom', { ascending: true });
        if (search)
            query = query.ilike('nom', `%${search}%`);
        const { data } = await query;
        setClients(data ?? []);
        setLoading(false);
    }
    useEffect(() => { loadClients(); }, [search]);
    async function handleSubmit(e) {
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
            if (error)
                throw error;
            setForm({ nom: '', prenom: '', telephone: '', email: '', ville: '' });
            setShowForm(false);
            loadClients();
            toast('Client créé avec succès', 'success');
        }
        catch (err) {
            toast(err.message || 'Erreur', 'error');
        }
        finally {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Clients" }), _jsxs(Button, { onClick: () => setShowForm(!showForm), children: [_jsx(Plus, { size: 16 }), _jsx("span", { className: "hidden lg:inline", children: showForm ? 'Annuler' : 'Nouveau client' })] })] }), showForm && (_jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Nom *", required: true, value: form.nom, onChange: (e) => setForm({ ...form, nom: e.target.value }) }), _jsx(Input, { label: "Pr\u00E9nom", value: form.prenom, onChange: (e) => setForm({ ...form, prenom: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Input, { label: "T\u00E9l\u00E9phone", value: form.telephone, onChange: (e) => setForm({ ...form, telephone: e.target.value }) }), _jsx(Input, { label: "Email", type: "email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) })] }), _jsx(Input, { label: "Ville", value: form.ville, onChange: (e) => setForm({ ...form, ville: e.target.value }) }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", type: "button", onClick: () => setShowForm(false), children: "Annuler" }), _jsx(Button, { type: "submit", loading: saving, children: "Enregistrer" })] })] }) })), _jsxs(Card, { children: [_jsxs("div", { className: "relative w-full lg:max-w-sm mb-4", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { className: "input pl-10", placeholder: "Rechercher un client...", value: search, onChange: (e) => setSearch(e.target.value) })] }), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, { size: 32 }) })) : clients.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Users, { size: 48 }), title: "Aucun client", description: "Commencez par ajouter votre premier client.", action: !showForm ? _jsxs(Button, { size: "sm", onClick: () => setShowForm(true), children: [_jsx(Plus, { size: 14 }), " Ajouter un client"] }) : undefined })) : (_jsx(Table, { columns: columns, data: clients, emptyMessage: "Aucun client trouv\u00E9" }))] })] }));
}
