import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useEntrepriseStore } from '../../stores/entrepriseStore';
import { LayoutDashboard, Users, FileText, Package, Tags, Settings, Shield, Clock, Database, X, Sun, Moon, Smartphone, ClipboardList, QrCode, Printer, Boxes, ClipboardCheck, Wallet, } from 'lucide-react';
const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', section: 'main' },
    { to: '/devis', icon: FileText, label: 'Devis', section: 'management' },
    { to: '/clients', icon: Users, label: 'Clients', section: 'management' },
    { to: '/catalogue', icon: Package, label: 'Catalogue', section: 'management' },
    { to: '/modeles', icon: Tags, label: 'Modèles', section: 'management' },
    { to: '/electronique/appareils', icon: Smartphone, label: 'Appareils', section: 'management' },
    { to: '/electronique/reception', icon: ClipboardList, label: 'Réception', section: 'management' },
    { to: '/electronique/qr-codes', icon: QrCode, label: 'QR Codes', section: 'management' },
    { to: '/electronique/etiquettes', icon: Printer, label: 'Étiquettes', section: 'management' },
    { to: '/stocks', icon: Boxes, label: 'Stock', section: 'management' },
    { to: '/interventions', icon: ClipboardCheck, label: 'Interventions', section: 'management' },
    { to: '/caisse', icon: Wallet, label: 'Caisse', section: 'management' },
    { to: '/parametres', icon: Settings, label: 'Paramètres', section: 'admin' },
    { to: '/utilisateurs', icon: Shield, label: 'Utilisateurs', section: 'admin' },
    { to: '/historique', icon: Clock, label: 'Historique', section: 'admin' },
    { to: '/sauvegardes', icon: Database, label: 'Sauvegardes', section: 'admin' },
];
const sectionLabels = {
    main: '',
    management: 'Gestion',
    admin: 'Administration',
};
export function Sidebar() {
    const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode } = useAppStore();
    const { companyName, current } = useEntrepriseStore();
    return (_jsxs(_Fragment, { children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in", onClick: () => setSidebarOpen(false) })), _jsxs("aside", { className: `fixed top-0 left-0 z-50 h-full w-64 bg-[#0F1A2E] dark:bg-gray-900 flex flex-col transform transition-all duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`, children: [_jsxs("div", { className: "flex items-center justify-between px-5 h-16 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shadow-inner shrink-0 overflow-hidden ring-2 ring-white/20", children: current?.logo_url ? (_jsx("img", { src: current.logo_url, alt: "", className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-white font-bold text-sm", children: companyName?.charAt(0) || 'E' })) }), _jsxs("div", { className: "min-w-0", children: [_jsx("span", { className: "text-white font-bold text-sm tracking-tight block leading-tight truncate", children: companyName || 'Entreprise' }), current?.slogan && _jsx("span", { className: "text-[11px] font-medium text-white/60 truncate block", children: current.slogan })] })] }), _jsx("button", { type: "button", className: "lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors", onClick: () => setSidebarOpen(false), children: _jsx(X, { size: 18 }) })] }), _jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-1", children: ['main', 'management', 'admin'].map(sectionKey => {
                            const items = navItems.filter(n => n.section === sectionKey);
                            if (!items.length)
                                return null;
                            const label = sectionLabels[sectionKey];
                            return (_jsxs("div", { className: "space-y-0.5", children: [label && (_jsx("p", { className: "px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40", children: label })), items.map(item => (_jsx(NavLink, { to: item.to, end: item.to === '/', onClick: () => setSidebarOpen(false), className: ({ isActive }) => `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                                            ? 'bg-white/15 text-white shadow-sm'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'}`, children: ({ isActive }) => (_jsxs(_Fragment, { children: [isActive && (_jsx("span", { className: "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-400 rounded-full shadow-sm shadow-accent-500/30" })), _jsx(item.icon, { size: 18, className: `shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}` }), _jsx("span", { children: item.label })] })) }, item.to)))] }, sectionKey));
                        }) }), _jsx("div", { className: "shrink-0 p-3 border-t border-white/10", children: _jsxs("button", { type: "button", onClick: toggleDarkMode, className: "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150", children: [darkMode ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }), _jsx("span", { children: darkMode ? 'Mode clair' : 'Mode sombre' })] }) })] })] }));
}
