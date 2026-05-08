import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SeniorsPage from './pages/SeniorsPage';
import DailyPage from './pages/DailyPage';
import TransportsPage from './pages/TransportsPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <span className="logo">🚌 מרכז יום - הסעות</span>
        <div className="nav-links">
          <Link to="/">ניהול קשישים</Link>
          <Link to="/daily">הסעות היום</Link>
          <Link to="/transports">ניהול הסעות</Link>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<SeniorsPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/transports" element={<TransportsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
