import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { useEntrepriseStore } from '../stores/entrepriseStore';
import { toast } from '../utils/notify';
import { Upload, Save, Building2, Palette, DollarSign, Image, FileText, Stamp, Pen, MapPin } from 'lucide-react';
const defaultConfig = {
    company_name: '', slogan: '', description: '',
    rccm: '', nif: '', address: '', city: '', country: '',
    phone: '', phone2: '', email: '', website: '',
    logo_url: '', favicon_url: '', signature_url: '', cachet_url: '',
    signatory_name: '', signatory_title: '',
    default_tva: 0, currency: 'GNF', date_format: 'DD/MM/YYYY',
    primary_color: '#1e3a5f', secondary_color: '#2563eb',
    conditions: '', footer_text: '',
};
const paramMap = {
    entreprise_nom: 'company_name',
    slogan: 'slogan',
    description: 'description',
    rccm: 'rccm',
    nif: 'nif',
    adresse: 'address',
    ville: 'city',
    pays: 'country',
    telephone: 'phone',
    telephone2: 'phone2',
    email: 'email',
    site_web: 'website',
    logo_url: 'logo_url',
    favicon_url: 'favicon_url',
    signature_url: 'signature_url',
    cachet_url: 'cachet_url',
    signataire_nom: 'signatory_name',
    signataire_titre: 'signatory_title',
    devise: 'currency',
    date_format: 'date_format',
    primary_color: 'primary_color',
    secondary_color: 'secondary_color',
    conditions_devis: 'conditions',
    pied_page: 'footer_text',
    default_tva: 'default_tva',
};
const reverseMap = {};
for (const [k, v] of Object.entries(paramMap))
    reverseMap[v] = k;
