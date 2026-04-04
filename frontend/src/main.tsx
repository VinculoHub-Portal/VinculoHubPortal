<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import ComponentsPage from './components/auth/WizardSelect.tsx' 
=======
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import { AppRouter } from "./router/index";
>>>>>>> eea9221 (step 1 cadastro instituicao)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);