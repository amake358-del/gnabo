import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '../../components/ui/Card';
import { useDevisForm } from './DevisFormLayout';
export function DevisTypeStep() {
    const { types, setValue, getValues, goToStep } = useDevisForm();
    return (_jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Choisir le type de devis" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: types.map(t => (_jsx("button", { type: "button", onClick: () => { setValue('type_id', t.id); goToStep(1); }, className: `p-4 rounded-xl border-2 text-center transition-all ${getValues().type_id === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`, children: _jsx("p", { className: "font-medium", children: t.name }) }, t.id))) })] }));
}
