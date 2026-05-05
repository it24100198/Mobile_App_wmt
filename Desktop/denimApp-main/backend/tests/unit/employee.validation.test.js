import mongoose from 'mongoose';
import Employee from '../../src/models/Employee.js';
import { ROLES } from '../../src/config/roles.js';

describe('Employee model validation', () => {
  const validEmployee = () => ({
    userId: new mongoose.Types.ObjectId(),
    employeeId: 'EMP-1001',
    role: ROLES.OPERATOR,
    salary: 45000,
    name: 'Kavin Perera',
    phone: '+94770011223',
  });

  test('accepts a valid employee payload', () => {
    const employee = new Employee(validEmployee());

    const error = employee.validateSync();

    expect(error).toBeUndefined();
  });

  test('rejects employee when linked userId is missing', () => {
    const payload = validEmployee();
    delete payload.userId;

    const error = new Employee(payload).validateSync();

    expect(error).toBeDefined();
    expect(error.errors.userId.kind).toBe('required');
  });

  test('rejects negative salary', () => {
    const employee = new Employee({
      ...validEmployee(),
      salary: -500,
    });

    const error = employee.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.salary.kind).toBe('min');
  });

  test('rejects a role outside allowed role values', () => {
    const employee = new Employee({
      ...validEmployee(),
      role: 'cashier',
    });

    const error = employee.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.role.kind).toBe('enum');
  });
});
