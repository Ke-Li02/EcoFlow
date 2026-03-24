import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { isLoggedIn } from './store/authStore';
import HomePage from './pages/HomePage';
import Transit from './pages/Transit';
import Parking from './pages/Parking';
import 'leaflet/dist/leaflet.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/transit" element={<Transit/>} />
        <Route path="/parking" element={<Parking />} />
      </Routes>
    </BrowserRouter>
  );
}
