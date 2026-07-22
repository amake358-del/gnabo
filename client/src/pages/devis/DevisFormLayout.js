import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { devisApi, catalogueApi, clientsApi, settingsApi } from '../../services/api';
import { formatCurrency, formatDecimal } from '../../utils/format';
import { generatePdf } from '../../pdf/generatePdf';
import { ArrowLeft, ArrowRight, Save, FileText, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '../../utils/notify';
const STEP_PARTS_CREATE = ['', 'modele', 'client', 'lignes', 'apercu'];
const STEP_PARTS_EDIT = ['type', 'modele', 'client', 'lignes', 'apercu'];
function getStepFromPath(pathname, isEdit) {
    const last = pathname.split('/').filter(Boolean).pop() || '';
    if (isEdit) {
        if (last === 'type')
            return 0;
        if (last === 'modele')
            return 1;
        if (last === 'client')
            return 2;
        if (last === 'lignes')
            return 3;
        if (last === 'apercu' || last === 'pdf')
            return 4;
        return 3;
    }
    if (last === 'nouveau' || last === 'type')
        return 0;
    if (last === 'modele')
        return 1;
    if (last === 'client')
        return 2;
    if (last === 'lignes')
        return 3;
    if (last === 'apercu' || last === 'pdf')
        return 4;
    return 0;
}
function getPathForStep(isEdit, id, step) {
    if (isEdit)
        return `/devis/${id}/${STEP_PARTS_EDIT[step]}`;
    const s = STEP_PARTS_CREATE[step];
    return s ? `/devis/nouveau/${s}` : '/devis/nouveau';
}
export function useDevisForm() {
    const ctx = useOutletContext();
    if (!ctx)
        throw new Error('useDevisForm must be used within DevisFormLayout');
    return ctx;
}
export function DevisFormLayout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const viewOnly = isEdit && new URLSearchParams(location.search).get('apercu') === '1';
    const step = getStepFromPath(location.pathname, isEdit);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [types, setTypes] = useState([]);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [clientModalOpen, setClientModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientCompany, setNewClientCompany] = useState('');
    const [lines, setLines] = useState([]);
    const [modelesList, setModelesList] = useState([]);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [stats, setStats] = useState({ total_ht: 0, total_ttc: 0, acompte: 0, reste: 0, acomptePct: 30 });
    const { register, watch, setValue, reset, getValues } = useForm({
        defaultValues: { remise: 0, transport: 0, pose: 0, tva: 0, acompte: 0, statut: 'brouillon' }
    });
    const watchRemise = watch('remise');
    const watchTransport = watch('transport');
    const watchPose = watch('pose');
    const watchTva = watch('tva');
    const watchAcompte = watch('acompte');
    useEffect(() => { catalogueApi.listTypes().then(r => setTypes(r.data)).catch(() => toast('Erreur chargement types', 'error')); }, []);
    useEffect(() => { catalogueApi.listModeles().then(r => setModelesList(r.data)).catch(() => toast('Erreur chargement modèles', 'error')); }, []);
    useEffect(() => { clientsApi.list().then(r => { setClients(r.data); setFilteredClients(r.data); }).catch(() => toast('Erreur chargement clients', 'error')); }, []);
    useEffect(() => { if (!isEdit) {
        settingsApi.getCompany().then(r => { if (r.data.default_tva)
            setValue('tva', r.data.default_tva); }).catch(() => { });
    } }, []);
    useEffect(() => {
        if (clientSearch) {
            const s = clientSearch.toLowerCase();
            setFilteredClients(clients.filter(c => c.company?.toLowerCase().includes(s) || c.nom?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)));
        }
        else
            setFilteredClients(clients);
    }, [clientSearch, clients]);
    useEffect(() => {
        if (isEdit) {
            devisApi.get(id).then(res => {
                const d = res.data;
                reset({ client_id: d.client_id, type_id: d.type_id || '', modele_id: d.modele_id || '', notes: d.notes, remise: d.remise, transport: d.transport, pose: d.pose, tva: d.tva, acompte: d.acompte, statut: d.statut });
                if (d.lines)
                    setLines(d.lines.map((l, i) => ({ ...l, sort_order: i })));
                setLoading(false);
            }).catch(() => navigate('/devis'));
        }
    }, [id]);
    const recalc = useCallback(() => {
        const total_ht = lines.reduce((s, l) => s + (l.total || 0), 0);
        const v = getValues();
        const remise = v.remise || 0;
        const transport = v.transport || 0;
        const pose = v.pose || 0;
        const tva = v.tva || 20;
        const after_remise = total_ht - remise;
        const total_ttc = after_remise + transport + pose + (after_remise * tva / 100);
        const defaultPct = 30;
        const acompte = (v.acompte && v.acompte > 0) ? v.acompte : Math.round(total_ttc * defaultPct / 100 * 100) / 100;
        const acomptePct = total_ttc > 0 ? Math.round(acompte / total_ttc * 100) : defaultPct;
        const reste = Math.round((total_ttc - acompte) * 100) / 100;
        setStats({ total_ht: Math.round(total_ht * 100) / 100, total_ttc: Math.round(total_ttc * 100) / 100, acompte, reste, acomptePct });
    }, [lines, getValues]);
    useEffect(() => { recalc(); }, [lines, watchRemise, watchTransport, watchPose, watchTva, watchAcompte, recalc]);
    const addLine = () => {
        setLines([...lines, { designation: '', quantite: 1, largeur: 0, hauteur: 0, surface: 0, prix_m2: 0, total: 0, sort_order: lines.length }]);
    };
    const updateLine = (idx, field, value) => {
        const newLines = [...lines];
        const line = { ...newLines[idx], [field]: value };
        if (field === 'largeur' || field === 'hauteur') {
            const w = field === 'largeur' ? value : line.largeur;
            const h = field === 'hauteur' ? value : line.hauteur;
            line.surface = Math.round((parseFloat(w) || 0) * (parseFloat(h) || 0) / 1000000 * 1000000) / 1000000;
        }
        if (field === 'largeur' || field === 'hauteur' || field === 'surface' || field === 'quantite' || field === 'prix_m2') {
            const q = field === 'quantite' ? value : line.quantite;
            const p = field === 'prix_m2' ? value : line.prix_m2;
            const s = field === 'surface' ? value : line.surface;
            line.total = Math.round((parseFloat(s) || 0) * (parseFloat(q) || 1) * (parseFloat(p) || 0) * 100) / 100;
        }
        newLines[idx] = line;
        setLines(newLines);
    };
    const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));
    const handleSave = async () => {
        setSaving(true);
        try {
            const v = getValues();
            const payload = {
                client_id: v.client_id, type_id: v.type_id, modele_id: v.modele_id,
                notes: v.notes, statut: v.statut || 'brouillon',
                montant_ht: stats.total_ht, tva: v.tva, montant_ttc: stats.total_ttc,
                remise: v.remise, transport: v.transport, pose: v.pose, acompte: stats.acompte,
                lines: lines.map(l => ({ designation: l.designation, quantite: l.quantite, largeur: l.largeur, hauteur: l.hauteur, prix_m2: l.prix_m2 }))
            };
            if (isEdit)
                await devisApi.update(id, payload);
            else
                await devisApi.create(payload);
            navigate('/devis');
        }
        catch (err) {
            toast(err.message, 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const handleGeneratePdf = async () => {
        setGeneratingPdf(true);
        try {
            const company = await settingsApi.getCompany().then(r => r.data).catch(() => ({}));
            const devisData = {
                id: id || 'new',
                entreprise_id: window.__entrepriseId || '',
                numero: 'DEV-2026-XXXXXX',
                client_id: getValues().client_id,
                type_id: getValues().type_id,
                modele_id: getValues().modele_id,
                statut: 'brouillon',
                total_ht: stats.total_ht,
                remise: getValues().remise || 0,
                transport: getValues().transport || 0,
                pose: getValues().pose || 0,
                tva: getValues().tva || 20,
                total_ttc: stats.total_ttc,
                acompte: stats.acompte,
                reste: stats.reste,
                notes: getValues().notes || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                lines: lines.map((l, i) => ({ ...l, sort_order: i })),
                client: clients.find(c => c.id === getValues().client_id),
            };
            const blob = await generatePdf(devisData, company);
            setPdfBlob(blob);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
        catch (err) {
            toast(err.message, 'error');
        }
        finally {
            setGeneratingPdf(false);
        }
    };
    const handleCreateClient = async () => {
        if (!newClientName.trim())
            return;
        try {
            const res = await clientsApi.create({ nom: newClientName, company: newClientCompany });
            setClients(prev => [res.data, ...prev]);
            setValue('client_id', res.data.id);
            setClientModalOpen(false);
            setNewClientName('');
            setNewClientCompany('');
        }
        catch (err) {
            toast(err.message, 'error');
        }
    };
    const goToStep = (s) => {
        navigate(getPathForStep(isEdit, id, s));
    };
    const goNext = () => {
        if (step < 4)
            navigate(getPathForStep(isEdit, id, step + 1));
    };
    const goBack = () => {
        if (step > 0)
            navigate(getPathForStep(isEdit, id, step - 1));
        else
            navigate('/devis');
    };
    const stepLabels = ['Type', 'Modèle', 'Client', 'Lignes', 'Aperçu'];
    const stepDone = [
        !!getValues().type_id,
        !!getValues().modele_id,
        !!getValues().client_id,
        lines.length > 0,
        false,
    ];
    const outletContext = {
        register, watch, setValue, getValues,
        lines, addLine, updateLine, removeLine,
        types, clients, filteredClients, modelesList,
        clientSearch, setClientSearch,
        clientModalOpen, setClientModalOpen,
        newClientName, setNewClientName,
        newClientCompany, setNewClientCompany,
        stats, pdfBlob, generatingPdf,
        handleSave, handleGeneratePdf, handleCreateClient,
        loading, saving, isEdit, viewOnly, id,
        step, goToStep, goNext, goBack,
    };
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(LoadingSpinner, { size: 40 }) });
    if (viewOnly) {
        return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate('/devis'), children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }), _jsx("h1", { className: "text-2xl font-bold", children: "Aper\u00E7u du devis" })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Aper\u00E7u du devis" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "secondary", size: "sm", onClick: handleGeneratePdf, loading: generatingPdf, children: [_jsx(FileText, { size: 14 }), " G\u00E9n\u00E9rer le PDF"] }), pdfBlob && (_jsxs(Button, { size: "sm", onClick: () => {
                                                const url = URL.createObjectURL(pdfBlob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `devis-${Date.now()}.pdf`;
                                                a.click();
                                            }, children: [_jsx(Download, { size: 14 }), " T\u00E9l\u00E9charger"] }))] })] }), lines.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [_jsx("th", { className: "px-3 py-2 text-left", children: "D\u00E9signation" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Qt\u00E9" }), _jsx("th", { className: "px-3 py-2 text-right", children: "L (mm)" }), _jsx("th", { className: "px-3 py-2 text-right", children: "H (mm)" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Surface" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Prix m\u00B2" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Total" })] }) }), _jsx("tbody", { children: lines.map((l, i) => (_jsxs("tr", { className: "border-b border-gray-100 dark:border-gray-800", children: [_jsx("td", { className: "px-3 py-2", children: l.designation }), _jsx("td", { className: "px-3 py-2 text-right", children: l.quantite }), _jsx("td", { className: "px-3 py-2 text-right", children: l.largeur }), _jsx("td", { className: "px-3 py-2 text-right", children: l.hauteur }), _jsxs("td", { className: "px-3 py-2 text-right", children: [formatDecimal(l.surface, 6), " m\u00B2"] }), _jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(l.prix_m2) }), _jsx("td", { className: "px-3 py-2 text-right font-medium", children: formatCurrency(l.total) })] }, i))) })] }) })) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Aucune ligne" }))] }), _jsxs(Card, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4", children: [_jsx(Input, { label: "Remise (FG)", type: "number", step: "0.01", disabled: true, ...register('remise', { valueAsNumber: true }) }), _jsx(Input, { label: "Transport (FG)", type: "number", step: "0.01", disabled: true, ...register('transport', { valueAsNumber: true }) }), _jsx(Input, { label: "Pose (FG)", type: "number", step: "0.01", disabled: true, ...register('pose', { valueAsNumber: true }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsx(Input, { label: "TVA (%)", type: "number", step: "0.1", disabled: true, ...register('tva', { valueAsNumber: true }) }), _jsx(Input, { label: "Acompte (FG)", type: "number", step: "0.01", disabled: true, ...register('acompte', { valueAsNumber: true }) })] }), _jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total HT" }), _jsx("span", { className: "font-medium", children: formatCurrency(stats.total_ht) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total TTC" }), _jsx("span", { className: "font-bold text-lg text-primary-600", children: formatCurrency(stats.total_ttc) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["Acompte (", stats.acomptePct, "%)"] }), _jsx("span", { children: formatCurrency(stats.acompte) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Reste \u00E0 payer" }), _jsx("span", { className: "font-medium", children: formatCurrency(stats.reste) })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input min-h-[80px] resize-none", disabled: true, ...register('notes') })] })] }), _jsx("div", { className: "flex justify-between", children: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/devis'), children: [_jsx(ArrowLeft, { size: 16 }), " Retour \u00E0 la liste"] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate('/devis'), children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }), _jsx("h1", { className: "text-2xl font-bold", children: isEdit ? 'Modifier devis' : 'Nouveau devis' })] }), _jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-1", children: stepLabels.map((label, i) => (_jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsx("button", { type: "button", onClick: () => goToStep(i), className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === i ? 'bg-primary-600 text-white' : stepDone[i] ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`, children: stepDone[i] ? '✓' : i + 1 }), _jsx("span", { className: `text-sm ${step === i ? 'font-medium' : 'text-gray-500'}`, children: label }), i < stepLabels.length - 1 && _jsx("div", { className: "w-8 h-px bg-gray-300 dark:bg-gray-600" })] }, i))) }), _jsx(Outlet, { context: outletContext }), step >= 3 && (_jsxs(Card, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4", children: [_jsx(Input, { label: "Remise (FG)", type: "number", step: "0.01", ...register('remise', { valueAsNumber: true }) }), _jsx(Input, { label: "Transport (FG)", type: "number", step: "0.01", ...register('transport', { valueAsNumber: true }) }), _jsx(Input, { label: "Pose (FG)", type: "number", step: "0.01", ...register('pose', { valueAsNumber: true }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsx(Input, { label: "TVA (%)", type: "number", step: "0.1", ...register('tva', { valueAsNumber: true }) }), _jsx(Input, { label: "Acompte (FG)", type: "number", step: "0.01", ...register('acompte', { valueAsNumber: true }) }), _jsx(Select, { label: "Statut", options: [
                                    { value: 'brouillon', label: 'Brouillon' },
                                    { value: 'envoye', label: 'Envoyé' },
                                    { value: 'accepte', label: 'Accepté' },
                                    { value: 'refuse', label: 'Refusé' },
                                ], ...register('statut') })] }), _jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total HT" }), _jsx("span", { className: "font-medium", children: formatCurrency(stats.total_ht) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total TTC" }), _jsx("span", { className: "font-bold text-lg text-primary-600", children: formatCurrency(stats.total_ttc) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["Acompte (", stats.acomptePct, "%)"] }), _jsx("span", { children: formatCurrency(stats.acompte) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Reste \u00E0 payer" }), _jsx("span", { className: "font-medium", children: formatCurrency(stats.reste) })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input min-h-[80px] resize-none", ...register('notes') })] })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("div", { children: step > 0 && _jsxs(Button, { variant: "secondary", onClick: goBack, children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }) }), _jsxs("div", { className: "flex gap-3", children: [step < 4 && _jsxs(Button, { onClick: goNext, children: ["Suivant ", _jsx(ArrowRight, { size: 16 })] }), step >= 4 && _jsxs(Button, { onClick: handleSave, loading: saving, children: [_jsx(Save, { size: 16 }), " ", isEdit ? 'Modifier' : 'Enregistrer'] })] })] }), _jsx(Modal, { open: clientModalOpen, onClose: () => setClientModalOpen(false), title: "Nouveau client", size: "sm", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Nom *", value: newClientName, onChange: e => setNewClientName(e.target.value), placeholder: "Nom du contact" }), _jsx(Input, { label: "Soci\u00E9t\u00E9", value: newClientCompany, onChange: e => setNewClientCompany(e.target.value), placeholder: "Nom de la soci\u00E9t\u00E9" }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setClientModalOpen(false), children: "Annuler" }), _jsx(Button, { onClick: handleCreateClient, children: "Cr\u00E9er" })] })] }) })] }));
}
