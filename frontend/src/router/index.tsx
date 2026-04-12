import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "../pages/LandingPage"
import ComponentsPage from "../pages/ComponentsPage"
import RegisterPage from "../pages/RegisterPage"
import { AuthRoleRedirect } from "../components/auth/AuthRoleRedirect"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { RoleHomePage } from "../pages/RoleHomePage"


export const AppRouter = () => (
  <BrowserRouter>
    <AuthRoleRedirect />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
            <RoleHomePage
              title="Painel da empresa"
              description="Encontre projetos, acompanhe parcerias e gerencie seu perfil institucional."
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
)
