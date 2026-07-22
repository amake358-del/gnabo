import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
export function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1)
        return null;
    return (_jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("span", { className: "text-sm text-gray-500", children: ["Page ", page, " sur ", totalPages] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "secondary", size: "sm", onClick: () => onPageChange(page - 1), disabled: page <= 1, children: [_jsx(ChevronLeft, { size: 16 }), " Pr\u00E9c\u00E9dent"] }), _jsxs(Button, { variant: "secondary", size: "sm", onClick: () => onPageChange(page + 1), disabled: page >= totalPages, children: ["Suivant ", _jsx(ChevronRight, { size: 16 })] })] })] }));
}
