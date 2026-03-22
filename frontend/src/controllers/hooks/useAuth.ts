import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import { setToken } from '../../store/authStore';
import type { LoginRequest, RegisterRequest } from '../../models/types/auth';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function login(data: LoginRequest) {
    setLoading(true);
    setError(null);
    try {
      const { token } = await authService.login(data);
      setToken(token);
      navigate('/home');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterRequest) {
    setLoading(true);
    setError(null);
    try {
      await authService.register(data);
      navigate('/login', { state: { toast: 'Account created successfully!' } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { login, register, loading, error };
}

