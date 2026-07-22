import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
export function Modal({ open, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (open)
            document.body.style.overflow = 'hidden';
        else
            document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape')
            onClose(); };
        if (open)
            window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, onClose]);
    if (!open)
        return null;
    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in", children: [_jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: `relative w-full ${sizes[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-scale-in`, children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50", children: [_jsx("h2", { className: "text-lg font-semibold", children: title }), _jsx("button", { type: "button", onClick: onClose, className: "btn-ghost p-1.5 rounded-xl", children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "overflow-y-auto p-6", children: children })] })] }));
}
