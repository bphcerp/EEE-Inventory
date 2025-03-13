import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/scrollbar.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import { Layout } from './layouts/Layout'
import About from './pages/About'
import Settings from './pages/Settings'
import { UserPermissionsProvider, useUserPermissions } from './contexts/UserPermissionsProvider'
import LoginPage from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'

const RedirectHandler = () => {
  const userPermissions = useUserPermissions();
  return userPermissions !== null ? <Navigate to="/dashboard" replace /> : <Navigate to="/login"  replace/>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <UserPermissionsProvider>
          <Toaster richColors position='top-center' />
          <Routes>
            <Route path="/" element={<RedirectHandler />} />
            <Route path='/login' element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/about' element={<About />} />
              <Route path='/settings' element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserPermissionsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
