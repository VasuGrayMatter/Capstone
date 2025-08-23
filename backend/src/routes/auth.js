import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';

const router = Router();

// Register Route
router.post('/register',
  authRequired(['admin']), // Only admin can create users
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'airline', 'baggage']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    
    // Check if email is already registered
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    try {
      await User.create({ name, email, password, role });
      res.json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login Route
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const { email, password } = req.body;
    
    // Find user by email
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });

    // Compare passwords
    const ok = await u.matchPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT Token
    const token = jwt.sign(
      { sub: u._id, role: u.role, email: u.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: u.role, name: u.name });
  }
);

export default router;
