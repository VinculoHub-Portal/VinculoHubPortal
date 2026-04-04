<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import { AppRouter } from './router/index'
createRoot(document.getElementById('root')!).render(
=======
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles/main.css"
import { AppRouter } from "./router"

createRoot(document.getElementById("root")!).render(
>>>>>>> 3c1cdf241fde3b6765ba4aea0b8286f5ceb1391c
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
