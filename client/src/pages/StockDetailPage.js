import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { formatCurrency, formatDate } from '../utils/format';
import { ArrowLeft, Package } from 'lucide-react';
export function StockDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [mouvements, setMouvements] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!id)
            return;
        (async () => {
            const [artRes, mouvRes] = await Promise.all([
                supabase.from('articles_stock').select('*, categories_stock(nom, service)').eq('id', id).single(),
                supabase.from('mouvements_stock').select('*').eq('article_id', id).order('cree_le', { ascending: false }),
            ]);
            if (artRes.data) {
                const cat = Array.isArray(artRes.data.categories_stock) ? artRes.data.categories_stock[0] : artRes.data.categories_stock;
                setArticle({ ...artRes.data, categorie_nom: cat?.nom });
            }
            setMouvements(mouvRes.data || []);
            setLoading(false);
        })().catch(() => { navigate('/stocks'); setLoading(false); });
    }, [id]);
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(LoadingSpinner, { size: 40 }) });
    if (!article)
        return null;
    const isLow = article.quantite <= article.seuil_alerte;
    return (_jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate('/stocks'), children: [_jsx(ArrowLeft, { size: 16 }), " Retour au stock"] }), _jsx(Card, { children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0", children: _jsx(Package, { size: 28, className: "text-primary-500" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h1", { className: "text-xl font-bold", children: article.nom }), article.reference && _jsxs("p", { className: "text-sm text-gray-400", children: ["R\u00E9f: ", article.reference] }), article.categorie_nom && _jsx("p", { className: "text-sm text-gray-500 mt-1", children: article.categorie_nom })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-3xl font-bold ${isLow ? 'text-red-500' : 'text-green-600'}`, children: article.quantite }), _jsx("p", { className: "text-xs text-gray-400", children: "en stock" }), isLow && _jsx(Badge, { variant: "red", children: "Stock bas" })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-gray-400", children: "Seuil alerte" }), _jsx("p", { className: "text-lg font-bold", children: article.seuil_alerte })] }) }), _jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-gray-400", children: "Prix unitaire" }), _jsx("p", { className: "text-lg font-bold", children: formatCurrency(article.prix_unitaire || 0) })] }) })] }), _jsxs(Card, { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Historique des mouvements" }), mouvements.length === 0 ? (_jsx("p", { className: "text-gray-400 text-center py-4", children: "Aucun mouvement" })) : (_jsx("div", { className: "space-y-2", children: mouvements.map(m => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: m.type === 'entree' ? 'green' : 'red', children: [m.type === 'entree' ? '+' : '-', m.quantite] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: m.type === 'entree' ? 'Entrée' : 'Sortie' }), m.notes && _jsx("p", { className: "text-xs text-gray-400", children: m.notes }), m.reference && _jsxs("p", { className: "text-xs text-gray-400", children: ["R\u00E9f: ", m.reference] })] })] }), _jsx("span", { className: "text-xs text-gray-400", children: formatDate(m.cree_le) })] }, m.id))) }))] })] }));
}
