import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LandPage from './pages/LandPage'
import CropPage from './pages/CropPage'
import MarketPage from './pages/MarketPage'
import InsurancePage from './pages/InsurancePage'
import SubsidyPage from './pages/SubsidyPage'
import IoTPage from './pages/IoTPage'
import CommunityPage from './pages/CommunityPage'
import KrushiAIPage from './pages/KrushiAIPage'
import MapPage from './pages/MapPage'
import SupplyChainPage from './pages/SupplyChainPage'
import QRPage from './pages/QRPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import CollectorDashboard from './pages/CollectorDashboard'
import FarmerDetail from './pages/collector/FarmerDetail'
import CollectorAnalytics from './pages/collector/CollectorAnalytics'
import PublicFarmerProfile from './pages/PublicFarmerProfile'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner spinner-lg"/></div>
  if (!user) return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={['collector','minister'].includes(user.role)?'/collector/dashboard':'/app/dashboard'} replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner spinner-lg"/></div>
  return (
    <Routes>
      <Route path="/" element={user?<Navigate to={['collector','minister'].includes(user.role)?'/collector/dashboard':'/app/dashboard'} replace/>:<LoginPage/>}/>
      <Route path="/farmer/:krushiId" element={<PublicFarmerProfile />} />
      <Route path="/app/dashboard" element={<ProtectedRoute roles={['shetkari']}><DashboardPage/></ProtectedRoute>}/>
      <Route path="/app/lands" element={<ProtectedRoute roles={['shetkari']}><LandPage/></ProtectedRoute>}/>
      <Route path="/app/crops" element={<ProtectedRoute roles={['shetkari']}><CropPage/></ProtectedRoute>}/>
      <Route path="/app/market" element={<ProtectedRoute><MarketPage/></ProtectedRoute>}/>
      <Route path="/app/supply-chain" element={<ProtectedRoute roles={['shetkari']}><SupplyChainPage/></ProtectedRoute>}/>
      <Route path="/app/insurance" element={<ProtectedRoute roles={['shetkari']}><InsurancePage/></ProtectedRoute>}/>
      <Route path="/app/ai-predictor" element={<ProtectedRoute roles={['shetkari']}><KrushiAIPage/></ProtectedRoute>}/>
      <Route path="/app/iot" element={<ProtectedRoute roles={['shetkari']}><IoTPage/></ProtectedRoute>}/>
      <Route path="/app/community" element={<ProtectedRoute><CommunityPage/></ProtectedRoute>}/>
      <Route path="/app/map" element={<ProtectedRoute roles={['shetkari']}><MapPage/></ProtectedRoute>}/>
      <Route path="/app/qr" element={<ProtectedRoute roles={['shetkari']}><QRPage/></ProtectedRoute>}/>
      <Route path="/app/analytics" element={<ProtectedRoute roles={['shetkari']}><AnalyticsPage/></ProtectedRoute>}/>
      <Route path="/app/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
      <Route path="/collector/dashboard" element={<ProtectedRoute roles={['collector','minister']}><CollectorDashboard/></ProtectedRoute>}/>
      <Route path="/collector/farmers" element={<ProtectedRoute roles={['collector','minister']}><CollectorDashboard/></ProtectedRoute>}/>
      <Route path="/collector/claims" element={<ProtectedRoute roles={['collector','minister']}><CollectorDashboard/></ProtectedRoute>}/>
      <Route path="/collector/subsidies" element={<ProtectedRoute roles={['collector','minister']}><CollectorDashboard/></ProtectedRoute>}/>
      <Route path="/collector/analytics" element={<ProtectedRoute roles={['collector','minister']}><CollectorAnalytics/></ProtectedRoute>}/>
      <Route path="/collector/farmer/:id" element={<ProtectedRoute roles={['collector','minister']}><FarmerDetail/></ProtectedRoute>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
        <Toaster position="top-right" toastOptions={{duration:3500,style:{fontFamily:'inherit',fontSize:14}}}/>
      </BrowserRouter>
    </AuthProvider>
  )
}
