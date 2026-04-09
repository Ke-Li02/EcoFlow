import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../../src/controllers/hooks/useAuth';
import * as authService from '../../../src/services/authService';
import { setToken } from '../../../src/store/authStore';

vi.mock('../../../src/services/authService');
vi.mock('../../../src/store/authStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login and navigate to /home', async () => {
      const mockToken = 'fake-token';

      vi.spyOn(authService, 'login').mockResolvedValue({ token: mockToken });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ username: 'test@test.com', password: 'password' });
      });

      expect(setToken).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set error message when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      vi.spyOn(authService, 'login').mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ username: 'test@test.com', password: 'wrong' });
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should successfully register and navigate to /login with state', async () => {
      vi.spyOn(authService, 'register').mockResolvedValue({} as any);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({ 
          username: 'testuser', 
          password: 'password',
          isAdmin: false
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { toast: 'Account created successfully!' }
      });
      expect(result.current.loading).toBe(false);
    });

    it('should handle registration error with default message', async () => {

      vi.spyOn(authService, 'register').mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({ 
          username: 'testuser', 
          password: 'password',
          isAdmin: false
        });
      });

      expect(result.current.error).toBe('Registration failed');
      expect(result.current.loading).toBe(false);
    });
  });
});