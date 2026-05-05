import mongoose from 'mongoose';
import Expense from '../../src/models/Expense.js';

describe('Expense model validation', () => {
  const validExpense = () => ({
    category: new mongoose.Types.ObjectId(),
    amount: 2500,
    date: new Date('2026-04-27'),
    description: 'Thread purchase',
    paymentMethod: 'cash',
    status: 'recorded',
  });

  test('accepts a valid expense payload', () => {
    const expense = new Expense(validExpense());

    const error = expense.validateSync();

    expect(error).toBeUndefined();
  });

  test('rejects expense when category is missing', () => {
    const payload = validExpense();
    delete payload.category;

    const error = new Expense(payload).validateSync();

    expect(error).toBeDefined();
    expect(error.errors.category.kind).toBe('required');
  });

  test('rejects negative expense amount', () => {
    const expense = new Expense({
      ...validExpense(),
      amount: -1,
    });

    const error = expense.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.amount.kind).toBe('min');
  });

  test('rejects invalid payment method and status', () => {
    const expense = new Expense({
      ...validExpense(),
      paymentMethod: 'cheque',
      status: 'paid',
    });

    const error = expense.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.paymentMethod.kind).toBe('enum');
    expect(error.errors.status.kind).toBe('enum');
  });
});
