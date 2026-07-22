import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Select = React.forwardRef(({ label, error, options, placeholder, className = '', ...props }, ref) => (_jsxs("div", { className: "w-full", children: [label && _jsx("label", { className: "label", children: label }), _jsxs("select", { ref: ref, className: `input ${error ? 'border-red-500' : ''} ${className}`, ...props, children: [placeholder && _jsx("option", { value: "", children: placeholder }), options.map(o => _jsx("option", { value: o.value, children: o.label }, o.value))] }), error && _jsx("p", { className: "mt-1 text-xs text-red-500", children: error })] })));
Select.displayName = 'Select';
