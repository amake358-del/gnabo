import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Search, Plus, Smartphone, ChevronRight } from 'lucide-react';
const STATUT_CONFIG = {
    recu: { label: 'Reçu', color: 'info' },
    diagnostic: { label: 'Diagnostic', color: 'warning' },
    attente_validation: { label: 'Attente validation', color: 'warning' },
    attente_pieces: { label: 'Attente pièces', color: 'warning' },
    en_reparation: { label: 'En réparation', color: 'warning' },
    test: { label: 'Test', color: 'info' },
    repare: { label: 'Réparé', color: 'success' },
    pret: { label: 'Prêt', color: 'success' },
    livre: { label: 'Livré', color: 'success' },
    non_reparable: { label: 'Non réparable', color: 'danger' },
    restitue: { label: 'Restitué', color: 'default' },
};
export function AppareilListPage() {
    const navigate = useNavigate();
    const [appareils, setAppareils] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statutFilter, _setStatutFilter] = useState('');
    const fetchList = async () => {
        setLoading(true);
        try {
            let q = supabase.from('appareils').select('*, clients(nom, telephone, adresse)');
            if (statutFilter)
                q = q.eq('statut', statutFilter);
            if (search)
                q = q.or(`uid_visible.ilike.%${search}%,marque.ilike.%${search}%,modele.ilike.%${search}%`);
            q.order('cree_le', { ascending: false });
            const { data } = await q;
            setAppareils((data || []).map((a) => {
                const c = Array.isArray(a.clients) ? a.clients[0] : a.clients;
                return {
                    ...a, id: String(a.id),
                    client_nom: c?.nom || 'Anonyme',
                    client_telephone: c?.telephone,
                    client_adresse: c?.adresse,
                    qr_code: a.uid_visible,
                    type_appareil: a.type,
                    date_reception: a.cree_le?.substring(0, 10),
                    panne_declaree: a.description_defaut,
                };
            }));
        }
        catch { /* ignore */ }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchList(); }, [statutFilter]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Appareils" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: "Recherchez et g\u00E9rez les appareils" })] }), _jsxs(Button, { onClick: () => navigate('/electronique/reception'), children: [_jsx(Plus, { size: 16 }), " Nouveau"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex-1", children: _jsx("input", { className: "input", placeholder: "QR Code, client, t\u00E9l\u00E9phone, marque, appareil...", value: search, onChange: e => setSearch(e.target.value), onKeyDown: e => e.key === 'Enter' && fetchList() }) }), _jsx(Button, { variant: "secondary", onClick: fetchList, children: _jsx(Search, { size: 16 }) })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden", children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) })) : appareils.length === 0 ? (_jsxs("div", { className: "text-center py-12 text-gray-400", children: [_jsx(Smartphone, { size: 48, className: "mx-auto mb-3 opacity-50" }), _jsx("p", { children: "Aucun appareil trouv\u00E9" })] })) : (_jsx("div", { className: "divide-y divide-gray-100 dark:divide-gray-700/50", children: appareils.map(app => {
                        const cfg = STATUT_CONFIG[app.statut] || { label: app.statut, color: 'default' };
                        return (_jsxs("button", { onClick: () => navigate(`/electronique/appareils/${app.id}`), className: "w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left", type: "button", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0", children: _jsx(Smartphone, { size: 20, className: "text-gray-500" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium truncate", children: app.client_nom || 'Anonyme' }), app.qr_code && _jsx("span", { className: "text-xs font-mono text-gray-400 shrink-0", children: app.qr_code })] }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-400 mt-0.5", children: [app.client_telephone && _jsx("span", { children: app.client_telephone }), app.marque && app.modele && _jsxs("span", { children: [app.marque, " ", app.modele] }), !app.marque && app.type_appareil && _jsx("span", { children: app.type_appareil }), _jsx("span", { children: app.date_reception })] })] }), _jsx(Badge, { variant: cfg.color, children: cfg.label }), _jsx(ChevronRight, { size: 16, className: "text-gray-300 shrink-0" })] }, app.id));
                    }) })) })] }));
}
