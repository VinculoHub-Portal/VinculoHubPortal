import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from '../pages/Registering/register-page';
import LandingPage from "../pages/LandingPage"
import ComponentsPage from "../pages/ComponentsPage"
import RegisterPage from "../pages/RegisterPage"


export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/cadastro" element={<RegisterPage />}/>
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
    </Routes>
  </BrowserRouter>
)
