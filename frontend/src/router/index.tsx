import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComponentsPage from '../pages/ComponentsPage/index';

export const AppRouter = () => (
  <BrowserRouter>
    <AuthRoleRedirect />
    <Routes>
      <Route path="/" element={<ComponentsPage />} />
    </Routes>
  </BrowserRouter>
)
