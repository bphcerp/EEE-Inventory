import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/scrollbar.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App'
import { ThemeProvider } from './components/theme-provider'
import { Layout } from './layouts/Layout'
import About from './pages/About'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Routes>
          <Route path='/' element={<App />} />
          <Route element={<Layout />}>
            <Route path='/dashboard' element={<div></div>} />
            <Route path='/about' element={<About />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
