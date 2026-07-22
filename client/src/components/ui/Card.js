import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, className = '', padding = true, hover }) {
    return (_jsx("div", { className: `bg-white dark:bg-gray-800 rounded-xl border border-surface-200 dark:border-gray-700 shadow-warm ${padding ? 'p-4 sm:p-4 lg:p-6' : ''} ${hover ? 'hover:shadow-warm-md hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`, children: children }));
}
