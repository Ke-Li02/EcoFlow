const { registerHandler, loginHandler } = require('../../controllers/authController');
const authService = require('../../services/authService');

jest.mock('../../services/authService');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => jest.clearAllMocks());

describe('registerHandler', () => {
  describe('validation', () => {
    test('returns 400 when username is missing', async () => {
      const req = { body: { password: 'secret' } };
      const res = mockRes();

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
      expect(authService.register).not.toHaveBeenCalled();
    });

    test('returns 400 when password is missing', async () => {
      const req = { body: { username: 'alice' } };
      const res = mockRes();

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
      expect(authService.register).not.toHaveBeenCalled();
    });

    test('returns 400 when both username and password are missing', async () => {
      const req = { body: {} };
      const res = mockRes();

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
    });
  });

  describe('success', () => {
    test('returns 201 with the created user', async () => {
      const newUser = { id: 1, username: 'alice', isAdmin: false };
      authService.register.mockResolvedValue(newUser);

      const req = { body: { username: 'alice', password: 'secret', isAdmin: false } };
      const res = mockRes();

      await registerHandler(req, res);

      expect(authService.register).toHaveBeenCalledWith('alice', 'secret', false);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    test('forwards isAdmin flag to authService', async () => {
      authService.register.mockResolvedValue({ id: 2, username: 'bob', isAdmin: true });

      const req = { body: { username: 'bob', password: 'pw', isAdmin: true } };
      const res = mockRes();

      await registerHandler(req, res);

      expect(authService.register).toHaveBeenCalledWith('bob', 'pw', true);
    });
  });

  describe('error handling', () => {
    test('returns the error status when authService throws with a status', async () => {
      const error = Object.assign(new Error('Username already taken'), { status: 409 });
      authService.register.mockRejectedValue(error);

      const req = { body: { username: 'alice', password: 'secret' } };
      const res = mockRes();

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username already taken' });
    });

    test('falls back to 500 when the error has no status', async () => {
      authService.register.mockRejectedValue(new Error('Unexpected failure'));

      const req = { body: { username: 'alice', password: 'secret' } };
      const res = mockRes();

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected failure' });
    });
  });
});

describe('loginHandler', () => {
  describe('validation', () => {
    test('returns 400 when username is missing', async () => {
      const req = { body: { password: 'secret' } };
      const res = mockRes();

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
      expect(authService.login).not.toHaveBeenCalled();
    });

    test('returns 400 when password is missing', async () => {
      const req = { body: { username: 'alice' } };
      const res = mockRes();

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
      expect(authService.login).not.toHaveBeenCalled();
    });

    test('returns 400 when both fields are missing', async () => {
      const req = { body: {} };
      const res = mockRes();

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
    });
  });

  describe('success', () => {
    test('returns 200 with the login result', async () => {
      const loginResult = { token: 'jwt-token-here', user: { id: 1, username: 'alice' } };
      authService.login.mockResolvedValue(loginResult);

      const req = { body: { username: 'alice', password: 'secret' } };
      const res = mockRes();

      await loginHandler(req, res);

      expect(authService.login).toHaveBeenCalledWith('alice', 'secret');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(loginResult);
    });
  });

  describe('error handling', () => {
    test('returns the error status when authService throws with a status', async () => {
      const error = Object.assign(new Error('Invalid credentials'), { status: 401 });
      authService.login.mockRejectedValue(error);

      const req = { body: { username: 'alice', password: 'wrong' } };
      const res = mockRes();

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    test('falls back to 500 when the error has no status', async () => {
      authService.login.mockRejectedValue(new Error('DB connection lost'));

      const req = { body: { username: 'alice', password: 'secret' } };
      const res = mockRes();

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB connection lost' });
    });
  });
});