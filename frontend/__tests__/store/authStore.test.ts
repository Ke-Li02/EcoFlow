import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getToken, 
  setToken, 
  clearToken, 
  isLoggedIn, 
  getUser 
} from '../../src/store/authStore';

const TOKEN_KEY = 'ecoflow_token';

describe('Auth Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Storage Basics', () => {
    it('should return null if no token exists', () => {
      expect(getToken()).toBeNull();
    });

    it('should set and get the token', () => {
      const testToken = 'mock-jwt-token';
      setToken(testToken);
      expect(getToken()).toBe(testToken);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(testToken);
    });

    it('should clear the token', () => {
      setToken('temp-token');
      clearToken();
      expect(getToken()).toBeNull();
    });

    it('should return true for isLoggedIn when token exists', () => {
      setToken('valid-token');
      expect(isLoggedIn()).toBe(true);
    });

    it('should return false for isLoggedIn when token is missing', () => {
      expect(isLoggedIn()).toBe(false);
    });
  });

  describe('getUser (JWT Decoding)', () => {
    const createMockToken = (payload: object) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const body = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return `${header}.${body}.signature`;
    };

    it('should return null if there is no token', () => {
      expect(getUser()).toBeNull();
    });

    it('should return null if the token is malformed', () => {
      setToken('not-a-real-token');
      expect(getUser()).toBeNull();
    });

    it('should correctly parse a valid JWT and return a User object', () => {
      const mockPayload = { id: 123, username: 'johndoe', isAdmin: true };
      const token = createMockToken(mockPayload);
      setToken(token);

      const user = getUser();
      expect(user).toEqual({
        id: 123,
        username: 'johndoe',
        isAdmin: true,
      });
    });

    it('should handle string IDs by converting them to numbers', () => {
      const token = createMockToken({ id: '456', username: 'admin' });
      setToken(token);

      const user = getUser();
      expect(user?.id).toBe(456);
    });

    it('should return null if username is missing in payload', () => {
      const token = createMockToken({ id: 1 });
      setToken(token);
      expect(getUser()).toBeNull();
    });

    it('should return null if id is not a valid number', () => {
      const token = createMockToken({ id: 'abc', username: 'tester' });
      setToken(token);
      expect(getUser()).toBeNull();
    });

    it('should handle base64 decoding errors gracefully', () => {
      setToken('header.invalid_base64_!@#$.signature');
      expect(getUser()).toBeNull();
    });
  });
});