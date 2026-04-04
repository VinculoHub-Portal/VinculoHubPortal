import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComponentsPage from '../pages/ComponentsPage/index';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ComponentsPage />} />
      <Route path="/cadastro" element={<div />}/>
    </Routes>
  </BrowserRouter>
);