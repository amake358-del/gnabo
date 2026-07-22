import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Database, ExternalLink } from 'lucide-react';
export function BackupsPage() {
    return (_jsxs("div", { className: "max-w-lg mx-auto space-y-6", children: [_jsxs("div", { className: "text-center pt-12", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4", children: _jsx(Database, { size: 28, className: "text-primary-500" }) }), _jsx("h1", { className: "text-2xl font-bold", children: "Sauvegardes" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-2", children: "Les sauvegardes sont g\u00E9r\u00E9es automatiquement par Supabase." })] }), _jsxs(Card, { className: "p-6 space-y-4", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Votre base de donn\u00E9es PostgreSQL est automatiquement sauvegard\u00E9e chaque jour par Supabase. Les sauvegardes sont conserv\u00E9es pendant 7 jours (plan gratuit) ou plus selon votre abonnement." }), _jsxs(Button, { onClick: () => window.open('https://supabase.com/dashboard/project/nurtpoplxxpvxifwoynm/database/backups', '_blank'), children: [_jsx(ExternalLink, { size: 16 }), " Voir les sauvegardes Supabase"] })] })] }));
}
