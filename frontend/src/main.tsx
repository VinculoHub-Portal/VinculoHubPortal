import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import ComponentsPage from './components/auth/WizardSelect.tsx' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ComponentsPage />
  </StrictMode>,
)