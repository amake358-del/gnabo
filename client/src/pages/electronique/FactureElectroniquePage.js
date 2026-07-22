import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FileText, ArrowLeft, Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
export function FactureElectroniquePage() {
    const { appareilId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const devisId = searchParams.get('devis_id');
    const [appareil, setAppareil] = useState(null);
    const [devis, setDevis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [lines, setLines] = useState([{ designation: '', quantite: 1, prix_unitaire: 0, total: 0 }]);
    const [notes, setNotes] = useState('');
    const [tva, setTva] = useState(0);
    useEffect(() => {
        if (!appareilId)
            return;
        (async () => {
            const [a, d] = await Promise.all([
                supabase.from('appareils').select('*, clients(nom)').eq('id', appareilId).single(),
                devisId ? supabase.from('devis').select('*').eq('id', devisId).single() : Promise.resolve(null),
            ]);
            if (a.data) {
                const c = Array.isArray(a.data.clients) ? a.data.clients[0] : a.data.clients;
                setAppareil({ ...a.data, client_nom: c?.nom });
            }
            if (d?.data) {
                setDevis(d.data);
                setLines(typeof d.data.lignes === 'string' ? JSON.parse(d.data.lignes) : (d.data.lignes || []));
                setNotes(d.data.notes || '');
            }
            setLoading(false);
        })();
    }, [appareilId, devisId]);
    const calcLineTotal = (line) => (parseFloat(line.quantite) || 1) * (parseFloat(line.prix_unitaire) || 0);
    const updateLine = (idx, field, value) => {
        setLines((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            next[idx].total = calcLineTotal(next[idx]);
            return next;
        });
    };
    const addLine = () => setLines((prev) => [...prev, { designation: '', quantite: 1, prix_unitaire: 0, total: 0 }]);
    const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));
    const totalHt = lines.reduce((s, l) => s + l.total, 0);
    const tvaAmount = totalHt * (tva / 100);
    const totalTtc = totalHt + tvaAmount;
    const handleSubmit = async () => {
        if (!appareilId || !appareil)
            return;
        setSaving(true);
        setError('');
        try {
            await supabase.from('factures').insert({
                client_id: appareil.client_id,
                service: 'electronique',
                numero: 'FAC-E-' + Date.now().toString(36).toUpperCase(),
                devis_id: devisId || null,
                lignes: JSON.stringify(lines.filter((l) => l.designation)),
                montant_ht: totalHt,
                tva,
                montant_ttc: totalTtc,
                notes,
                statut: 'impayee',
            });
            navigate(`/electronique/appareils/${appareilId}`);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) });
    if (!appareil)
        return _jsx("div", { className: "text-center py-12 text-gray-400", children: "Appareil non trouv\u00E9" });
    return (_jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs(Button, { onClick: () => navigate(`/electronique/appareils/${appareilId}`), className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700", children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center", children: _jsx(FileText, { size: 20, className: "text-green-500" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: devis ? 'Facturer ce devis' : 'Nouvelle facture' }), _jsxs("p", { className: "text-sm text-gray-500", children: [appareil.client_nom, " \u2014 ", appareil.marque, " ", appareil.modele] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-sm", children: "Lignes de facture" }), _jsxs(Button, { size: "sm", onClick: addLine, children: [_jsx(Plus, { size: 14 }), " Ajouter"] })] }), lines.map((line, idx) => (_jsxs("div", { className: "flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl", children: [_jsx("div", { className: "flex-1", children: _jsx("input", { className: "input text-sm", placeholder: "D\u00E9signation", value: line.designation, onChange: e => updateLine(idx, 'designation', e.target.value) }) }), _jsx("div", { className: "w-20", children: _jsx("input", { className: "input text-sm", type: "number", placeholder: "Qt\u00E9", value: line.quantite, onChange: e => updateLine(idx, 'quantite', parseFloat(e.target.value) || 1), min: "1" }) }), _jsx("div", { className: "w-28", children: _jsx("input", { className: "input text-sm", type: "number", placeholder: "Prix unit.", value: line.prix_unitaire, onChange: e => updateLine(idx, 'prix_unitaire', parseFloat(e.target.value) || 0), min: "0" }) }), _jsxs("div", { className: "w-24 text-right pt-2 text-sm font-medium", children: [line.total.toLocaleString(), " FG"] }), lines.length > 1 && (_jsx(Button, { onClick: () => removeLine(idx), className: "pt-2 text-red-400 hover:text-red-600", children: _jsx(Trash2, { size: 16 }) }))] }, idx)))] }), _jsxs("div", { className: "border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Total HT" }), _jsxs("span", { className: "font-medium", children: [totalHt.toLocaleString(), " FG"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "TVA" }), _jsx("input", { className: "input w-20 text-sm", type: "number", value: tva, onChange: e => setTva(parseFloat(e.target.value) || 0), min: "0", max: "100" }), _jsx("span", { className: "text-sm text-gray-400", children: "%" }), _jsxs("span", { className: "ml-auto text-sm font-medium", children: [tvaAmount.toLocaleString(), " FG"] })] }), _jsxs("div", { className: "flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-600 pt-2", children: [_jsx("span", { children: "Total TTC" }), _jsxs("span", { children: [totalTtc.toLocaleString(), " FG"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input min-h-[60px]", value: notes, onChange: e => setNotes(e.target.value), placeholder: "Conditions de paiement..." })] }), error && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 14 }), " ", error] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: handleSubmit, disabled: saving, children: [_jsx(Save, { size: 16 }), " Cr\u00E9er la facture"] }), _jsx(Button, { variant: "ghost", onClick: () => navigate(`/electronique/appareils/${appareilId}`), children: "Annuler" })] })] })] }));
}
