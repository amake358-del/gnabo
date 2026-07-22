import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Download } from 'lucide-react';
import { formatCurrency, formatDecimal } from '../../utils/format';
import { useDevisForm } from './DevisFormLayout';
export function DevisApercuStep() {
    const { lines, pdfBlob, generatingPdf, handleGeneratePdf } = useDevisForm();
    return (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Aper\u00E7u du devis" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "secondary", size: "sm", onClick: handleGeneratePdf, loading: generatingPdf, children: [_jsx(FileText, { size: 14 }), " G\u00E9n\u00E9rer le PDF"] }), pdfBlob && (_jsxs(Button, { size: "sm", onClick: () => {
                                    const url = URL.createObjectURL(pdfBlob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `devis-${Date.now()}.pdf`;
                                    a.click();
                                }, children: [_jsx(Download, { size: 14 }), " T\u00E9l\u00E9charger"] }))] })] }), lines.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [_jsx("th", { className: "px-3 py-2 text-left", children: "D\u00E9signation" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Qt\u00E9" }), _jsx("th", { className: "px-3 py-2 text-right", children: "L (mm)" }), _jsx("th", { className: "px-3 py-2 text-right", children: "H (mm)" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Surface" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Prix m\u00B2" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Total" })] }) }), _jsx("tbody", { children: lines.map((l, i) => (_jsxs("tr", { className: "border-b border-gray-100 dark:border-gray-800", children: [_jsx("td", { className: "px-3 py-2", children: l.designation }), _jsx("td", { className: "px-3 py-2 text-right", children: l.quantite }), _jsx("td", { className: "px-3 py-2 text-right", children: l.largeur }), _jsx("td", { className: "px-3 py-2 text-right", children: l.hauteur }), _jsxs("td", { className: "px-3 py-2 text-right", children: [formatDecimal(l.surface, 6), " m\u00B2"] }), _jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(l.prix_m2) }), _jsx("td", { className: "px-3 py-2 text-right font-medium", children: formatCurrency(l.total) })] }, i))) })] }) })) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Aucune ligne" }))] }));
}
