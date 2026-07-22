import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Camera, QrCode, Scan, AlertTriangle, FileText, X } from 'lucide-react';
export function ReceptionPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('scan');
    const [scanCode, setScanCode] = useState('');
    const [scanError, setScanError] = useState('');
    const [scanLoading, setScanLoading] = useState(false);
    const [appareilId, setAppareilId] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const scannerRef = useRef(null);
    const scannerId = 'qr-scanner';
    useEffect(() => {
        if (!showScanner)
            return;
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;
        scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }, (decodedText) => {
            setScanCode(decodedText.toUpperCase());
            setShowScanner(false);
            setTimeout(() => handleScanCode(decodedText.toUpperCase()), 100);
        }, () => { }).catch(err => setCameraError('Erreur accès caméra: ' + (err.message || err)));
        return () => { scanner.stop().catch(() => { }); scannerRef.current = null; };
    }, [showScanner]);
    const [form, setForm] = useState({
        qr_code: '', client_nom: '', client_telephone: '', client_adresse: '',
        type_appareil: '', marque: '', modele: '', numero_serie: '', etat_esthetique: '',
        accessoires: '', panne_declaree: '', observations: ''
    });
    const handleScanCode = async (code) => {
        if (!code.trim())
            return;
        setScanLoading(true);
        setScanError('');
        try {
            const { data: existing } = await supabase.from('appareils').select('id').eq('uid_visible', code.trim().toUpperCase()).maybeSingle();
            if (existing) {
                setAppareilId(existing.id);
                setStep('found');
                return;
            }
            setForm(prev => ({ ...prev, qr_code: code.trim().toUpperCase() }));
            setStep('form');
        }
        catch (err) {
            setScanError(err.message || 'Erreur de vérification');
        }
        finally {
            setScanLoading(false);
        }
    };
    const handleScan = () => {
        if (scanCode.trim())
            handleScanCode(scanCode);
    };
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async () => {
        if (!form.client_nom)
            return;
        try {
            const { data: newAppareil, error } = await supabase.from('appareils').insert({
                uid_interne: 'INT-' + Date.now(),
                uid_visible: form.qr_code,
                client_nom: form.client_nom,
                client_telephone: form.client_telephone || null,
                client_adresse: form.client_adresse || null,
                type: form.type_appareil,
                marque: form.marque,
                modele: form.modele,
                numero_serie: form.numero_serie,
                etat_esthetique: form.etat_esthetique,
                accessoires: form.accessoires,
                description_defaut: form.panne_declaree || form.observations,
                date_reception: new Date().toISOString(),
            }).select('id').single();
            if (error)
                throw error;
            navigate(`/electronique/appareils/${newAppareil.id}`);
        }
        catch (err) {
            setScanError(err.message || 'Erreur de création');
        }
    };
    if (step === 'found' && appareilId) {
        return (_jsxs("div", { className: "max-w-lg mx-auto space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx(QrCode, { size: 48, className: "mx-auto mb-3 text-primary-500" }), _jsx("h2", { className: "text-xl font-bold", children: "QR Code d\u00E9j\u00E0 attribu\u00E9" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Cet appareil est d\u00E9j\u00E0 enregistr\u00E9" })] }), _jsxs("div", { className: "flex gap-3 justify-center", children: [_jsxs(Button, { onClick: () => navigate(`/electronique/appareils/${appareilId}`), children: [_jsx(FileText, { size: 16 }), " Voir la fiche"] }), _jsxs(Button, { variant: "secondary", onClick: () => { setStep('scan'); setScanCode(''); setAppareilId(null); }, children: [_jsx(Scan, { size: 16 }), " Scanner un autre"] })] })] }));
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "R\u00E9ception d'appareil" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: "Enregistrez un nouvel appareil" })] }), step === 'scan' && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [_jsxs("div", { className: "text-center mb-2", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3", children: _jsx(Scan, { size: 28, className: "text-primary-500" }) }), _jsx("h2", { className: "font-semibold", children: "Scanner un QR Code" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Saisissez le code ou scannez l'\u00E9tiquette" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input flex-1 text-lg font-mono", placeholder: "EL-000001", value: scanCode, onChange: e => setScanCode(e.target.value.toUpperCase()), onKeyDown: e => e.key === 'Enter' && handleScan(), autoFocus: true }), _jsx(Button, { onClick: () => setShowScanner(true), disabled: scanLoading, children: _jsx(Camera, { size: 16 }) })] }), scanError && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 14 }), " ", scanError] }), showScanner && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50", children: [_jsx("h3", { className: "font-semibold", children: "Scannez le QR Code" }), _jsx(Button, { variant: "ghost", onClick: () => setShowScanner(false), className: "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { id: scannerId, className: "w-full aspect-square" }), cameraError && _jsx("p", { className: "text-sm text-red-500 p-4 text-center", children: cameraError })] }) }))] })), step === 'form' && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center", children: _jsx(QrCode, { size: 20, className: "text-primary-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "QR Code" }), _jsx("p", { className: "font-mono font-bold text-lg", children: form.qr_code })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Nom du client *", value: form.client_nom, onChange: e => handleFieldChange('client_nom', e.target.value), placeholder: "Nom complet" }), _jsx(Input, { label: "T\u00E9l\u00E9phone", value: form.client_telephone, onChange: e => handleFieldChange('client_telephone', e.target.value), placeholder: "+224 XXX XXX XXX" })] }), _jsx(Input, { label: "Adresse", value: form.client_adresse, onChange: e => handleFieldChange('client_adresse', e.target.value), placeholder: "Adresse compl\u00E8te" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Type d'appareil", value: form.type_appareil, onChange: e => handleFieldChange('type_appareil', e.target.value), placeholder: "Smartphone, PC, tablette..." }), _jsx(Select, { label: "\u00C9tat esth\u00E9tique", value: form.etat_esthetique || '', onChange: e => handleFieldChange('etat_esthetique', e.target.value), options: [
                                    { value: 'Neuf', label: 'Neuf' }, { value: 'Bon', label: 'Bon' },
                                    { value: 'Moyen', label: 'Moyen' }, { value: 'Mauvais', label: 'Mauvais' },
                                ], placeholder: "S\u00E9lectionner..." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Marque", value: form.marque, onChange: e => handleFieldChange('marque', e.target.value), placeholder: "Samsung, Sony..." }), _jsx(Input, { label: "Mod\u00E8le", value: form.modele, onChange: e => handleFieldChange('modele', e.target.value), placeholder: "Mod\u00E8le exact" })] }), _jsx(Input, { label: "Num\u00E9ro de s\u00E9rie", value: form.numero_serie, onChange: e => handleFieldChange('numero_serie', e.target.value), placeholder: "SN-..." }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Accessoires d\u00E9pos\u00E9s" }), _jsx("textarea", { className: "input min-h-[60px]", value: form.accessoires, onChange: e => handleFieldChange('accessoires', e.target.value), placeholder: "Chargeur, t\u00E9l\u00E9commande, c\u00E2ble..." })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Panne d\u00E9clar\u00E9e" }), _jsx("textarea", { className: "input min-h-[80px]", value: form.panne_declaree, onChange: e => handleFieldChange('panne_declaree', e.target.value), placeholder: "Description du probl\u00E8me par le client..." })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Observations" }), _jsx("textarea", { className: "input min-h-[60px]", value: form.observations, onChange: e => handleFieldChange('observations', e.target.value), placeholder: "Notes suppl\u00E9mentaires..." })] }), scanError && _jsxs("p", { className: "text-sm text-red-500 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 14 }), " ", scanError] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx(Button, { onClick: handleSubmit, disabled: !form.client_nom, children: "Enregistrer l'appareil" }), _jsx(Button, { variant: "ghost", onClick: () => { setStep('scan'); setScanCode(''); setScanError(''); }, children: "Annuler" })] })] }))] }));
}
