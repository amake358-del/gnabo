import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
export function OfflineBanner() {
    const [offline, setOffline] = useState(!navigator.onLine);
    useEffect(() => {
        const onOffline = () => setOffline(true);
        const onOnline = () => setOffline(false);
        window.addEventListener('offline', onOffline);
        window.addEventListener('online', onOnline);
        return () => {
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('online', onOnline);
        };
    }, []);
    if (!offline)
        return null;
    return (_jsxs("div", { className: "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 text-white text-xs font-medium py-1.5 px-4 shadow-lg", children: [_jsx(WifiOff, { size: 14 }), _jsx("span", { children: "Vous \u00EAtes hors ligne \u2014 les donn\u00E9es d\u00E9j\u00E0 charg\u00E9es restent accessibles" })] }));
}
