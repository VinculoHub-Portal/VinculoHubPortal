import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthRoleRedirect } from "../components/auth/AuthRoleRedirect";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { ComponentsPage } from "../pages/ComponentsPage";
import { CompanyRegistrationPage } from "../pages/CompanyRegistration/registration";
import { LandingPage } from "../pages/LandingPage";
import { MyProjectsPage } from "../pages/MyProjectsPage";
import { NpoDashboardPage } from "../pages/NpoDashboardPage";
import { RegisterPage } from "../pages/RegisterPage";
import { RoleHomePage } from "../pages/RoleHomePage";

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
            <NpoDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ong/projetos"
        element={
          <ProtectedRoute>
            <MyProjectsPage />
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
);
