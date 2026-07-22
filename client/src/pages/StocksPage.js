import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { formatCurrency } from '../utils/format';
import { Search, AlertTriangle, ArrowUpDown, History } from 'lucide-react';
const SERVICES = [
    { value: '', label: 'Tous les services' },
    { value: 'aluminium', label: 'Aluminium & Inox' },
    { value: 'metallique', label: 'Métallique' },
    { value: 'electronique', label: 'Électronique' },
];
export function StocksPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [alertOnly, setAlertOnly] = useState(false);
    const [moveModal, setMoveModal] = useState({ open: false, article: null });
    const [moveType, setMoveType] = useState('entree');
    const [moveQty, setMoveQty] = useState(1);
    const [moveRef, setMoveRef] = useState('');
    const [moveNotes, setMoveNotes] = useState('');
    const [moveSaving, setMoveSaving] = useState(false);
    const load = useCallback(() => {
        setLoading(true);
        (async () => {
            const [catRes, artRes] = await Promise.all([
                supabase.from('categories_stock').select('*').order('nom'),
                (() => {
                    let q = supabase.from('articles_stock').select('*, categories_stock(nom, service)');
                    if (search)
                        q = q.or(`nom.ilike.%${search}%,reference.ilike.%${search}%`);
                    if (catFilter)
                        q = q.eq('categorie_id', catFilter);
                    return q.order('nom');
                })(),
            ]);
            setCategories(catRes.data || []);
            let arts = (artRes.data || []).map((a) => {
                const cat = Array.isArray(a.categories_stock) ? a.categories_stock[0] : a.categories_stock;
                return { ...a, categorie_nom: cat?.nom, service: cat?.service };
            });
            if (alertOnly)
                arts = arts.filter((a) => a.quantite <= a.seuil_alerte);
            setArticles(arts);
        })().finally(() => setLoading(false));
    }, [search, catFilter, alertOnly]);
    useEffect(() => { load(); }, [load]);
    const filteredByService = serviceFilter
        ? articles.filter(a => {
            const cat = categories.find(c => Number(c.id) === Number(a.categorie_id));
            return cat?.service === serviceFilter;
        })
        : articles;
    const handleMove = async () => {
        if (!moveModal.article || moveQty <= 0)
            return;
        setMoveSaving(true);
        try {
            await supabase.from('mouvements_stock').insert({
                article_id: moveModal.article.id,
                type: moveType,
                quantite: moveQty,
                reference: moveRef || null,
                notes: moveNotes || null,
            });
            const { data: art } = await supabase.from('articles_stock').select('quantite').eq('id', moveModal.article.id).single();
            const newQty = moveType === 'entree' ? (art?.quantite || 0) + moveQty : (art?.quantite || 0) - moveQty;
            await supabase.from('articles_stock').update({ quantite: newQty }).eq('id', moveModal.article.id);
            console.log('Mouvement enregistré');
            setMoveModal({ open: false, article: null });
            setMoveQty(1);
            setMoveRef('');
            setMoveNotes('');
            load();
        }
        catch (err) {
            console.error(err.message || err);
        }
        finally {
            setMoveSaving(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Gestion de stock" }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "secondary", onClick: () => setAlertOnly(!alertOnly), className: alertOnly ? 'ring-2 ring-amber-400' : '', children: [_jsx(AlertTriangle, { size: 16 }), " Alertes"] }) })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex flex-col lg:flex-row gap-3 mb-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { "aria-label": "Rechercher article", className: "input pl-10", placeholder: "Rechercher article ou r\u00E9f\u00E9rence...", value: search, onChange: e => setSearch(e.target.value) })] }), _jsx(Select, { "aria-label": "Filtrer par service", options: SERVICES, value: serviceFilter, onChange: e => setServiceFilter(e.target.value), className: "w-full lg:w-48" }), _jsx(Select, { "aria-label": "Filtrer par cat\u00E9gorie", options: [
                                    { value: '', label: 'Toutes catégories' },
                                    ...categories
                                        .filter(c => !serviceFilter || c.service === serviceFilter)
                                        .map(c => ({ value: String(c.id), label: c.nom })),
                                ], value: catFilter, onChange: e => setCatFilter(e.target.value), className: "w-full lg:w-48" })] }), loading ? _jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) }) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Article" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Cat\u00E9gorie" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Service" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Qt\u00E9" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Seuil" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Prix unit." }), _jsx("th", { className: "px-3 py-2 text-right", children: "Actions" })] }) }), _jsxs("tbody", { children: [filteredByService.map(a => {
                                            const cat = categories.find(c => Number(c.id) === Number(a.categorie_id));
                                            const isLow = a.quantite <= a.seuil_alerte;
                                            return (_jsxs("tr", { className: `border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isLow ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`, children: [_jsxs("td", { className: "px-3 py-2.5", children: [_jsx("div", { className: "font-medium", children: a.nom }), a.reference && _jsx("div", { className: "text-xs text-gray-400", children: a.reference })] }), _jsx("td", { className: "px-3 py-2.5 text-gray-500", children: cat?.nom || '-' }), _jsx("td", { className: "px-3 py-2.5", children: _jsx(ServiceBadge, { service: cat?.service || '' }) }), _jsx("td", { className: "px-3 py-2.5 text-right", children: _jsx("span", { className: `font-bold ${isLow ? 'text-red-500' : 'text-green-600'}`, children: a.quantite }) }), _jsx("td", { className: "px-3 py-2.5 text-right text-gray-400", children: a.seuil_alerte }), _jsx("td", { className: "px-3 py-2.5 text-right", children: formatCurrency(a.prix_unitaire || 0) }), _jsx("td", { className: "px-3 py-2.5 text-right", children: _jsxs("div", { className: "flex gap-1 justify-end", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setMoveModal({ open: true, article: a }), children: _jsx(ArrowUpDown, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/stocks/${a.id}`), children: _jsx(History, { size: 14 }) })] }) })] }, a.id));
                                        }), filteredByService.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-8 text-gray-400", children: "Aucun article trouv\u00E9" }) }))] })] }) }))] }), _jsx(Modal, { open: moveModal.open, onClose: () => setMoveModal({ open: false, article: null }), title: `Mouvement: ${moveModal.article?.nom || ''}`, size: "sm", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: moveType === 'entree' ? 'primary' : 'secondary', size: "sm", onClick: () => setMoveType('entree'), children: "Entr\u00E9e" }), _jsx(Button, { variant: moveType === 'sortie' ? 'primary' : 'secondary', size: "sm", onClick: () => setMoveType('sortie'), children: "Sortie" })] }), _jsx(Input, { label: "Quantit\u00E9", type: "number", min: "1", value: String(moveQty), onChange: e => setMoveQty(parseInt(e.target.value) || 1) }), _jsx(Input, { label: "R\u00E9f\u00E9rence (bon)", value: moveRef, onChange: e => setMoveRef(e.target.value), placeholder: "N\u00B0 bon de livraison" }), _jsx(Input, { label: "Notes", value: moveNotes, onChange: e => setMoveNotes(e.target.value) }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setMoveModal({ open: false, article: null }), children: "Annuler" }), _jsx(Button, { onClick: handleMove, loading: moveSaving, children: "Valider" })] })] }) })] }));
}
function ServiceBadge({ service }) {
    const cfg = {
        aluminium: { label: 'Aluminium', color: 'blue' },
        metallique: { label: 'Métallique', color: 'default' },
        electronique: { label: 'Électronique', color: 'yellow' },
        tous: { label: 'Tous', color: 'default' },
    };
    const c = cfg[service] || { label: service, color: 'default' };
    return _jsx(Badge, { variant: c.color, children: c.label });
}
