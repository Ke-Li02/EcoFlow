import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProvidePage from './pages/ProvidePage';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import Transit from './pages/Transit';
import Parking from './pages/Parking';
import RouteGuard from './guards/RouteGuard';
import Pannel from './pages/AdminPannel';
import 'leaflet/dist/leaflet.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<RouteGuard guardType="auth"><HomePage /></RouteGuard>} />
        <Route path="/provide" element={<RouteGuard guardType="auth"><ProvidePage /></RouteGuard>} />
        <Route path="/analytics" element={<RouteGuard guardType="admin"><AnalyticsPage /></RouteGuard>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/transit" element={<Transit/>} />
        <Route path="/parking" element={<Parking />} />
        <Route path="/pannel" element={<Pannel />}/>
      </Routes>
    </BrowserRouter>
  );
}
