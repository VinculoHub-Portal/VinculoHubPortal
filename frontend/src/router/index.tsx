import { BrowserRouter, Routes, Route } from "react-router-dom"
import ComponentsPage from "../pages/ComponentsPage/index"
import LandingPage from "../pages/LandingPage/index"

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
    </Routes>
  </BrowserRouter>
)
