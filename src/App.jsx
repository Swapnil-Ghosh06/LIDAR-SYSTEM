import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimulatorPage from './pages/SimulatorPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<SimulatorPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
