import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { formatCurrency, formatDateTime } from '../utils/format';
import { DollarSign, TrendingUp, TrendingDown, Plus, X, Save, AlertTriangle, Trash2, Wallet } from 'lucide-react';
const CATEGORIES = [
    'vente', 'acompte', 'salaire', 'loyer', 'fournisseur', 'transport', 'achat_stock', 'entretien', 'autre',
];
const CATEGORY_LABELS = {
    vente: 'Vente', acompte: 'Acompte', salaire: 'Salaire', loyer: 'Loyer',
    fournisseur: 'Fournisseur', transport: 'Transport', achat_stock: 'Achat stock', entretien: 'Entretien', autre: 'Autre',
};
export function CaissePage() {
    const [entries, setEntries] = useState([]);
    const [solde, setSolde] = useState(0);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('');
    const [debut, setDebut] = useState('');
    const [fin, setFin] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'encaissement', categorie: 'vente', montant: '', description: '', mode_paiement: 'especes' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const load = async () => {
        setLoading(true);
        try {
            let query = supabase.from('caisse').select('*').order('cree_le', { ascending: false });
            if (debut)
                query = query.gte('cree_le', debut);
            if (fin)
                query = query.lte('cree_le', `${fin}T23:59:59`);
            if (type)
                query = query.eq('type', type);
            const { data } = await query;
            const rows = (data ?? []);
            setEntries(rows);
            setSolde(rows.reduce((s, e) => s + (e.type === 'encaissement' ? e.montant : -e.montant), 0));
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const handleFilter = () => { load(); };
    const todayTotalEncaissements = entries.filter(e => e.type === 'encaissement').reduce((s, e) => s + e.montant, 0);
    const todayTotalDepenses = entries.filter(e => e.type === 'depense').reduce((s, e) => s + e.montant, 0);
    const handleSubmit = async () => {
        if (!form.montant || parseFloat(form.montant) <= 0) {
            setError('Montant invalide');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const { error: err } = await supabase.from('caisse').insert({
                type: form.type,
                categorie: form.categorie,
                montant: parseFloat(form.montant),
                description: form.description || null,
                mode_paiement: form.mode_paiement,
            });
            if (err)
                throw err;
            setShowForm(false);
            setForm({ type: 'encaissement', categorie: 'vente', montant: '', description: '', mode_paiement: 'especes' });
            load();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette entrée ?'))
            return;
        try {
            const { error: err } = await supabase.from('caisse').delete().eq('id', id);
            if (err)
                throw err;
            load();
        }
        catch (err) {
            alert(err.message);
        }
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center", children: _jsx(Wallet, { size: 22, className: "text-emerald-500" }) }), _jsx("h1", { className: "text-xl font-bold", children: "Caisse" })] }), _jsxs(Button, { onClick: () => setShowForm(true), children: [_jsx(Plus, { size: 16 }), " Nouvelle entr\u00E9e"] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center", children: _jsx(TrendingUp, { size: 20, className: "text-green-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "Encaissements" }), _jsx("p", { className: "text-lg font-bold text-green-600", children: formatCurrency(todayTotalEncaissements) })] })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center", children: _jsx(TrendingDown, { size: 20, className: "text-red-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "D\u00E9penses" }), _jsx("p", { className: "text-lg font-bold text-red-600", children: formatCurrency(todayTotalDepenses) })] })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center", children: _jsx(DollarSign, { size: 20, className: "text-blue-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "Solde" }), _jsx("p", { className: `text-lg font-bold ${solde >= 0 ? 'text-blue-600' : 'text-red-600'}`, children: formatCurrency(solde) })] })] }) })] }), _jsxs("div", { className: "flex gap-3 flex-wrap items-end", children: [_jsxs("div", { children: [_jsx("label", { className: "label text-xs", children: "Du" }), _jsx("input", { className: "input", type: "date", value: debut, onChange: e => setDebut(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label text-xs", children: "Au" }), _jsx("input", { className: "input", type: "date", value: fin, onChange: e => setFin(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label text-xs", children: "Type" }), _jsxs("select", { className: "input", value: type, onChange: e => setType(e.target.value), children: [_jsx("option", { value: "", children: "Tous" }), _jsx("option", { value: "encaissement", children: "Encaissement" }), _jsx("option", { value: "depense", children: "D\u00E9pense" })] })] }), _jsx(Button, { variant: "ghost", onClick: handleFilter, children: "Filtrer" })] }), showForm && (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-semibold", children: "Nouvelle entr\u00E9e" }), _jsx("button", { type: "button", onClick: () => setShowForm(false), children: _jsx(X, { size: 18, className: "text-gray-400" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Type" }), _jsxs("select", { className: "input", value: form.type, onChange: e => setForm(prev => ({ ...prev, type: e.target.value })), children: [_jsx("option", { value: "encaissement", children: "Encaissement" }), _jsx("option", { value: "depense", children: "D\u00E9pense" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Cat\u00E9gorie" }), _jsx("select", { className: "input", value: form.categorie, onChange: e => setForm(prev => ({ ...prev, categorie: e.target.value })), children: CATEGORIES.map(c => _jsx("option", { value: c, children: CATEGORY_LABELS[c] }, c)) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Montant" }), _jsx("input", { className: "input", type: "number", value: form.montant, onChange: e => setForm(prev => ({ ...prev, montant: e.target.value })), min: "0", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Mode de paiement" }), _jsxs("select", { className: "input", value: form.mode_paiement, onChange: e => setForm(prev => ({ ...prev, mode_paiement: e.target.value })), children: [_jsx("option", { value: "especes", children: "Esp\u00E8ces" }), _jsx("option", { value: "carte", children: "Carte bancaire" }), _jsx("option", { value: "cheque", children: "Ch\u00E8que" }), _jsx("option", { value: "virement", children: "Virement" }), _jsx("option", { value: "mobile_money", children: "Mobile Money" })] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "label", children: "Description" }), _jsx("input", { className: "input", value: form.description, onChange: e => setForm(prev => ({ ...prev, description: e.target.value })), placeholder: "Motif..." })] })] }), error && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1 mt-3", children: [_jsx(AlertTriangle, { size: 14 }), " ", error] }), _jsxs("div", { className: "flex gap-3 mt-4", children: [_jsxs(Button, { onClick: handleSubmit, disabled: saving, children: [_jsx(Save, { size: 16 }), " Enregistrer"] }), _jsx(Button, { variant: "ghost", onClick: () => setShowForm(false), children: "Annuler" })] })] })), loading ? (_jsx("div", { className: "flex justify-center py-16", children: _jsx(LoadingSpinner, { size: 40 }) })) : entries.length === 0 ? (_jsx(Card, { children: _jsx("p", { className: "text-center text-gray-400 py-10", children: "Aucune entr\u00E9e" }) })) : (_jsx("div", { className: "space-y-2", children: entries.map(e => (_jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx(Badge, { variant: e.type === 'encaissement' ? 'green' : 'red', children: e.type === 'encaissement' ? '+' : '-' }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium", children: CATEGORY_LABELS[e.categorie] || e.categorie }), e.description && _jsx("p", { className: "text-xs text-gray-400 truncate", children: e.description })] }), _jsx("span", { className: "text-xs text-gray-400", children: e.mode_paiement })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0 ml-4", children: [_jsxs("span", { className: `text-sm font-bold ${e.type === 'encaissement' ? 'text-green-600' : 'text-red-600'}`, children: [e.type === 'encaissement' ? '+' : '-', formatCurrency(e.montant)] }), _jsx("span", { className: "text-xs text-gray-400", children: formatDateTime(e.cree_le) }), _jsx("button", { type: "button", onClick: () => handleDelete(e.id), className: "text-gray-300 hover:text-red-500 transition-colors", children: _jsx(Trash2, { size: 14 }) })] })] }) }, e.id))) }))] }));
}
