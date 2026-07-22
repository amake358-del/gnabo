import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DollarSign, ArrowLeft, CheckCircle, AlertTriangle, Download } from 'lucide-react';
export function PaiementPage() {
    const { appareilId } = useParams();
    const navigate = useNavigate();
    const [appareil, setAppareil] = useState(null);
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [montant, setMontant] = useState('');
    const [type, setType] = useState('total');
    const [methode, setMethode] = useState('especes');
    const [reference, setReference] = useState('');
    const [factureId, setFactureId] = useState('');
    const [paiements, setPaiements] = useState([]);
    const [config, setConfig] = useState({});
    useEffect(() => {
        if (!appareilId)
            return;
        (async () => {
            try {
                const [a, f, p, c] = await Promise.all([
                    supabase.from('appareils').select('*, clients(nom)').eq('id', appareilId).single(),
                    supabase.from('factures').select('*').order('cree_le', { ascending: false }),
                    supabase.from('paiements').select('*').eq('appareil_id', appareilId).order('cree_le', { ascending: false }),
                    supabase.from('parametres').select('cle, valeur').then(({ data }) => {
                        const cfg = {};
                        if (data)
                            for (const r of data)
                                cfg[r.cle] = r.valeur;
                        return cfg;
                    }),
                ]);
                if (a.data)
                    setAppareil({ ...a.data, client_nom: a.data.clients?.nom });
                setFactures((f.data || []).filter((fact) => fact.appareil_id === appareilId));
                setPaiements(p.data || []);
                setConfig(c);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [appareilId]);
    const handlePaiement = async () => {
        if (!appareilId || !montant || !appareil) {
            setError('Montant requis');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const { error: paiementError } = await supabase.from('paiements').insert({
                type,
                mode: methode,
                montant: parseFloat(montant),
                reference: reference || null,
                client_id: appareil.client_id,
                appareil_id: appareilId,
                facture_id: factureId || null,
                date_paiement: new Date().toISOString(),
            });
            if (paiementError)
                throw paiementError;
            setSuccess('Paiement enregistré');
            setMontant('');
            setReference('');
            const { data: newPaiements } = await supabase.from('paiements').select('*').eq('appareil_id', appareilId).order('cree_le', { ascending: false });
            setPaiements(newPaiements || []);
            const { data: newFactures } = await supabase.from('factures').select('*').order('cree_le', { ascending: false });
            setFactures((newFactures || []).filter((fact) => fact.appareil_id === appareilId));
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
    return (_jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsxs(Button, { onClick: () => navigate(`/electronique/appareils/${appareilId}`), className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700", children: [_jsx(ArrowLeft, { size: 16 }), " Retour"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center", children: _jsx(DollarSign, { size: 20, className: "text-emerald-500" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "Paiement" }), _jsxs("p", { className: "text-sm text-gray-500", children: [appareil.client_nom, " \u2014 ", appareil.marque, " ", appareil.modele] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Montant (FG)" }), _jsx("input", { className: "input", type: "number", value: montant, onChange: e => setMontant(e.target.value), min: "0", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Type" }), _jsxs("select", { className: "input", value: type, onChange: e => setType(e.target.value), children: [_jsx("option", { value: "total", children: "Total" }), _jsx("option", { value: "partiel", children: "Partiel" }), _jsx("option", { value: "acompte", children: "Acompte" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "M\u00E9thode" }), _jsxs("select", { className: "input", value: methode, onChange: e => setMethode(e.target.value), children: [_jsx("option", { value: "especes", children: "Esp\u00E8ces" }), _jsx("option", { value: "carte", children: "Carte bancaire" }), _jsx("option", { value: "virement", children: "Virement" }), _jsx("option", { value: "mobile_money", children: "Mobile Money" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Facture (optionnel)" }), _jsxs("select", { className: "input", value: factureId, onChange: e => setFactureId(e.target.value), children: [_jsx("option", { value: "", children: "Sans facture" }), factures.map((f) => (_jsxs("option", { value: f.id, children: [f.numero, " \u2014 ", (f.total_ttc - (f.total_paye || 0)).toLocaleString(), " FG restant"] }, f.id)))] })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "label", children: "R\u00E9f\u00E9rence (optionnel)" }), _jsx("input", { className: "input", value: reference, onChange: e => setReference(e.target.value), placeholder: "N\u00B0 ch\u00E8que, transaction..." })] })] }), error && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 14 }), " ", error] }), success && _jsxs("p", { className: "text-sm text-green-500 flex items-center gap-1", children: [_jsx(CheckCircle, { size: 14 }), " ", success] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: handlePaiement, disabled: saving, children: [_jsx(DollarSign, { size: 16 }), " Enregistrer le paiement"] }), _jsx(Button, { variant: "ghost", onClick: () => navigate(`/electronique/appareils/${appareilId}`), children: "Annuler" })] })] }), paiements.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Historique des paiements" }), _jsx("div", { className: "space-y-2", children: paiements.map((p) => (_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: new Date(p.created_at).toLocaleDateString('fr-FR') }), _jsx("span", { className: "ml-2 text-gray-500 capitalize", children: p.type }), _jsx("span", { className: "ml-2 text-gray-500", children: p.methode }), p.facture_numero && _jsxs("span", { className: "ml-2 text-gray-400", children: ["(", p.facture_numero, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-emerald-600", children: [p.montant.toLocaleString(), " FG"] }), _jsx("button", { type: "button", onClick: () => {
                                                import('../../pdf/generateElectroniquePdf').then(async (mod) => {
                                                    const blob = await mod.generateRecuPdf(p, config);
                                                    window.open(URL.createObjectURL(blob));
                                                });
                                            }, className: "text-gray-400 hover:text-gray-600", children: _jsx(Download, { size: 14 }) })] })] }, p.id))) })] }))] }));
}
