import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/scrollbar.css'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { ThemeProvider } from './components/custom/ThemeProvider'
import { Layout } from './layouts/Layout'
import About from './pages/About'
import Settings from './pages/Settings'
import { UserPermissionsProvider, useUserPermissions } from './contexts/UserPermissionsProvider'
import LoginPage from './pages/Login'
import { Inventory } from './pages/Inventory'
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'
import NotAllowed from './pages/NotAllowed'
import './axiosInterceptor'
import AddInventoryItem from './pages/AddInventoryItem'
import BulkAddFromExcel from './pages/BulkAddFromExcel'
import Dashboard from './pages/Dashboard'

const RedirectHandler = () => {
  const userPermissions = useUserPermissions();
  return userPermissions !== null ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

const AdminOnlyRoutes = () => {
  const userPermissions = useUserPermissions();
  return userPermissions ? <Outlet /> : <NotAllowed />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <UserPermissionsProvider>
          <Toaster expand richColors position='top-center' closeButton />
          <Routes>
            <Route path="/" element={<RedirectHandler />} />
            <Route path='/login' element={<LoginPage />} />
            <Route element={<Layout />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/inventory' element={<Inventory />} />
            <Route path='/about' element={<About />} />
              <Route element={<AdminOnlyRoutes/>}>
                <Route path='/settings' element={<Settings />} />
                <Route path='/add-item' element={<AddInventoryItem />} />
                <Route path='/bulk-add' element={<BulkAddFromExcel />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserPermissionsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