async function loadConfig() {
    const { data: rows } = await supabase.from('parametres').select('cle, valeur');
    const config = { ...defaultConfig };
    if (rows) {
        for (const row of rows) {
            const key = paramMap[row.cle];
            if (key) {
                config[key] = key === 'default_tva' ? (parseFloat(row.valeur) || 0) : row.valeur;
            }
        }
    }
    return config;
}
async function saveConfig(config) {
    const payload = Object.entries(config)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([key, value]) => ({
        cle: reverseMap[key] || key,
        valeur: String(value),
    }));
    const { error } = await supabase.from('parametres').upsert(payload, { onConflict: 'cle' });
    if (error)
        throw error;
}
async function uploadFile(file, field) {
    const ext = file.name.split('.').pop() || 'png';
    const path = `${field}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error)
        throw new Error(`Upload échoué: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
    return publicUrl;
}
export function SettingsPage() {
    const [config, setConfig] = useState(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);
    const signatureRef = useRef(null);
    const cachetRef = useRef(null);
    const { load: reloadStore } = useEntrepriseStore();
    useEffect(() => {
        loadConfig()
            .then(setConfig)
            .catch(() => toast('Erreur chargement paramètres', 'error'))
            .finally(() => setLoading(false));
    }, []);
    const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
    const handleSave = async () => {
        setSaving(true);
        try {
            await saveConfig(config);
            await reloadStore();
            toast('Paramètres enregistrés', 'success');
        }
        catch (err) {
            toast(err.message || 'Erreur', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const handleImageUpload = async (field, file) => {
        try {
            const maxSize = 2 * 1024 * 1024;
            if (file.size > maxSize) {
                toast('Image trop volumineuse. Maximum 2 Mo.', 'error');
                return;
            }
            const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
            if (!allowed.includes(file.type)) {
                toast('Format non supporté. Utilisez PNG, JPG, WebP ou GIF.', 'error');
                return;
            }
            const url = await uploadFile(file, field);
            update(field, url);
            toast('Image téléchargée', 'success');
        }
        catch (err) {
            toast(err.message || "Erreur téléchargement. Vérifiez que le bucket 'logos' existe dans Supabase.", 'error');
        }
    };
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(LoadingSpinner, { size: 40 }) });
    const grid = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    return (_jsxs("div", { className: "space-y-8 max-w-4xl pb-12", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Configuration de l'entreprise" }), _jsxs(Button, { onClick: handleSave, loading: saving, children: [_jsx(Save, { size: 16 }), " Enregistrer"] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Building2, { size: 16 }), " Identit\u00E9"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Nom de l'entreprise", value: config.company_name, onChange: e => update('company_name', e.target.value) }), _jsx(Input, { label: "Slogan", value: config.slogan, onChange: e => update('slogan', e.target.value) }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "input min-h-[60px] resize-none", value: config.description, onChange: e => update('description', e.target.value) })] })] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(MapPin, { size: 16 }), " Coordonn\u00E9es"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Adresse", value: config.address, onChange: e => update('address', e.target.value) }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "Ville", value: config.city, onChange: e => update('city', e.target.value) }), _jsx(Input, { label: "Pays", value: config.country, onChange: e => update('country', e.target.value) })] }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "T\u00E9l\u00E9phone 1", value: config.phone, onChange: e => update('phone', e.target.value) }), _jsx(Input, { label: "T\u00E9l\u00E9phone 2", value: config.phone2, onChange: e => update('phone2', e.target.value) })] }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "Email", type: "email", value: config.email, onChange: e => update('email', e.target.value) }), _jsx(Input, { label: "Site web", value: config.website, onChange: e => update('website', e.target.value) })] })] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(FileText, { size: 16 }), " Registres"] }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "RCCM", value: config.rccm, onChange: e => update('rccm', e.target.value) }), _jsx(Input, { label: "NIF", value: config.nif, onChange: e => update('nif', e.target.value) })] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Image, { size: 16 }), " Images"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [config.logo_url ? _jsx("img", { src: config.logo_url, alt: "Logo", className: "w-28 h-28 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-white" }) : _jsx("div", { className: "w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400", children: _jsx(Building2, { size: 32 }) }), _jsxs("div", { children: [_jsx("input", { ref: fileRef, type: "file", accept: "image/*", onChange: e => { const f = e.target.files?.[0]; if (f)
                                                    handleImageUpload('logo_url', f); }, className: "hidden" }), _jsxs(Button, { variant: "secondary", onClick: () => fileRef.current?.click(), children: [_jsx(Upload, { size: 16 }), " Logo officiel"] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "PNG ou JPG, max 2 Mo. Utilis\u00E9 dans toute l'application." })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [config.signature_url ? _jsx("img", { src: config.signature_url, alt: "Signature", className: "h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white" }) : _jsx("div", { className: "w-32 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400", children: _jsx(Pen, { size: 24 }) }), _jsxs("div", { children: [_jsx("input", { ref: signatureRef, type: "file", accept: "image/*", onChange: e => { const f = e.target.files?.[0]; if (f)
                                                    handleImageUpload('signature_url', f); }, className: "hidden" }), _jsxs(Button, { variant: "secondary", onClick: () => signatureRef.current?.click(), children: [_jsx(Pen, { size: 16 }), " Signature du responsable"] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "PNG fond transparent. Appara\u00EEt sur les documents PDF." })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [config.cachet_url ? _jsx("img", { src: config.cachet_url, alt: "Cachet", className: "h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white" }) : _jsx("div", { className: "w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400", children: _jsx(Stamp, { size: 24 }) }), _jsxs("div", { children: [_jsx("input", { ref: cachetRef, type: "file", accept: "image/*", onChange: e => { const f = e.target.files?.[0]; if (f)
                                                    handleImageUpload('cachet_url', f); }, className: "hidden" }), _jsxs(Button, { variant: "secondary", onClick: () => cachetRef.current?.click(), children: [_jsx(Stamp, { size: 16 }), " Cachet de l'entreprise"] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Cachet rond ou rectangulaire. Appara\u00EEt sur les documents PDF." })] })] })] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Pen, { size: 16 }), " Signataire"] }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "Nom du signataire", value: config.signatory_name, onChange: e => update('signatory_name', e.target.value) }), _jsx(Input, { label: "Fonction du signataire", value: config.signatory_title, onChange: e => update('signatory_title', e.target.value) })] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(DollarSign, { size: 16 }), " Facturation"] }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "TVA par d\u00E9faut (%)", type: "number", step: "0.1", value: String(config.default_tva), onChange: e => update('default_tva', parseFloat(e.target.value) || 0) }), _jsx(Input, { label: "Devise", value: config.currency, onChange: e => update('currency', e.target.value), placeholder: "GNF" })] })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Palette, { size: 16 }), " Apparence"] }), _jsxs("div", { className: grid, children: [_jsx(Input, { label: "Couleur principale", type: "color", value: config.primary_color, onChange: e => update('primary_color', e.target.value) }), _jsx(Input, { label: "Couleur secondaire", type: "color", value: config.secondary_color, onChange: e => update('secondary_color', e.target.value) })] }), _jsx("div", { className: "mt-4", children: _jsx(Input, { label: "Format des dates", value: config.date_format, onChange: e => update('date_format', e.target.value), placeholder: "DD/MM/YYYY" }) })] }), _jsxs(Card, { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(FileText, { size: 16 }), " Documents"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Pied de page" }), _jsx("textarea", { className: "input min-h-[60px] resize-y", value: config.footer_text, onChange: e => update('footer_text', e.target.value), placeholder: "Texte affich\u00E9 dans le pied de page des PDF..." })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Conditions g\u00E9n\u00E9rales" }), _jsx("textarea", { className: "input min-h-[200px] resize-y", value: config.conditions, onChange: e => update('conditions', e.target.value), placeholder: "Conditions g\u00E9n\u00E9rales de vente..." })] })] })] })] }));
}
