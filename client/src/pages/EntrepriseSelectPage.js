import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntrepriseStore } from '../stores/entrepriseStore';
import { Loader2 } from 'lucide-react';
export function EntrepriseSelectPage() {
    const { setCurrent } = useEntrepriseStore();
    const navigate = useNavigate();
    useEffect(() => {
        import('../services/supabase').then(({ supabase }) => supabase.from('parametres').select('cle, valeur').then(({ data }) => {
            const cfg = {};
            if (data)
                for (const r of data)
                    cfg[r.cle] = r.valeur;
            setCurrent({
                id: 'main',
                company_name: cfg.entreprise_nom || 'GD',
                slug: cfg.entreprise_slug || '',
                logo_url: cfg.entreprise_logo || '',
                primary_color: cfg.couleur_primaire || '#2563EB',
            });
            navigate('/');
        })).catch(console.error).finally(() => undefined);
    }, []);
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary-500" }) }));
}
