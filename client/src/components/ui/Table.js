import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoadingSpinner } from './LoadingSpinner';
export function Table({ columns, data, loading, onRowClick, emptyMessage = 'Aucune donnée' }) {
    if (loading)
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx(LoadingSpinner, {}) });
    if (!data.length)
        return _jsx("div", { className: "text-center py-12 text-gray-400 text-sm", children: emptyMessage });
    return (_jsx("div", { className: "overflow-x-auto rounded-xl border border-surface-200 dark:border-gray-700", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsx("tr", { className: "bg-surface-50 dark:bg-gray-800/50", children: columns.map(col => (_jsx("th", { className: `px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${col.className || ''} ${col.hideLabel ? 'sr-only' : ''}`, children: col.label }, col.key))) }) }), _jsx("tbody", { className: "divide-y divide-surface-100 dark:divide-gray-700/50", children: data.map((item, i) => (_jsx("tr", { onClick: () => onRowClick?.(item), className: `transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''} ${i % 2 === 0 ? 'bg-white dark:bg-gray-800/20' : 'bg-surface-50/30 dark:bg-gray-800/10'} hover:bg-surface-50 dark:hover:bg-gray-700/30`, children: columns.map(col => (_jsx("td", { "data-label": col.hideLabel ? '' : col.label, className: `px-4 py-3 text-gray-700 dark:text-gray-300 ${col.className || ''}`, children: col.render ? col.render(item) : String(item[col.key] ?? '') }, col.key))) }, item.id || i))) })] }) }));
}
