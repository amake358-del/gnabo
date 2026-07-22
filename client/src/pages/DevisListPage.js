import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { StatutBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { supabase } from '../services/supabase';
import { formatCurrency, formatDate } from '../utils/format';
import { toast } from '../utils/notify';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
const LIMIT = 20;
export function DevisListPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [devis, setDevis] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [statut, setStatut] = useState(searchParams.get('statut') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('devis')
                .select('*, clients!inner(nom, prenom)', { count: 'exact' });
            if (statut)
                query = query.eq('statut', statut);
            if (search) {
                query = query.or(`numero.ilike.%${search}%,clients.nom.ilike.%${search}%`);
            }
            query = query
                .order('cree_le', { ascending: false })
                .range((page - 1) * LIMIT, page * LIMIT - 1);
            const { data, count, error } = await query;
            if (error)
                throw error;
            const mapped = (data ?? []).map((d) => ({
                id: String(d.id),
                numero: d.numero,
                client_id: String(d.client_id),
                type_id: '',
                modele_id: '',
                statut: d.statut,
                total_ht: d.montant_ht,
                remise: 0,
                transport: 0,
                pose: 0,
                tva: d.tva,
                total_ttc: d.montant_ttc,
                acompte: d.acompte ?? 0,
                reste: d.montant_ttc - (d.acompte ?? 0),
                notes: d.notes ?? '',
                created_at: d.cree_le,
                updated_at: d.modifie_le ?? d.cree_le,
                client_company: d.clients?.nom ?? '',
                client_nom: d.clients?.prenom ? `${d.clients.prenom} ${d.clients.nom}` : d.clients?.nom ?? '',
            }));
            setDevis(mapped);
            setTotal(count ?? 0);
            setTotalPages(Math.ceil((count ?? 0) / LIMIT));
        }
        catch (err) {
            toast(err.message || 'Erreur chargement', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [search, statut, page]);
    const handleDelete = async () => {
        if (!deleteId)
            return;
        setSaving(true);
        try {
            const { error } = await supabase.from('devis').delete().eq('id', deleteId);
            if (error)
                throw error;
            setDeleteId(null);
            load();
        }
        catch (err) {
            toast(err.message, 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const columns = [
        { key: 'numero', label: 'Numéro' },
        { key: 'client_company', label: 'Client', render: (d) => d.client_company || d.client_nom || '-' },
        { key: 'type_name', label: 'Type', render: (d) => d.type_name || '-' },
        { key: 'total_ttc', label: 'Total TTC', render: (d) => formatCurrency(d.total_ttc) },
        { key: 'statut', label: 'Statut', render: (d) => _jsx(StatutBadge, { statut: d.statut }) },
        { key: 'created_at', label: 'Date', render: (d) => formatDate(d.created_at) },
        { key: 'actions', label: '', hideLabel: true, render: (d) => (_jsxs("div", { className: "flex gap-1 justify-end", onClick: e => e.stopPropagation(), children: [_jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Aper\u00E7u", onClick: () => navigate(`/devis/${d.id}?apercu=1`), children: _jsx(Eye, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Modifier", onClick: () => navigate(`/devis/${d.id}`), children: _jsx(Pencil, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Supprimer", onClick: () => setDeleteId(d.id), children: _jsx(Trash2, { size: 14, className: "text-red-500" }) })] })), className: 'w-28' }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Devis" }), _jsxs(Button, { onClick: () => navigate('/devis/nouveau'), children: [_jsx(Plus, { size: 16 }), _jsx("span", { className: "hidden lg:inline", children: "Nouveau devis" })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4", children: [_jsxs("div", { className: "relative w-full lg:flex-1 lg:max-w-sm", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { "aria-label": "Rechercher devis ou client", className: "input pl-10", placeholder: "Rechercher devis ou client...", value: search, onChange: e => { setSearch(e.target.value); setPage(1); } })] }), _jsxs("div", { className: "flex items-center gap-3 w-full lg:w-auto", children: [_jsx(Select, { "aria-label": "Filtrer par statut", options: [
                                            { value: '', label: 'Tous les statuts' },
                                            { value: 'brouillon', label: 'Brouillon' },
                                            { value: 'envoye', label: 'Envoyé' },
                                            { value: 'accepte', label: 'Accepté' },
                                            { value: 'refuse', label: 'Refusé' },
                                            { value: 'expire', label: 'Expiré' },
                                        ], value: statut, onChange: e => { setStatut(e.target.value); setPage(1); }, className: "flex-1 lg:max-w-[180px]" }), _jsxs("span", { className: "text-sm text-gray-500 whitespace-nowrap", children: [total, " devis"] })] })] }), _jsx(Table, { columns: columns, data: devis, loading: loading, onRowClick: (d) => navigate(`/devis/${d.id}`), emptyMessage: "Aucun devis trouv\u00E9" }), _jsx(Pagination, { page: page, totalPages: totalPages, onPageChange: setPage })] }), _jsx(ConfirmDialog, { open: !!deleteId, onClose: () => setDeleteId(null), onConfirm: handleDelete, title: "Supprimer le devis ?", message: "Cette action est irr\u00E9versible.", loading: saving })] }));
}
