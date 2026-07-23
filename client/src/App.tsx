import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import { DevisListPage } from './pages/DevisListPage'
import { DevisFormPage } from './pages/DevisFormPage'
import { CataloguePage } from './pages/CataloguePage'
import { ModelesPage } from './pages/ModelesPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsersPage } from './pages/UsersPage'
import { HistoryPage } from './pages/HistoryPage'
import { BackupsPage } from './pages/BackupsPage'
import { AppareilListPage } from './pages/electronique/AppareilListPage'
import { AppareilDetailPage } from './pages/electronique/AppareilDetailPage'
import { ReceptionPage } from './pages/electronique/ReceptionPage'
import { DiagnosticPage } from './pages/electronique/DiagnosticPage'
import { ReparationPage } from './pages/electronique/ReparationPage'
import { DevisElectroniquePage } from './pages/electronique/DevisElectroniquePage'
import { FactureElectroniquePage } from './pages/electronique/FactureElectroniquePage'
import { ControleTechniquePage } from './pages/electronique/ControleTechniquePage'
import { PaiementPage } from './pages/electronique/PaiementPage'
import { EtiquettesPage } from './pages/electronique/EtiquettesPage'
import { QrCodesPage } from './pages/electronique/QrCodesPage'
import { StocksPage } from './pages/StocksPage'
import { StockDetailPage } from './pages/StockDetailPage'
import { InterventionsPage } from './pages/InterventionsPage'
import { CaissePage } from './pages/CaissePage'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen flex items-center justify-center h-screen text-lg text-gray-500">Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen flex items-center justify-center h-screen text-lg text-gray-500">Chargement...</div>
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
      <Route path="/devis" element={<ProtectedRoute><DevisListPage /></ProtectedRoute>} />
      <Route path="/devis/nouveau" element={<ProtectedRoute><DevisFormPage /></ProtectedRoute>} />
      <Route path="/devis/:id" element={<ProtectedRoute><DevisFormPage /></ProtectedRoute>} />
      <Route path="/catalogue" element={<ProtectedRoute><CataloguePage /></ProtectedRoute>} />
      <Route path="/modeles" element={<ProtectedRoute><ModelesPage /></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/utilisateurs" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/historique" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/sauvegardes" element={<ProtectedRoute><BackupsPage /></ProtectedRoute>} />
      <Route path="/electronique/appareils" element={<ProtectedRoute><AppareilListPage /></ProtectedRoute>} />
      <Route path="/electronique/appareils/:id" element={<ProtectedRoute><AppareilDetailPage /></ProtectedRoute>} />
      <Route path="/electronique/reception" element={<ProtectedRoute><ReceptionPage /></ProtectedRoute>} />
      <Route path="/electronique/diagnostic/:id" element={<ProtectedRoute><DiagnosticPage /></ProtectedRoute>} />
      <Route path="/electronique/controle/:appareilId" element={<ProtectedRoute><ControleTechniquePage /></ProtectedRoute>} />
      <Route path="/electronique/reparation/:appareilId" element={<ProtectedRoute><ReparationPage /></ProtectedRoute>} />
      <Route path="/electronique/devis/:appareilId" element={<ProtectedRoute><DevisElectroniquePage /></ProtectedRoute>} />
      <Route path="/electronique/factures/:appareilId" element={<ProtectedRoute><FactureElectroniquePage /></ProtectedRoute>} />
      <Route path="/electronique/paiements/:appareilId" element={<ProtectedRoute><PaiementPage /></ProtectedRoute>} />
      <Route path="/electronique/etiquettes" element={<ProtectedRoute><EtiquettesPage /></ProtectedRoute>} />
      <Route path="/electronique/qr-codes" element={<ProtectedRoute><QrCodesPage /></ProtectedRoute>} />
      <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
      <Route path="/stocks/:id" element={<ProtectedRoute><StockDetailPage /></ProtectedRoute>} />
      <Route path="/interventions" element={<ProtectedRoute><InterventionsPage /></ProtectedRoute>} />
      <Route path="/caisse" element={<ProtectedRoute><CaissePage /></ProtectedRoute>} />
    </Routes>
  )
}
