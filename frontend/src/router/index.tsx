import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPageIndex from '../pages/LandingPage/index';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPageIndex />} />
    </Routes>
  </BrowserRouter>
);