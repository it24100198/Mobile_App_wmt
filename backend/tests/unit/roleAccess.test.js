import { jest } from '@jest/globals';
import { requireRole } from '../../src/middleware/auth.js';

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('Role access checking middleware', () => {
  test('allows user when role is in allowed role list', () => {
    const req = { user: { role: 'admin' } };
    const res = mockResponse();
    const next = jest.fn();

    requireRole('admin', 'manager')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('blocks authenticated user when role is not allowed', () => {
    const req = { user: { role: 'employee' } };
    const res = mockResponse();
    const next = jest.fn();

    requireRole('admin', 'manager')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
  });

  test('returns 401 when req.user is missing', () => {
    const req = {};
    const res = mockResponse();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
  });
});
