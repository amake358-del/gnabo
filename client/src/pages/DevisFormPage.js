import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { formatCurrency, formatDecimal } from '../utils/format';
import { toast } from '../utils/notify';
import { generatePdf } from '../pdf/generatePdf';
import { Plus, Trash2, ArrowLeft, ArrowRight, Save, FileText, Search, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
export function DevisFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = !!id;
    const viewOnly = isEdit && searchParams.get('apercu') === '1';
    const [step, setStep] = useState(0);
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
    const [companyConfig, setCompanyConfig] = useState(null);
    const { register, watch, setValue, reset, getValues } = useForm({
        defaultValues: { remise: 0, transport: 0, pose: 0, tva: 0, acompte: 0, statut: 'brouillon' }
    });
    const watchRemise = watch('remise');
    const watchTransport = watch('transport');
    const watchPose = watch('pose');
    const watchTva = watch('tva');
    const watchAcompte = watch('acompte');
    useEffect(() => {
        supabase.from('catalog_types').select('*').then(({ data }) => setTypes(data ?? []));
        supabase.from('catalog_modeles').select('*').then(({ data }) => setModelesList(data ?? []));
        supabase.from('clients').select('*').then(({ data }) => { setClients(data ?? []); setFilteredClients(data ?? []); });
        supabase.from('parametres').select('cle, valeur').then(({ data }) => {
            if (!data)
                return;
            const cfg = {};
            for (const r of data)
                cfg[r.cle] = r.valeur;
            setCompanyConfig(cfg);
            if (!isEdit && cfg.default_tva)
                setValue('tva', parseFloat(cfg.default_tva) || 0);
        });
    }, []);
    useEffect(() => {
        if (clientSearch) {
            const s = clientSearch.toLowerCase();
            setFilteredClients(clients.filter(c => c.nom?.toLowerCase().includes(s) || c.prenom?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)));
        }
        else
            setFilteredClients(clients);
    }, [clientSearch, clients]);
    useEffect(() => {
        if (isEdit) {
            supabase.from('devis').select('*, devis_lignes(*)').eq('id', id).single().then(({ data: d, error }) => {
                if (error || !d) {
                    navigate('/devis');
                    return;
                }
                reset({
                    client_id: String(d.client_id),
                    type_id: '',
                    modele_id: '',
                    notes: d.notes ?? '',
                    remise: 0,
                    transport: 0,
                    pose: 0,
                    tva: d.tva,
                    acompte: d.acompte ?? 0,
                    statut: d.statut,
                });
                if (d.devis_lignes) {
                    const lignes = d.devis_lignes.map((l, i) => ({
                        designation: l.description,
                        quantite: l.quantite,
                        largeur: l.largeur ?? 0,
                        hauteur: l.hauteur ?? 0,
                        surface: l.surface ?? 0,
                        prix_m2: l.prix_unitaire_ht,
                        total: l.total_ht,
                        sort_order: i,
                    }));
                    setLines(lignes);
                }
                setStep(3);
                setLoading(false);
            });
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
            line.surface = Math.round((parseFloat(w) || 0) * (parseFloat(h) || 0) / 10000 * 1000000) / 1000000;
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
            const data = getValues();
            const payload = {
                client_id: parseInt(data.client_id),
                service: 'aluminium',
                statut: data.statut || 'brouillon',
                montant_ht: stats.total_ht,
                tva: data.tva || 0,
                montant_ttc: stats.total_ttc,
                acompte: data.acompte || 0,
                notes: data.notes || '',
            };
            let devisId = id;
            if (isEdit && devisId) {
                await supabase.from('devis').update(payload).eq('id', devisId);
                await supabase.from('devis_lignes').delete().eq('devis_id', devisId);
            }
            else {
                const { data: newDevis, error } = await supabase.from('devis').insert(payload).select('id').single();
                if (error)
                    throw error;
                devisId = newDevis.id;
            }
            if (lines.length > 0 && devisId) {
                const lignes = lines.map(l => ({
                    devis_id: devisId,
                    description: l.designation,
                    quantite: l.quantite,
                    prix_unitaire_ht: l.prix_m2 || 0,
                    total_ht: l.total || 0,
                    largeur: l.largeur || null,
                    hauteur: l.hauteur || null,
                    surface: l.surface || null,
                }));
                const { error: lErr } = await supabase.from('devis_lignes').insert(lignes);
                if (lErr)
                    throw lErr;
            }
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
            const devisData = {
                id: id || 'new',
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
                client: clients.find(c => String(c.id) === getValues().client_id),
            };
            const blob = await generatePdf(devisData, companyConfig || {});
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
            const { data, error } = await supabase.from('clients').insert({
                nom: newClientCompany || newClientName,
                prenom: newClientCompany ? newClientName : '',
            }).select().single();
            if (error)
                throw error;
            setClients(prev => [data, ...prev]);
            setValue('client_id', data.id);
            setClientModalOpen(false);
            setNewClientName('');
            setNewClientCompany('');
        }
        catch (err) {
            toast(err.message, 'error');
        }
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
    const steps = [
        { label: 'Type', done: !!getValues().type_id },
        { label: 'Modèle', done: !!getValues().modele_id },
        { label: 'Client', done: !!getValues().client_id },
        { label: 'Lignes', done: lines.length > 0 },
        { label: 'Aperçu', done: false },
    ];
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate('/devis'), children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }), _jsx("h1", { className: "text-2xl font-bold", children: isEdit ? 'Modifier devis' : 'Nouveau devis' })] }), _jsx("div", { className: "flex items-center gap-2", children: steps.map((s, i) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setStep(i), className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === i ? 'bg-primary-600 text-white' : s.done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`, children: s.done ? '✓' : i + 1 }), _jsx("span", { className: `text-sm ${step === i ? 'font-medium' : 'text-gray-500'}`, children: s.label }), i < steps.length - 1 && _jsx("div", { className: "w-8 h-px bg-gray-300 dark:bg-gray-600" })] }, i))) }), step === 0 && (_jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Choisir le type de devis" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: types.map(t => (_jsx("button", { type: "button", onClick: () => { setValue('type_id', t.id); setStep(1); }, className: `p-4 rounded-xl border-2 text-center transition-all ${getValues().type_id === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`, children: _jsx("p", { className: "font-medium", children: t.name }) }, t.id))) })] })), step === 1 && (_jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Choisir le mod\u00E8le" }), !getValues().type_id ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Veuillez d'abord s\u00E9lectionner un type." })) : (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [modelesList.filter(m => m.type_id === getValues().type_id && m.status === 'actif').map(m => (_jsxs("button", { type: "button", onClick: () => { setValue('modele_id', m.id); setStep(2); }, className: `p-4 rounded-xl border-2 text-center transition-all ${getValues().modele_id === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`, children: [_jsx("p", { className: "font-medium", children: m.name }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [m.prix.toFixed(2), " FG/m\u00B2"] }), m.description && _jsx("p", { className: "text-xs text-gray-400 mt-1", children: m.description })] }, m.id))), modelesList.filter(m => m.type_id === getValues().type_id && m.status === 'actif').length === 0 && (_jsx("p", { className: "text-gray-500 col-span-full text-center py-4", children: "Aucun mod\u00E8le actif pour ce type." }))] }))] })), step === 2 && (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Choisir ou cr\u00E9er un client" }), _jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setClientModalOpen(true), children: [_jsx(Plus, { size: 14 }), " Nouveau client"] })] }), _jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { className: "input pl-10", placeholder: "Rechercher un client...", value: clientSearch, onChange: e => setClientSearch(e.target.value) })] }), _jsxs("div", { className: "max-h-64 overflow-y-auto space-y-2", children: [filteredClients.map(c => (_jsxs("button", { type: "button", onClick: () => { setValue('client_id', c.id); setStep(3); }, className: `w-full text-left p-3 rounded-lg border transition-all ${getValues().client_id === c.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`, children: [_jsxs("p", { className: "font-medium", children: [c.nom, " ", c.prenom || ''] }), _jsxs("p", { className: "text-sm text-gray-500", children: [c.email, " ", c.telephone ? `| ${c.telephone}` : ''] })] }, c.id))), filteredClients.length === 0 && _jsx("p", { className: "text-center text-gray-500 py-4", children: "Aucun client trouv\u00E9" })] })] })), step === 3 && (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Lignes du devis" }), _jsxs(Button, { size: "sm", onClick: addLine, children: [_jsx(Plus, { size: 14 }), " Ajouter une ligne"] })] }), lines.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(FileText, { size: 48, className: "mx-auto mb-2 opacity-50" }), _jsx("p", { children: "Aucune ligne. Cliquez sur \"Ajouter une ligne\" pour commencer." })] })) : (_jsx("div", { className: "space-y-3", children: lines.map((line, i) => (_jsxs("div", { className: "relative p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg", children: [_jsxs("div", { className: "flex flex-col gap-3 lg:hidden", children: [_jsx("input", { className: "input text-sm", placeholder: "D\u00E9signation", value: line.designation, onChange: e => updateLine(i, 'designation', e.target.value) }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("input", { className: "input text-sm", type: "number", placeholder: "Qt\u00E9", value: line.quantite || '', onChange: e => updateLine(i, 'quantite', parseFloat(e.target.value) || 0) }), _jsx("input", { className: "input text-sm", type: "number", placeholder: "L (mm)", value: line.largeur || '', onChange: e => updateLine(i, 'largeur', parseFloat(e.target.value) || 0) }), _jsx("input", { className: "input text-sm", type: "number", placeholder: "H (mm)", value: line.hauteur || '', onChange: e => updateLine(i, 'hauteur', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("input", { className: "input text-sm", type: "number", step: "any", placeholder: "m\u00B2", value: line.surface || '', onChange: e => updateLine(i, 'surface', parseFloat(e.target.value) || 0) }), _jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Prix:" }), _jsx("input", { className: "input text-sm flex-1", type: "number", step: "0.000001", placeholder: "FG/m\u00B2", value: line.prix_m2 || '', onChange: e => updateLine(i, 'prix_m2', parseFloat(e.target.value) || 0) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm font-semibold", children: ["Total: ", formatCurrency(line.total)] }), _jsx(Button, { onClick: () => removeLine(i), className: "p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsxs("div", { className: "hidden lg:flex items-start gap-2", children: [_jsxs("div", { className: "flex-1 grid grid-cols-12 gap-2", children: [_jsx("input", { className: "input col-span-4 text-sm", placeholder: "D\u00E9signation", value: line.designation, onChange: e => updateLine(i, 'designation', e.target.value) }), _jsx("input", { className: "input col-span-1 text-sm", type: "number", placeholder: "Qt\u00E9", value: line.quantite || '', onChange: e => updateLine(i, 'quantite', parseFloat(e.target.value) || 0) }), _jsx("input", { className: "input col-span-1 text-sm", type: "number", placeholder: "L (mm)", value: line.largeur || '', onChange: e => updateLine(i, 'largeur', parseFloat(e.target.value) || 0) }), _jsx("input", { className: "input col-span-1 text-sm", type: "number", placeholder: "H (mm)", value: line.hauteur || '', onChange: e => updateLine(i, 'hauteur', parseFloat(e.target.value) || 0) }), _jsx("input", { className: "input col-span-1 text-sm", type: "number", step: "any", placeholder: "m\u00B2", value: line.surface || '', onChange: e => updateLine(i, 'surface', parseFloat(e.target.value) || 0) }), _jsx("input", { className: "input col-span-1 text-sm", type: "number", step: "0.000001", placeholder: "FG/m\u00B2", value: line.prix_m2 || '', onChange: e => updateLine(i, 'prix_m2', parseFloat(e.target.value) || 0) }), _jsx("div", { className: "col-span-1 flex items-center text-sm font-medium", children: formatCurrency(line.total) })] }), _jsx(Button, { onClick: () => removeLine(i), className: "p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1 shrink-0", children: _jsx(Trash2, { size: 14 }) })] })] }, i))) }))] })), step === 4 && (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Aper\u00E7u du devis" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "secondary", size: "sm", onClick: handleGeneratePdf, loading: generatingPdf, children: [_jsx(FileText, { size: 14 }), " G\u00E9n\u00E9rer le PDF"] }), pdfBlob && (_jsxs(Button, { size: "sm", onClick: () => {
                                            const url = URL.createObjectURL(pdfBlob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `devis-${Date.now()}.pdf`;
                                            a.click();
                                        }, children: [_jsx(Download, { size: 14 }), " T\u00E9l\u00E9charger"] }))] })] }), lines.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [_jsx("th", { className: "px-3 py-2 text-left", children: "D\u00E9signation" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Qt\u00E9" }), _jsx("th", { className: "px-3 py-2 text-right", children: "L (mm)" }), _jsx("th", { className: "px-3 py-2 text-right", children: "H (mm)" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Surface" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Prix m\u00B2" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Total" })] }) }), _jsx("tbody", { children: lines.map((l, i) => (_jsxs("tr", { className: "border-b border-gray-100 dark:border-gray-800", children: [_jsx("td", { className: "px-3 py-2", children: l.designation }), _jsx("td", { className: "px-3 py-2 text-right", children: l.quantite }), _jsx("td", { className: "px-3 py-2 text-right", children: l.largeur }), _jsx("td", { className: "px-3 py-2 text-right", children: l.hauteur }), _jsxs("td", { className: "px-3 py-2 text-right", children: [formatDecimal(l.surface, 6), " m\u00B2"] }), _jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(l.prix_m2) }), _jsx("td", { className: "px-3 py-2 text-right font-medium", children: formatCurrency(l.total) })] }, i))) })] }) })) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Aucune ligne" }))] })), (step >= 3) && (_jsxs(Card, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4", children: [_jsx(Input, { label: "Remise (FG)", type: "number", step: "0.01", ...register('remise', { valueAsNumber: true }) }), _jsx(Input, { label: "Transport (FG)", type: "number", step: "0.01", ...register('transport', { valueAsNumber: true }) }), _jsx(Input, { label: "Pose (FG)", type: "number", step: "0.01", ...register('pose', { valueAsNumber: true }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsx(Input, { label: "TVA (%)", type: "number", step: "0.1", ...register('tva', { valueAsNumber: true }) }), _jsx(Input, { label: "Acompte (FG)", type: "number", step: "0.01", ...register('acompte', { valueAsNumber: true }) }), _jsx(Select, { label: "Statut", options: [
                                    { value: 'brouillon', label: 'Brouillon' },
                                    { value: 'envoye', label: 'Envoyé' },
                                    { value: 'accepte', label: 'Accepté' },
                                    { value: 'refusé', label: 'Refusé' },
                                ], ...register('statut') })] }), _jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total HT" }), _jsx("span", { className: "font-medium", children: formatCurrency(stats.total_ht) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total TTC" }), _jsx("span", { className: "font-bold text-lg text-primary-600", children: formatCurrency(stats.total_ttc) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["Acompte (", stats.acomptePct, "%)"] }), _jsx("span", { children: formatCurrency(stats.acompte) })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Reste \u00E0 payer" }), _jsx("span", { className: "font-medium", children: formatCurrency(stats.reste) })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input min-h-[80px] resize-none", ...register('notes') })] })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("div", { children: step > 0 && _jsxs(Button, { variant: "secondary", onClick: () => setStep(step - 1), children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }) }), _jsxs("div", { className: "flex gap-3", children: [step < 4 && _jsxs(Button, { onClick: () => setStep(step + 1), children: ["Suivant ", _jsx(ArrowRight, { size: 16 })] }), step >= 4 && _jsxs(Button, { onClick: handleSave, loading: saving, children: [_jsx(Save, { size: 16 }), " ", isEdit ? 'Modifier' : 'Enregistrer'] })] })] }), _jsx(Modal, { open: clientModalOpen, onClose: () => setClientModalOpen(false), title: "Nouveau client", size: "sm", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Nom *", value: newClientName, onChange: e => setNewClientName(e.target.value), placeholder: "Nom du contact" }), _jsx(Input, { label: "Soci\u00E9t\u00E9", value: newClientCompany, onChange: e => setNewClientCompany(e.target.value), placeholder: "Nom de la soci\u00E9t\u00E9" }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setClientModalOpen(false), children: "Annuler" }), _jsx(Button, { onClick: handleCreateClient, children: "Cr\u00E9er" })] })] }) })] }));
}
