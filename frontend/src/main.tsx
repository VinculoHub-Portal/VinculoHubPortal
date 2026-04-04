import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import { AppRouter } from './router/index'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)