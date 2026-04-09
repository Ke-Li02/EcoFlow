import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { login, register } from '../../src/services/authService';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockReturnThis(),
      post: vi.fn(),
    },
  };
});

describe('authService', () => {
  const mockPost = vi.spyOn(axios.create(), 'post');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call the login endpoint and return data', async () => {
      const mockResponse = { data: { token: 'fake-token-123' } };
      mockPost.mockResolvedValueOnce(mockResponse);

      const loginData = { username: 'testuser', password: 'password123' };
      const result = await login(loginData);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error if the request fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));

      await expect(login({ username: 'u', password: 'p' }))
        .rejects.toThrow('Network Error');
    });
  });

  describe('register', () => {
    it('should call the register endpoint and return data', async () => {
      const mockResponse = { data: { token: 'new-user-token' } };
      mockPost.mockResolvedValueOnce(mockResponse);

      const registerData = { 
        username: 'newuser', 
        password: 'password', 
        isAdmin: false 
      };
      const result = await register(registerData);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse.data);
    });
  });
});