import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/scrollbar.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import { Layout } from './layouts/Layout'
import About from './pages/About'
import Settings from './pages/Settings'
import { UserPermissionsProvider } from './contexts/UserPermissionsProvider'
import LoginPage from './pages/Login'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <UserPermissionsProvider>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path='/dashboard' element={<div></div>} />
              <Route path='/about' element={<About />} />
              <Route path='/settings' element={<Settings />} />
            </Route>
          </Routes>
        </UserPermissionsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
