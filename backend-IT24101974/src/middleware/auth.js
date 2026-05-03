import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    User.findById(decoded.userId)
      .then((user) => {
        if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });
        req.user = user;
        next();
      })
      .catch(() => res.status(401).json({ error: 'Token validation failed' }));
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` });
    next();
  };
}
