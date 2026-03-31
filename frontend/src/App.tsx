import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProvidePage from './pages/ProvidePage';
import HomePage from './pages/HomePage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import BookingPage from './pages/BookingPage';
import MyRentalsPage from './pages/MyRentalsPage';
import UserAnalyticsPage from './pages/UserAnalyticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Transit from './pages/Transit';
import Parking from './pages/Parking';
import RouteGuard from './guards/RouteGuard';
import 'leaflet/dist/leaflet.css';
import EditListingPage from './pages/EditListingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<RouteGuard guardType="auth"><HomePage /></RouteGuard>} />
        <Route path="/listing/:id" element={<RouteGuard guardType="auth"><ListingDetailsPage /></RouteGuard>} />
        <Route path="/booking/:id" element={<RouteGuard guardType="auth"><BookingPage /></RouteGuard>} />
        <Route path="/my-rentals" element={<RouteGuard guardType="auth"><MyRentalsPage /></RouteGuard>} />
        <Route path="/provide" element={<RouteGuard guardType="auth"><ProvidePage /></RouteGuard>} />
        <Route path="/analytics" element={<RouteGuard guardType="admin" redirect={<UserAnalyticsPage />}><AdminDashboardPage /></RouteGuard>} />
        <Route path="/edit-listing/:id" element={<RouteGuard guardType="auth"><EditListingPage /></RouteGuard>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/transit" element={<Transit/>} />
        <Route path="/parking" element={<Parking />} />
      </Routes>
    </BrowserRouter>
  );
}
