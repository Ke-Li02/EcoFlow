import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { useAuth } from '../controllers/hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const location = useLocation();
  const toast = (location.state as { toast?: string } | null)?.toast;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ username, password });
  }

  return (
    <div className="auth-wrapper">
      {toast && <Toast message={toast} />}
      <div className="auth-card">
        <h1>EcoFlow</h1>
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" loading={loading} className="btn-primary">
            Sign in
          </Button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

