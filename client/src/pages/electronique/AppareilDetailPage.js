import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Smartphone, Phone, MapPin, Package, FileText, ArrowLeft, ClipboardList, Wrench, CreditCard, Download, DollarSign, Truck } from 'lucide-react';
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
export function AppareilDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [devisList, setDevisList] = useState([]);
    const [facturesList, setFacturesList] = useState([]);
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!id)
            return;
        (async () => {
            const [appRes, devisRes, facturesRes, cfgRes] = await Promise.all([
                supabase.from('appareils').select('*, clients(nom, telephone, adresse)').eq('id', id).single(),
                supabase.from('devis').select('*').eq('appareil_id', id).eq('service', 'electronique').order('cree_le', { ascending: false }),
                supabase.from('factures').select('*, devis(numero)').eq('service', 'electronique').order('cree_le', { ascending: false }),
                supabase.from('parametres').select('cle, valeur').then(({ data }) => {
                    const cfg = {};
                    if (data)
                        for (const r of data)
                            cfg[r.cle] = r.valeur;
                    return cfg;
                }),
            ]);
            const a = appRes.data;
            if (a) {
                const c = Array.isArray(a.clients) ? a.clients[0] : a.clients;
                setApp({ ...a, id: String(a.id), client_nom: c?.nom || 'Anonyme', client_telephone: c?.telephone, client_adresse: c?.adresse, qr_code: a.uid_visible, type_appareil: a.type, date_reception: a.cree_le?.substring(0, 10), panne_declaree: a.description_defaut });
            }
            setDevisList(devisRes.data || []);
            setFacturesList(facturesRes.data || []);
            setConfig(cfgRes);
            setLoading(false);
        })();
    }, [id]);
    if (loading)
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) });
    if (!app)
        return _jsx("div", { className: "text-center py-12 text-gray-400", children: "Appareil non trouv\u00E9" });
    const cfg = STATUT_CONFIG[app.statut] || { label: app.statut, color: 'default' };
    return (_jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsxs(Button, { onClick: () => navigate('/electronique/appareils'), className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors", children: [_jsx(ArrowLeft, { size: 16 }), " Retour \u00E0 la liste"] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-5", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center", children: _jsx(Smartphone, { size: 24, className: "text-primary-500" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: app.client_nom || 'Anonyme' }), _jsx(Badge, { variant: cfg.color, children: cfg.label })] })] }), app.qr_code && (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-gray-400", children: "QR Code" }), _jsx("p", { className: "font-mono font-bold", children: app.qr_code })] }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [app.client_telephone && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Phone, { size: 14, className: "text-gray-400" }), _jsx("span", { children: app.client_telephone })] })), app.client_adresse && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(MapPin, { size: 14, className: "text-gray-400" }), _jsx("span", { className: "truncate", children: app.client_adresse })] })), app.type_appareil && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Smartphone, { size: 14, className: "text-gray-400" }), _jsx("span", { children: app.type_appareil })] })), app.marque && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Package, { size: 14, className: "text-gray-400" }), _jsxs("span", { children: [app.marque, " ", app.modele] })] })), app.numero_serie && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "N\u00B0 S\u00E9rie" }), _jsx("p", { className: "text-sm font-mono", children: app.numero_serie })] })), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "Date r\u00E9ception" }), _jsx("p", { className: "text-sm", children: app.date_reception })] })] }), app.accessoires && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 font-medium mb-1", children: "Accessoires d\u00E9pos\u00E9s" }), _jsx("p", { className: "text-sm", children: app.accessoires })] })), app.panne_declaree && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 font-medium mb-1", children: "Panne d\u00E9clar\u00E9e" }), _jsx("p", { className: "text-sm", children: app.panne_declaree })] })), app.observations && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 font-medium mb-1", children: "Observations" }), _jsx("p", { className: "text-sm", children: app.observations })] })), app.photos && JSON.parse(app.photos).length > 0 && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs text-gray-400 font-medium mb-2", children: ["Photos (", JSON.parse(app.photos).length, ")"] }), _jsx("div", { className: "flex gap-2 overflow-x-auto", children: JSON.parse(app.photos).map((url, i) => (_jsx("img", { src: url, alt: "", className: "w-20 h-20 object-cover rounded-lg" }, i))) })] })), _jsxs("div", { className: "flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50", children: [_jsxs(Button, { onClick: () => navigate(`/electronique/diagnostic/${app.id}`), children: [_jsx(ClipboardList, { size: 16 }), " Diagnostic"] }), _jsxs(Button, { onClick: () => navigate(`/electronique/reparation/${app.id}`), children: [_jsx(Wrench, { size: 16 }), " R\u00E9paration"] }), (app.statut === 'pret' || app.statut === 'livre') && (_jsxs(Button, { onClick: async () => {
                                    const mod = await import('../../pdf/generateBonLivraison');
                                    const blob = await mod.generateBonLivraisonPdf({
                                        appareil: app,
                                        client: { nom: app.client_nom, telephone: app.client_telephone, adresse: app.client_adresse },
                                        accessoires_rendus: app.accessoires || '',
                                        date_livraison: new Date().toISOString(),
                                        numero: `BL-${app.uid_visible || app.id.slice(0, 8)}`,
                                        notes: '',
                                    }, (config || {}));
                                    window.open(URL.createObjectURL(blob));
                                }, children: [_jsx(Truck, { size: 16 }), " Bon de livraison"] }))] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [_jsx(DollarSign, { size: 16, className: "text-green-500" }), " Facturation"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", onClick: () => navigate(`/electronique/devis/${app.id}`), children: [_jsx(FileText, { size: 14 }), " Nouveau devis"] }), _jsxs(Button, { size: "sm", onClick: () => navigate(`/electronique/factures/${app.id}`), children: [_jsx(FileText, { size: 14 }), " Nouvelle facture"] }), _jsxs(Button, { size: "sm", onClick: () => navigate(`/electronique/paiements/${app.id}`), children: [_jsx(CreditCard, { size: 14 }), " Paiement"] })] })] }), devisList.length > 0 && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs text-gray-400 font-medium mb-2", children: ["Devis (", devisList.length, ")"] }), _jsx("div", { className: "space-y-2", children: devisList.map((d) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-mono font-medium", children: d.numero }), _jsx(Badge, { variant: d.statut === 'accepte' ? 'green' : d.statut === 'refuse' ? 'red' : 'default', children: d.statut }), _jsxs("span", { className: "text-gray-500", children: [d.total_ttc?.toLocaleString(), " FG"] })] }), _jsx(Button, { size: "sm", onClick: () => {
                                                import('../../pdf/generateElectroniquePdf').then(async (mod) => {
                                                    const blob = await mod.generateDevisElectroniquePdf(d, (config || {}));
                                                    window.open(URL.createObjectURL(blob));
                                                });
                                            }, children: _jsx(Download, { size: 14 }) })] }, d.id))) })] })), facturesList.length > 0 && (_jsxs("div", { children: [_jsxs("p", { className: "text-xs text-gray-400 font-medium mb-2", children: ["Factures (", facturesList.length, ")"] }), _jsx("div", { className: "space-y-2", children: facturesList.map((f) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-mono font-medium", children: f.numero }), _jsx(Badge, { variant: f.statut === 'payee' ? 'green' : f.statut === 'annulee' ? 'red' : 'default', children: f.statut }), _jsxs("span", { className: "text-gray-500", children: [f.total_ttc?.toLocaleString(), " FG"] })] }), _jsx(Button, { size: "sm", onClick: async () => {
                                                const blob = await (await import('../../pdf/generateElectroniquePdf')).generateFactureElectroniquePdf({ ...f, ...config }, config);
                                                window.open(URL.createObjectURL(blob));
                                            }, children: _jsx(Download, { size: 14 }) })] }, f.id))) })] })), devisList.length === 0 && facturesList.length === 0 && (_jsx("p", { className: "text-sm text-gray-400 text-center py-4", children: "Aucun document de facturation" }))] })] }));
}
