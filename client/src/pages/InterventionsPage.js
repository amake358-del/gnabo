import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { formatDate } from '../utils/format';
import { ClipboardList, Search, Plus, X, Save, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
const STATUTS = ['planifiee', 'en_cours', 'terminee', 'annulee'];
const STATUT_LABELS = {
    planifiee: 'Planifiée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
};
const STATUT_VARIANTS = {
    planifiee: 'blue',
    en_cours: 'yellow',
    terminee: 'green',
    annulee: 'red',
};
const STATUT_BTN = {
    planifiee: 'en_cours',
    en_cours: 'terminee',
};
export function InterventionsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtreStatut, setFiltreStatut] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [form, setForm] = useState({
        client_id: '',
        client_search: '',
        service: 'aluminium',
        technicien: '',
        equipe: '',
        date_prevue: '',
        heure_prevue: '',
        adresse_intervention: '',
    });
    const [clients, setClients] = useState([]);
    const [showClientList, setShowClientList] = useState(false);
    const load = async () => {
        setLoading(true);
        let q = supabase.from('interventions').select('*');
        if (filtreStatut)
            q = q.eq('statut', filtreStatut);
        if (search)
            q = q.or(`client_nom.ilike.%${search}%,technicien.ilike.%${search}%`);
        q.order('cree_le', { ascending: false });
        const { data } = await q;
        setItems((data || []));
        setLoading(false);
    };
    useEffect(() => { load(); }, [filtreStatut]);
    const handleSearch = () => { load(); };
    const openNew = () => {
        setEditing(null);
        setForm({ client_id: '', client_search: '', service: 'aluminium', technicien: '', equipe: '', date_prevue: '', heure_prevue: '', adresse_intervention: '' });
        setShowForm(true);
        setError('');
    };
    const openEdit = (item) => {
        setEditing(item);
        setForm({
            client_id: String(item.client_id),
            client_search: item.client_nom || '',
            service: item.service,
            technicien: item.technicien || '',
            equipe: item.equipe || '',
            date_prevue: item.date_prevue || '',
            heure_prevue: item.heure_prevue || '',
            adresse_intervention: item.adresse_intervention || '',
        });
        setShowForm(true);
        setError('');
    };
    const searchClients = async (q) => {
        setForm(prev => ({ ...prev, client_search: q, client_id: '' }));
        if (q.length < 1) {
            setClients([]);
            setShowClientList(false);
            return;
        }
        const { data } = await supabase.from('clients').select('id, nom, prenom, telephone').ilike('nom', `%${q}%`).limit(10);
        setClients(data || []);
        setShowClientList(true);
    };
    const selectClient = (c) => {
        setForm(prev => ({ ...prev, client_id: String(c.id), client_search: `${c.nom || ''} ${c.prenom || ''}`.trim() }));
        setShowClientList(false);
    };
    const handleSubmit = async () => {
        if (!form.client_id) {
            setError('Sélectionnez un client');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                client_id: parseInt(form.client_id),
                service: form.service,
                technicien: form.technicien,
                equipe: form.equipe,
                date_prevue: form.date_prevue,
                heure_prevue: form.heure_prevue,
                adresse_intervention: form.adresse_intervention,
            };
            if (editing) {
                const { error: e } = await supabase.from('interventions').update(payload).eq('id', editing.id);
                if (e)
                    throw e;
            }
            else {
                const { error: e } = await supabase.from('interventions').insert(payload);
                if (e)
                    throw e;
            }
            setShowForm(false);
            setEditing(null);
            load();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setSaving(false);
        }
    };
    const handleStatut = async (id, statut) => {
        const { error: e } = await supabase.from('interventions').update({ statut }).eq('id', id);
        if (e)
            setError(e.message);
        else
            load();
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center", children: _jsx(ClipboardList, { size: 22, className: "text-blue-500" }) }), _jsx("h1", { className: "text-xl font-bold", children: "Interventions" })] }), _jsxs(Button, { onClick: openNew, children: [_jsx(Plus, { size: 16 }), " Nouvelle intervention"] })] }), _jsxs("div", { className: "flex gap-3 flex-wrap", children: [_jsxs("div", { className: "relative flex-1 max-w-xs", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { className: "input pl-9", placeholder: "Client, technicien...", value: search, onChange: e => setSearch(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSearch() })] }), _jsxs("select", { className: "input w-auto", value: filtreStatut, onChange: e => setFiltreStatut(e.target.value), children: [_jsx("option", { value: "", children: "Tous les statuts" }), STATUTS.map(s => _jsx("option", { value: s, children: STATUT_LABELS[s] }, s))] }), _jsx(Button, { variant: "ghost", onClick: handleSearch, children: "Rechercher" })] }), showForm && (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "font-semibold", children: [editing ? 'Modifier' : 'Nouvelle', " intervention"] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), children: _jsx(X, { size: 18, className: "text-gray-400" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("label", { className: "label", children: "Client *" }), _jsx("input", { className: "input", placeholder: "Rechercher un client...", value: form.client_search, onChange: e => searchClients(e.target.value) }), showClientList && clients.length > 0 && (_jsx("div", { className: "absolute z-10 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto", children: clients.map((c) => (_jsxs("button", { type: "button", className: "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50", onClick: () => selectClient(c), children: [c.nom, " ", c.prenom || '', " ", c.telephone && _jsx("span", { className: "text-gray-400 ml-2", children: c.telephone })] }, c.id))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Service" }), _jsxs("select", { className: "input", value: form.service, onChange: e => setForm(prev => ({ ...prev, service: e.target.value })), children: [_jsx("option", { value: "aluminium", children: "Aluminium" }), _jsx("option", { value: "metallique", children: "M\u00E9tallique" }), _jsx("option", { value: "electronique", children: "\u00C9lectronique" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Technicien" }), _jsx("input", { className: "input", value: form.technicien, onChange: e => setForm(prev => ({ ...prev, technicien: e.target.value })), placeholder: "Nom du technicien" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "\u00C9quipe" }), _jsx("input", { className: "input", value: form.equipe, onChange: e => setForm(prev => ({ ...prev, equipe: e.target.value })), placeholder: "Membres de l'\u00E9quipe" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Date pr\u00E9vue" }), _jsx("input", { className: "input", type: "date", value: form.date_prevue, onChange: e => setForm(prev => ({ ...prev, date_prevue: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Heure pr\u00E9vue" }), _jsx("input", { className: "input", type: "time", value: form.heure_prevue, onChange: e => setForm(prev => ({ ...prev, heure_prevue: e.target.value })) })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "label", children: "Adresse d'intervention" }), _jsx("input", { className: "input", value: form.adresse_intervention, onChange: e => setForm(prev => ({ ...prev, adresse_intervention: e.target.value })), placeholder: "Adresse compl\u00E8te" })] })] }), error && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1 mt-3", children: [_jsx(AlertTriangle, { size: 14 }), " ", error] }), _jsxs("div", { className: "flex gap-3 mt-4", children: [_jsxs(Button, { onClick: handleSubmit, disabled: saving, children: [_jsx(Save, { size: 16 }), " ", editing ? 'Mettre à jour' : 'Créer'] }), _jsx(Button, { variant: "ghost", onClick: () => setShowForm(false), children: "Annuler" })] })] })), loading ? (_jsx("div", { className: "flex justify-center py-16", children: _jsx(LoadingSpinner, { size: 40 }) })) : items.length === 0 ? (_jsx(Card, { children: _jsx("p", { className: "text-center text-gray-400 py-10", children: "Aucune intervention trouv\u00E9e" }) })) : (_jsx("div", { className: "space-y-3", children: items.map(item => (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx("span", { className: "font-semibold", children: item.client_nom || `Client #${item.client_id}` }), _jsx(Badge, { variant: STATUT_VARIANTS[item.statut] || 'default', dot: true, children: STATUT_LABELS[item.statut] || item.statut }), _jsx("span", { className: "text-xs text-gray-400 capitalize", children: item.service })] }), item.technicien && _jsxs("p", { className: "text-sm text-gray-500", children: ["Technicien: ", item.technicien] }), item.equipe && _jsxs("p", { className: "text-sm text-gray-500", children: ["\u00C9quipe: ", item.equipe] }), _jsxs("div", { className: "flex gap-4 text-xs text-gray-400 mt-2", children: [item.date_prevue && _jsxs("span", { children: ["\uD83D\uDCC5 ", item.date_prevue] }), item.heure_prevue && _jsxs("span", { children: ["\u23F0 ", item.heure_prevue] }), item.cree_le && _jsxs("span", { children: ["Cr\u00E9\u00E9 le ", formatDate(item.cree_le)] })] })] }), _jsxs("div", { className: "flex gap-2 shrink-0 ml-4", children: [STATUT_BTN[item.statut] && (_jsxs(Button, { size: "sm", onClick: () => handleStatut(item.id, STATUT_BTN[item.statut]), children: [_jsx(CheckCircle, { size: 14 }), " ", STATUT_LABELS[STATUT_BTN[item.statut]]] })), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setExpanded(expanded === item.id ? null : item.id), children: _jsx(Eye, { size: 14 }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(item), children: "\u270F\uFE0F" })] })] }), expanded === item.id && (_jsxs("div", { className: "mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 text-sm space-y-2", children: [item.adresse_intervention && _jsxs("p", { children: [_jsx("span", { className: "text-gray-400", children: "Adresse:" }), " ", item.adresse_intervention] }), item.client_telephone && _jsxs("p", { children: [_jsx("span", { className: "text-gray-400", children: "T\u00E9l:" }), " ", item.client_telephone] }), item.devis_numero && _jsxs("p", { children: [_jsx("span", { className: "text-gray-400", children: "Devis:" }), " ", item.devis_numero] }), item.compte_rendu && _jsxs("p", { children: [_jsx("span", { className: "text-gray-400", children: "Compte rendu:" }), " ", item.compte_rendu] })] }))] }, item.id))) }))] }));
}
