import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import LandingPage from './pages/LandingPage/index' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)