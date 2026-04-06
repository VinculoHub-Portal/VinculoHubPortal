import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "../pages/LandingPage"
import ComponentsPage from "../pages/ComponentsPage"
import CompanyRegistrationPage from "../pages/company/registration"

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="/company/register" element={<CompanyRegistrationPage />} />
    </Routes>
  </BrowserRouter>
)
