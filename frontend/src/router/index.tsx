import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "../pages/LandingPage"
import ComponentsPage from "../pages/ComponentsPage"
import WizardSelect from "../components/auth/WizardSelect"

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="/cadastro/instituicao" element={<WizardSelect />} />
    </Routes>
  </BrowserRouter>
)
