import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ClipboardList, ArrowLeft, Save, AlertTriangle, FileText } from 'lucide-react';
export function DiagnosticPage() {
    const { appareilId } = useParams();
    const navigate = useNavigate();
    const [appareil, setAppareil] = useState(null);
    const [diagnostic, setDiagnostic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [config, setConfig] = useState({ company_name: '', currency: 'GNF' });
    const [form, setForm] = useState({
        diagnostic: '', cause: '', tests: '', pieces_necessaires: '',
        main_oeuvre: '', temps_estime: '', observations: ''
    });
    useEffect(() => {
        if (!appareilId)
            return;
        Promise.all([
            supabase.from('appareils').select('*, clients(nom, telephone, adresse)').eq('id', appareilId).single(),
            supabase.from('diagnostics').select('*').eq('appareil_id', appareilId).maybeSingle(),
            supabase.from('parametres').select('cle, valeur'),
        ]).then(([appRes, diagRes, cfgRes]) => {
            if (appRes.error)
                throw appRes.error;
            if (cfgRes.error)
                throw cfgRes.error;
            const cfg = {};
            if (cfgRes.data) {
                cfgRes.data.forEach((row) => { cfg[row.cle] = row.valeur; });
            }
            setConfig({ company_name: cfg.company_name || '', currency: cfg.devise || 'GNF' });
            const appData = appRes.data;
            if (appData) {
                const client = appData.clients;
                setAppareil({
                    ...appData,
                    client_nom: client?.nom || '',
                    client_telephone: client?.telephone || '',
                    client_adresse: client?.adresse || '',
                });
            }
            else {
                setAppareil(null);
            }
            if (diagRes.data && !diagRes.error) {
                setDiagnostic(diagRes.data);
                setForm({
                    diagnostic: diagRes.data.diagnostic || '',
                    cause: diagRes.data.cause || '',
                    tests: diagRes.data.tests || '',
                    pieces_necessaires: diagRes.data.pieces_necessaires || '',
                    main_oeuvre: String(diagRes.data.main_oeuvre || ''),
                    temps_estime: String(diagRes.data.temps_estime || ''),
                    observations: diagRes.data.observations || '',
                });
            }
        }).catch(err => {
            console.error(err);
            setError(err.message || 'Erreur de chargement');
        }).finally(() => setLoading(false));
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
            if (diagnostic) {
                const { error: updateError } = await supabase.from('diagnostics').update({
                    diagnostic: form.diagnostic, cause: form.cause, tests: form.tests,
                    pieces_necessaires: form.pieces_necessaires,
                    main_oeuvre: parseFloat(form.main_oeuvre) || 0,
                    temps_estime: parseFloat(form.temps_estime) || 0,
                    observations: form.observations,
                }).eq('id', diagnostic.id);
                if (updateError)
                    throw updateError;
            }
            else {
                const { error: createError } = await supabase.from('diagnostics').insert({
                    appareil_id: appareilId, diagnostic: form.diagnostic, cause: form.cause,
                    tests: form.tests, pieces_necessaires: form.pieces_necessaires,
                    main_oeuvre: parseFloat(form.main_oeuvre) || 0,
                    temps_estime: parseFloat(form.temps_estime) || 0,
                    observations: form.observations,
                });
                if (createError)
                    throw createError;
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
    return (_jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsxs(Button, { onClick: () => navigate(`/electronique/appareils/${appareilId}`), className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors", children: [_jsx(ArrowLeft, { size: 16 }), " Retour \u00E0 la fiche"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center", children: _jsx(ClipboardList, { size: 20, className: "text-orange-500" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "Diagnostic" }), _jsxs("p", { className: "text-sm text-gray-500", children: [appareil.client_nom, " \u2014 ", appareil.marque, " ", appareil.modele] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Diagnostic" }), _jsx("textarea", { className: "input min-h-[80px]", value: form.diagnostic, onChange: e => handleFieldChange('diagnostic', e.target.value), placeholder: "Description du diagnostic..." })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Cause probable" }), _jsx("textarea", { className: "input min-h-[60px]", value: form.cause, onChange: e => handleFieldChange('cause', e.target.value), placeholder: "Cause du probl\u00E8me..." })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Tests effectu\u00E9s" }), _jsx("textarea", { className: "input min-h-[60px]", value: form.tests, onChange: e => handleFieldChange('tests', e.target.value), placeholder: "Tests r\u00E9alis\u00E9s..." })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Pi\u00E8ces n\u00E9cessaires" }), _jsx("textarea", { className: "input min-h-[60px]", value: form.pieces_necessaires, onChange: e => handleFieldChange('pieces_necessaires', e.target.value), placeholder: "Liste des pi\u00E8ces \u00E0 commander..." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Main-d'\u0153uvre (co\u00FBt)", type: "number", value: form.main_oeuvre, onChange: e => handleFieldChange('main_oeuvre', e.target.value), placeholder: "0" }), _jsx(Input, { label: "Temps estim\u00E9 (heures)", type: "number", value: form.temps_estime, onChange: e => handleFieldChange('temps_estime', e.target.value), placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Observations" }), _jsx("textarea", { className: "input min-h-[60px]", value: form.observations, onChange: e => handleFieldChange('observations', e.target.value), placeholder: "Notes suppl\u00E9mentaires..." })] }), error && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 14 }), " ", error] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs(Button, { onClick: handleSubmit, disabled: saving, children: [_jsx(Save, { size: 16 }), " ", diagnostic ? 'Mettre à jour' : 'Enregistrer le diagnostic'] }), _jsx(Button, { variant: "ghost", onClick: () => navigate(`/electronique/appareils/${appareilId}`), children: "Annuler" }), diagnostic && (_jsxs(Button, { variant: "secondary", onClick: async () => {
                                    const mod = await import('../../pdf/generateDiagnostic');
                                    const blob = await mod.generateDiagnosticPdf({
                                        appareil: appareil,
                                        client: { nom: appareil.client_nom, telephone: appareil.client_telephone, adresse: appareil.client_adresse },
                                        diagnostic: diagnostic,
                                        numero: `DIA-${appareil.uid_visible || appareil.id.slice(0, 8)}`,
                                        cout_estime: diagnostic.main_oeuvre || 0,
                                        currency: config.currency || 'EUR',
                                    }, config);
                                    window.open(URL.createObjectURL(blob));
                                }, children: [_jsx(FileText, { size: 16 }), " PDF Diagnostic"] }))] })] })] }));
}
