import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../controllers/hooks/useAuth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { register, loading, error } = useAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register({ username, password, isAdmin });
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>EcoFlow</h1>
        <h2>Create account</h2>
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
            autoComplete="new-password"
          />
          <div className="field checkbox-field">
            <label htmlFor="isAdmin">
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              Register as admin
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" loading={loading} className="btn-primary">
            Create account
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

