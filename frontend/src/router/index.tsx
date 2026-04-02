import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComponentsPage from '../pages/ComponentsPage/index';
import CompanyRegistrationPage from '../pages/company/registration/index';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ComponentsPage />} />
      <Route path="/company/register" element={<CompanyRegistrationPage />} />
    </Routes>
  </BrowserRouter>
);