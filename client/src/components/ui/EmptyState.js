import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ icon, title, description, action }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [icon && _jsx("div", { className: "text-gray-400 mb-4", children: icon }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-1", children: title }), description && _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm", children: description }), action] }));
}
