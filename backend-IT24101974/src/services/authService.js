import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = '7d';

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error('Invalid email or password');
  if (!user.isActive) throw new Error('Account is deactivated');

  const valid = await user.comparePassword(password);
  if (!valid) throw new Error('Invalid email or password');

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function seedAdminUser() {
  const exists = await User.findOne({ email: 'admin@manufacturing.com' });
  if (!exists) {
    await User.create({
      name: 'Admin',
      email: 'admin@manufacturing.com',
      password: 'Admin@1234',
      role: 'admin',
    });
    console.log('✅ Default admin created: admin@manufacturing.com / Admin@1234');
    return;
  }

  // Dev convenience: always reset admin defaults on first request.
  exists.name = 'Admin';
  exists.role = 'admin';
  exists.isActive = true;
  exists.password = 'Admin@1234';
  await exists.save();
  console.log('✅ Default admin reset: admin@manufacturing.com / Admin@1234');
}
