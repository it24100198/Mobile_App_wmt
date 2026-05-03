import * as authService from '../services/authService.js';
import { User } from '../models/index.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

export async function me(req, res) {
  return res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
}

export async function listUsers(req, res) {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
    const user = await User.create({ name, email, password, role: role || 'operator' });
    return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already in use' });
    return res.status(400).json({ error: err.message });
  }
}
