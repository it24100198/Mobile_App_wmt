import { loginSchema } from '../../src/validators/auth.js';

describe('Login validation', () => {
  test('accepts valid email and password', () => {
    const result = loginSchema.validate({
      email: 'admin@example.com',
      password: 'AnyPasswordValue',
    });

    expect(result.error).toBeUndefined();
    expect(result.value.email).toBe('admin@example.com');
  });

  test('rejects missing email', () => {
    const result = loginSchema.validate({
      password: 'AnyPasswordValue',
    });

    expect(result.error).toBeDefined();
    expect(result.error.details[0].path).toEqual(['email']);
  });

  test('rejects invalid email format', () => {
    const result = loginSchema.validate({
      email: 'not-an-email',
      password: 'AnyPasswordValue',
    });

    expect(result.error).toBeDefined();
    expect(result.error.details[0].path).toEqual(['email']);
  });

  test('rejects missing password', () => {
    const result = loginSchema.validate({
      email: 'admin@example.com',
    });

    expect(result.error).toBeDefined();
    expect(result.error.details[0].path).toEqual(['password']);
  });
});
