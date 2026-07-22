import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DevisLineCard } from '../../components/devis/DevisLineCard';
import { Plus, FileText } from 'lucide-react';
import { useDevisForm } from './DevisFormLayout';
export function DevisLignesStep() {
    const { lines, addLine, updateLine, removeLine } = useDevisForm();
    return (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Lignes du devis" }), _jsxs(Button, { size: "sm", onClick: addLine, children: [_jsx(Plus, { size: 14 }), " Ajouter"] })] }), lines.length === 0 ? (_jsxs("div", { className: "text-center py-12 text-gray-500", children: [_jsx(FileText, { size: 48, className: "mx-auto mb-3 opacity-50" }), _jsx("p", { children: "Aucune ligne. Cliquez sur \"Ajouter\" pour commencer." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden", children: lines.map((line, i) => (_jsx(DevisLineCard, { line: line, index: i, onUpdate: updateLine, onRemove: removeLine }, i))) }), _jsx("div", { className: "hidden lg:flex lg:flex-col lg:gap-3", children: lines.map((line, i) => (_jsx(DevisLineCard, { line: line, index: i, onUpdate: updateLine, onRemove: removeLine }, i))) })] }))] }));
}
