import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComponentsPage from '../pages/ComponentsPage/index';
import LandingPage from '../pages/LandingPage';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ComponentsPage />} />
      <Route path="/landing-page" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);