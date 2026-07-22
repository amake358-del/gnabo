import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Supprimer', loading }) {
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Confirmation", size: "sm", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4", children: _jsx(AlertTriangle, { className: "text-red-600", size: 24 }) }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: title }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-6", children: message }), _jsxs("div", { className: "flex gap-3 w-full", children: [_jsx(Button, { variant: "secondary", onClick: onClose, className: "flex-1", disabled: loading, children: "Annuler" }), _jsx(Button, { variant: "danger", onClick: onConfirm, className: "flex-1", loading: loading, children: confirmLabel })] })] }) }));
}
