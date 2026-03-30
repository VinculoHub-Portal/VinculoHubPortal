import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import ComponentsPage from './pages/ComponentsPage/index' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ComponentsPage />
  </StrictMode>,
)