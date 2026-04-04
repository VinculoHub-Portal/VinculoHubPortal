<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPageIndex from '../pages/LandingPage/index';
=======
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ComponentsPage from "../pages/ComponentsPage/index"
import LandingPage from "../pages/LandingPage/index"
>>>>>>> 3c1cdf241fde3b6765ba4aea0b8286f5ceb1391c

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
<<<<<<< HEAD
      <Route path="/" element={<LandingPageIndex />} />
=======
      <Route path="/" element={<LandingPage />} />
      <Route path="/components" element={<ComponentsPage />} />
>>>>>>> 3c1cdf241fde3b6765ba4aea0b8286f5ceb1391c
    </Routes>
  </BrowserRouter>
)
