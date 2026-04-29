
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "../pages/LandingPage"
import { ComponentsPage } from "../pages/ComponentsPage"
import { RegisterPage } from "../pages/RegisterPage"
import { AuthRoleRedirect } from "../components/auth/AuthRoleRedirect"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { RoleHomePage } from "../pages/RoleHomePage"
import { CompanyRegistrationPage } from "../pages/CompanyRegistration/registration"

export const AppRouter = () => (
  <BrowserRouter>
    <AuthRoleRedirect />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/cadastro/instituicao" element={<RegisterPage />} />
      <Route path="/company/register" element={<CompanyRegistrationPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <RoleHomePage
              title="Painel administrativo"
              description="Gerencie usuários, organizações e configurações da plataforma."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ong/dashboard"
        element={
          <ProtectedRoute requiredRole="NPO">
            <RoleHomePage
              title="Painel da ONG"
              description="Acompanhe seu cadastro, projetos e oportunidades para sua organização."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/dashboard"
        element={
          <ProtectedRoute requiredRole="COMPANY">
            <RoleHomePage
              title="Painel da empresa"
              description="Encontre projetos, acompanhe parcerias e gerencie seu perfil institucional."
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>

);