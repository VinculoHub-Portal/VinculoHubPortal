import { BrowserRouter, Routes, Route } from "react-router-dom";
import ComponentsPage from "../pages/ComponentsPage/index";
import WizardSelect from "../components/auth/WizardSelect";

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ComponentsPage />} />
      <Route
        path="/cadastro/instituicao"
        element={<WizardSelect />}
      />
    </Routes>
  </BrowserRouter>
);