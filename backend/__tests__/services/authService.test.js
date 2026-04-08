const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { register, login, decodeToken } = require('../../services/authService');
const { findUserByUsername, createUser } = require('../../models/userModel');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/userModel');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('register', () => {
    it('should create a new user if username is available', async () => {
      findUserByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      createUser.mockResolvedValue({ id: 1, username: 'test' });

      const result = await register('test', 'password123', false);

      expect(findUserByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(createUser).toHaveBeenCalledWith('test', 'hashed-password', false);
      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('should default isAdmin to false if not provided', async () => {
      findUserByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      createUser.mockResolvedValue({ id: 2 });

      await register('user', 'pass');

      expect(createUser).toHaveBeenCalledWith('user', 'hashed-password', false);
    });

    it('should throw if username already exists', async () => {
      findUserByUsername.mockResolvedValue({ id: 1 });

      await expect(register('test', 'pass')).rejects.toEqual({
        status: 409,
        message: 'Username already taken',
      });

      expect(createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        password: 'hashed',
        is_admin: true,
      };

      findUserByUsername.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      const result = await login('test', 'password');

      expect(findUserByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          username: 'test',
          isAdmin: true,
        },
        'test-secret',
        { expiresIn: '7d' }
      );

      expect(result).toEqual({ token: 'mock-token' });
    });

    it('should throw if user not found', async () => {
      findUserByUsername.mockResolvedValue(null);

      await expect(login('test', 'password')).rejects.toEqual({
        status: 401,
        message: 'Invalid credentials',
      });
    });

    it('should throw if password does not match', async () => {
      findUserByUsername.mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(login('test', 'wrong')).rejects.toEqual({
        status: 401,
        message: 'Invalid credentials',
      });
    });
  });

  describe('decodeToken', () => {
    it('should verify and return decoded token', () => {
      const decoded = { id: 1 };
      jwt.verify.mockReturnValue(decoded);

      const result = decodeToken('token');

      expect(jwt.verify).toHaveBeenCalledWith('token', 'test-secret');
      expect(result).toEqual(decoded);
    });

    it('should throw if token is invalid', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => decodeToken('bad-token')).toThrow('invalid token');
    });
  });
});