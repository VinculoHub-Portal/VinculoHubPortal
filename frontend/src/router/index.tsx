import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComponentsPage from '../pages/ComponentsPage/index';
import RegisterPage from '../pages/Registering/register-page';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ComponentsPage />} />
      <Route path="/cadastro" element={<RegisterPage />}/>
    </Routes>
  </BrowserRouter>
);