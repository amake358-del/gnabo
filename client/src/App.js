import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import { DevisListPage } from './pages/DevisListPage';
import { DevisFormPage } from './pages/DevisFormPage';
import { CataloguePage } from './pages/CataloguePage';
import { ModelesPage } from './pages/ModelesPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { HistoryPage } from './pages/HistoryPage';
import { BackupsPage } from './pages/BackupsPage';
import { AppareilListPage } from './pages/electronique/AppareilListPage';
import { AppareilDetailPage } from './pages/electronique/AppareilDetailPage';
import { ReceptionPage } from './pages/electronique/ReceptionPage';
import { DiagnosticPage } from './pages/electronique/DiagnosticPage';
import { ReparationPage } from './pages/electronique/ReparationPage';
import { DevisElectroniquePage } from './pages/electronique/DevisElectroniquePage';
import { FactureElectroniquePage } from './pages/electronique/FactureElectroniquePage';
import { PaiementPage } from './pages/electronique/PaiementPage';
import { EtiquettesPage } from './pages/electronique/EtiquettesPage';
import { QrCodesPage } from './pages/electronique/QrCodesPage';
import { StocksPage } from './pages/StocksPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { CaissePage } from './pages/CaissePage';
import Layout from './components/Layout';
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { className: "loading-screen flex items-center justify-center h-screen text-lg text-gray-500", children: "Chargement..." });
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(Layout, { children: children });
}
export default function App() {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { className: "loading-screen flex items-center justify-center h-screen text-lg text-gray-500", children: "Chargement..." });
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/clients", element: _jsx(ProtectedRoute, { children: _jsx(ClientsPage, {}) }) }), _jsx(Route, { path: "/devis", element: _jsx(ProtectedRoute, { children: _jsx(DevisListPage, {}) }) }), _jsx(Route, { path: "/devis/nouveau", element: _jsx(ProtectedRoute, { children: _jsx(DevisFormPage, {}) }) }), _jsx(Route, { path: "/devis/:id", element: _jsx(ProtectedRoute, { children: _jsx(DevisFormPage, {}) }) }), _jsx(Route, { path: "/catalogue", element: _jsx(ProtectedRoute, { children: _jsx(CataloguePage, {}) }) }), _jsx(Route, { path: "/modeles", element: _jsx(ProtectedRoute, { children: _jsx(ModelesPage, {}) }) }), _jsx(Route, { path: "/parametres", element: _jsx(ProtectedRoute, { children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: "/utilisateurs", element: _jsx(ProtectedRoute, { children: _jsx(UsersPage, {}) }) }), _jsx(Route, { path: "/historique", element: _jsx(ProtectedRoute, { children: _jsx(HistoryPage, {}) }) }), _jsx(Route, { path: "/sauvegardes", element: _jsx(ProtectedRoute, { children: _jsx(BackupsPage, {}) }) }), _jsx(Route, { path: "/electronique/appareils", element: _jsx(ProtectedRoute, { children: _jsx(AppareilListPage, {}) }) }), _jsx(Route, { path: "/electronique/appareils/:id", element: _jsx(ProtectedRoute, { children: _jsx(AppareilDetailPage, {}) }) }), _jsx(Route, { path: "/electronique/reception", element: _jsx(ProtectedRoute, { children: _jsx(ReceptionPage, {}) }) }), _jsx(Route, { path: "/electronique/diagnostic/:id", element: _jsx(ProtectedRoute, { children: _jsx(DiagnosticPage, {}) }) }), _jsx(Route, { path: "/electronique/reparation/:appareilId", element: _jsx(ProtectedRoute, { children: _jsx(ReparationPage, {}) }) }), _jsx(Route, { path: "/electronique/devis/:appareilId", element: _jsx(ProtectedRoute, { children: _jsx(DevisElectroniquePage, {}) }) }), _jsx(Route, { path: "/electronique/factures/:appareilId", element: _jsx(ProtectedRoute, { children: _jsx(FactureElectroniquePage, {}) }) }), _jsx(Route, { path: "/electronique/paiements/:appareilId", element: _jsx(ProtectedRoute, { children: _jsx(PaiementPage, {}) }) }), _jsx(Route, { path: "/electronique/etiquettes", element: _jsx(ProtectedRoute, { children: _jsx(EtiquettesPage, {}) }) }), _jsx(Route, { path: "/electronique/qr-codes", element: _jsx(ProtectedRoute, { children: _jsx(QrCodesPage, {}) }) }), _jsx(Route, { path: "/stocks", element: _jsx(ProtectedRoute, { children: _jsx(StocksPage, {}) }) }), _jsx(Route, { path: "/stocks/:id", element: _jsx(ProtectedRoute, { children: _jsx(StockDetailPage, {}) }) }), _jsx(Route, { path: "/interventions", element: _jsx(ProtectedRoute, { children: _jsx(InterventionsPage, {}) }) }), _jsx(Route, { path: "/caisse", element: _jsx(ProtectedRoute, { children: _jsx(CaissePage, {}) }) })] }));
}
