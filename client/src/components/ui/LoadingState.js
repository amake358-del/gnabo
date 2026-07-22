import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoadingSpinner } from './LoadingSpinner';
export function LoadingState({ message = 'Chargement...', fullScreen }) {
    const content = (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3", children: [_jsx(LoadingSpinner, { size: 32 }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: message })] }));
    if (fullScreen) {
        return _jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface-50 dark:bg-gray-950", children: content });
    }
    return _jsx("div", { className: "flex justify-center py-16", children: content });
}
