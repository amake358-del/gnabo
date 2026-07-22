import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '../../components/ui/Card';
import { useDevisForm } from './DevisFormLayout';
export function DevisModeleStep() {
    const { modelesList, setValue, getValues, goToStep } = useDevisForm();
    const typeId = getValues().type_id;
    return (_jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Choisir le mod\u00E8le" }), !typeId ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Veuillez d'abord s\u00E9lectionner un type." })) : (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [modelesList.filter(m => m.type_id === typeId && m.status === 'actif').map(m => (_jsxs("button", { type: "button", onClick: () => { setValue('modele_id', m.id); goToStep(2); }, className: `p-4 rounded-xl border-2 text-center transition-all ${getValues().modele_id === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`, children: [_jsx("p", { className: "font-medium", children: m.name }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [m.prix.toFixed(2), " FG/m\u00B2"] }), m.description && _jsx("p", { className: "text-xs text-gray-400 mt-1", children: m.description })] }, m.id))), modelesList.filter(m => m.type_id === typeId && m.status === 'actif').length === 0 && (_jsx("p", { className: "text-gray-500 col-span-full text-center py-4", children: "Aucun mod\u00E8le actif pour ce type." }))] }))] }));
}
