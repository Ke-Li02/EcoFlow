import { useNavigate } from 'react-router-dom';
import { clearToken, getUser } from '../store/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <h1>EcoFlow</h1>
        <p>Welcome, <strong>{user?.username}</strong>{user?.isAdmin ? ' (Admin)' : ''}!</p>
        <button className="btn-primary" onClick={handleLogout}>Sign out</button>
      </div>
    </div>
  );
}

