import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { QrCode, Search, Download, Printer } from 'lucide-react';
export function QrCodesPage() {
    const navigate = useNavigate();
    const [appareils, setAppareils] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [qrData, setQrData] = useState({});
    const fetchAppareils = async () => {
        setLoading(true);
        try {
            let query = supabase.from('appareils').select('id, uid_visible, marque, modele, cree_le');
            if (search) {
                query = query.or(`uid_visible.ilike.%${search}%,marque.ilike.%${search}%,modele.ilike.%${search}%`);
            }
            const { data, error } = await query.order('cree_le', { ascending: false });
            if (error)
                throw error;
            setAppareils(data || []);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchAppareils(); }, []);
    const handleGenerate = async (id) => {
        if (qrData[id]) {
            setQrData(prev => { const n = { ...prev }; delete n[id]; return n; });
            return;
        }
        const app = appareils.find(a => a.id === id);
        if (!app)
            return;
        const qr_data_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(app.uid_visible)}`;
        setQrData(prev => ({ ...prev, [id]: qr_data_url }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "QR Codes" }), _jsx("p", { className: "text-gray-500 mt-1", children: "G\u00E9n\u00E9rez et imprimez les QR Codes des appareils" })] }), _jsxs(Button, { variant: "secondary", onClick: () => navigate('/electronique/etiquettes'), children: [_jsx(Download, { size: 16 }), " \u00C9tiquettes"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex-1", children: _jsx(Input, { placeholder: "Rechercher un appareil...", value: search, onChange: e => setSearch(e.target.value) }) }), _jsx(Button, { variant: "secondary", onClick: fetchAppareils, children: _jsx(Search, { size: 16 }) })] }), _jsx("div", { className: "bg-white rounded-2xl border border-gray-100 overflow-hidden", children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) })) : appareils.length === 0 ? (_jsxs("div", { className: "text-center py-12 text-gray-400", children: [_jsx(QrCode, { size: 48, className: "mx-auto mb-3 opacity-50" }), _jsx("p", { children: "Aucun appareil trouv\u00E9" })] })) : (_jsx("div", { className: "divide-y divide-gray-100", children: appareils.map(app => (_jsxs("div", { className: "px-4 py-3 hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono font-medium", children: app.uid_visible }), _jsxs("p", { className: "text-sm text-gray-500", children: [app.marque, " ", app.modele] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleGenerate(app.id), children: [_jsx(QrCode, { size: 16 }), " ", qrData[app.id] ? 'Masquer' : 'QR Code'] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(app.uid_visible)}`, '_blank'), children: _jsx(Printer, { size: 16 }) })] })] }), qrData[app.id] && (_jsx("div", { className: "flex justify-center py-2", children: _jsx("img", { src: qrData[app.id], alt: `QR ${app.uid_interne}`, className: "w-32 h-32" }) }))] }, app.id))) })) })] }));
}
