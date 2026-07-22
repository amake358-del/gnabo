import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Wrench, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
const STATUT_FLOW = [
    { value: 'en_cours', label: 'En cours' },
    { value: 'attente_validation', label: 'Attente validation client' },
    { value: 'attente_pieces', label: 'Attente pièces' },
    { value: 'test', label: 'Test' },
    { value: 'termine', label: 'Terminé' },
];
export function ReparationPage() {
    const { appareilId } = useParams();
    const navigate = useNavigate();
    const [appareil, setAppareil] = useState(null);
    const [reparations, setReparations] = useState([]);
    const [diagnostic, setDiagnostic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeRep, setActiveRep] = useState(null);
    const [form, setForm] = useState({
        pieces_utilisees: '', main_oeuvre: '', temps_passe: '', notes: '', statut: 'en_cours'
    });
    useEffect(() => {
        if (!appareilId)
            return;
        Promise.all([
            supabase.from('appareils').select('*, clients(nom, telephone, adresse)').eq('id', appareilId).single(),
            supabase.from('reparations').select('*').eq('appareil_id', appareilId).order('cree_le', { ascending: false }),
            supabase.from('diagnostics').select('*').eq('appareil_id', appareilId).maybeSingle(),
        ]).then(([appRes, repRes, diagRes]) => {
            if (appRes.error)
                throw appRes.error;
            setAppareil(appRes.data);
            if (diagRes.error)
                throw diagRes.error;
            setDiagnostic(diagRes.data);
            if (repRes.error)
                throw repRes.error;
            const reps = repRes.data;
            setReparations(reps);
            if (reps.length > 0) {
                const latest = reps[0];
                setActiveRep(latest);
                setForm({
                    pieces_utilisees: latest.pieces_utilisees === '[]' ? '' : latest.pieces_utilisees,
                    main_oeuvre: String(latest.main_oeuvre || ''),
                    temps_passe: String(latest.temps_passe || ''),
                    notes: latest.notes,
                    statut: latest.statut,
                });
            }
        }).catch(console.error).finally(() => setLoading(false));
    }, [appareilId]);
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async () => {
        if (!appareilId)
            return;
        setSaving(true);
        setError('');
        try {
            if (activeRep) {
                const { error } = await supabase.from('reparations').update({
                    pieces_utilisees: form.pieces_utilisees || '[]',
                    main_oeuvre: parseFloat(form.main_oeuvre) || 0,
                    temps_passe: parseFloat(form.temps_passe) || 0,
                    notes: form.notes,
                    statut: form.statut,
                }).eq('id', activeRep.id);
                if (error)
                    throw error;
            }
            else {
                const { error } = await supabase.from('reparations').insert({
                    appareil_id: appareilId,
                    diagnostic_id: diagnostic?.id || undefined,
                    pieces_utilisees: form.pieces_utilisees || '[]',
                    main_oeuvre: parseFloat(form.main_oeuvre) || 0,
                    temps_passe: parseFloat(form.temps_passe) || 0,
                    notes: form.notes,
                    statut: form.statut,
                });
                if (error)
                    throw error;
            }
            navigate(`/electronique/appareils/${appareilId}`);
        }
        catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) });
    if (!appareil)
        return _jsx("div", { className: "text-center py-12 text-gray-400", children: "Appareil non trouv\u00E9" });
    return (_jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsxs(Button, { onClick: () => navigate(`/electronique/appareils/${appareilId}`), className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors", children: [_jsx(ArrowLeft, { size: 16 }), " Retour \u00E0 la fiche"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center", children: _jsx(Wrench, { size: 20, className: "text-blue-500" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "R\u00E9paration" }), _jsxs("p", { className: "text-sm text-gray-500", children: [appareil.clients?.nom, " \u2014 ", appareil.marque, " ", appareil.modele] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [diagnostic && (_jsxs("div", { className: "p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm", children: [_jsx("p", { className: "font-medium text-gray-500 mb-1", children: "Diagnostic associ\u00E9" }), _jsxs("p", { children: [diagnostic.diagnostic || 'Aucun diagnostic', " ", diagnostic.pieces_necessaires && `— Pièces : ${diagnostic.pieces_necessaires}`] })] })), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Statut" }), _jsx("div", { className: "flex flex-wrap gap-2", children: STATUT_FLOW.map(s => (_jsx(Button, { onClick: () => handleFieldChange('statut', s.value), className: `px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${form.statut === s.value
                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 text-primary-700 dark:text-primary-300'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-200'}`, children: s.label }, s.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Pi\u00E8ces utilis\u00E9es" }), _jsx("textarea", { className: "input min-h-[80px]", value: form.pieces_utilisees, onChange: e => handleFieldChange('pieces_utilisees', e.target.value), placeholder: "Liste des pi\u00E8ces remplac\u00E9es..." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Main-d'\u0153uvre (co\u00FBt)" }), _jsx("input", { className: "input", type: "number", value: form.main_oeuvre, onChange: e => handleFieldChange('main_oeuvre', e.target.value), placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Temps pass\u00E9 (heures)" }), _jsx("input", { className: "input", type: "number", value: form.temps_passe, onChange: e => handleFieldChange('temps_passe', e.target.value), placeholder: "0" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Notes de r\u00E9paration" }), _jsx("textarea", { className: "input min-h-[80px]", value: form.notes, onChange: e => handleFieldChange('notes', e.target.value), placeholder: "D\u00E9tails de l'intervention..." })] }), error && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 14 }), " ", error] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs(Button, { onClick: handleSubmit, disabled: saving, children: [_jsx(Save, { size: 16 }), " ", activeRep ? 'Mettre à jour' : 'Démarrer la réparation'] }), _jsx(Button, { variant: "ghost", onClick: () => navigate(`/electronique/appareils/${appareilId}`), children: "Annuler" })] })] }), reparations.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4", children: [_jsx("h3", { className: "font-semibold text-sm mb-3", children: "Historique des r\u00E9parations" }), _jsx("div", { className: "space-y-2", children: reparations.map(r => (_jsxs("div", { className: "flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg", children: [_jsx("span", { className: "text-gray-500", children: r.cree_le?.split(' ')[0] }), _jsx("span", { className: "font-medium", children: STATUT_FLOW.find(s => s.value === r.statut)?.label || r.statut }), r.main_oeuvre > 0 && _jsxs("span", { children: [r.main_oeuvre, " FG"] }), r.temps_passe > 0 && _jsxs("span", { children: [r.temps_passe, "h"] })] }, r.id))) })] }))] }));
}
