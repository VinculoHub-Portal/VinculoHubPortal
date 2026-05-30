import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "../pages/LandingPage"
import { ComponentsPage } from "../pages/ComponentsPage"
import { RegisterPage } from "../pages/RegisterPage"
import { AuthRoleRedirect } from "../components/auth/AuthRoleRedirect"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { RoleHomePage } from "../pages/RoleHomePage"
import { CompanyRegistrationPage } from "../pages/CompanyRegistration/registration"
import { ProjectDetailsPage } from "../pages/ProjectDetailsPage"
import { CompanyDashboard } from "../pages/CompanyDashboard"
import { CompanyIncentiveLawsPage } from "../pages/CompanyIncentiveLawsPage"
import { CompanyPrivateInvestmentPage } from "../pages/CompanyPrivateInvestmentPage"
import { OngProjectsPage } from "../pages/OngProjectsPage"
import { EditProjectPage } from "../pages/EditProjectPage"
import { EditaisMuralPage } from "../pages/EditaisMuralPage"
import { AdminDashboard } from "../pages/AdminDashboard"

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
        path="/projeto/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
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
              showCreateProjectAction
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ong/projetos"
        element={
          <ProtectedRoute requiredRole="NPO">
            <OngProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ong/projetos/:projectId/editar"
        element={
          <ProtectedRoute requiredRole="NPO">
            <EditProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editais"
        element={
          <ProtectedRoute requiredRoles={["ADMIN", "NPO"]}>
            <EditaisMuralPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/dashboard"
        element={
          <ProtectedRoute requiredRole="COMPANY">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/leis-de-incentivo"
        element={
          <ProtectedRoute requiredRole="COMPANY">
            <CompanyIncentiveLawsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/investimento-social-privado"
        element={
          <ProtectedRoute requiredRole="COMPANY">
            <CompanyPrivateInvestmentPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
