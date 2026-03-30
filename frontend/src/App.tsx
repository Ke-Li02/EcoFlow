import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProvidePage from './pages/ProvidePage';
import { isLoggedIn } from './store/authStore';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import Transit from './pages/Transit';
import Parking from './pages/Parking';
import Pannel from './pages/AdminPannel';
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
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/provide" element={<ProtectedRoute><ProvidePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/transit" element={<Transit/>} />
        <Route path="/parking" element={<Parking />} />
        <Route path="/pannel" element={<Pannel />}/>
      </Routes>
    </BrowserRouter>
  );
}
