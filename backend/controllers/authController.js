import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users } from '../models/data.js';
import { syncOrderServiceConfig } from './goalController.js';

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    // Sync order service config (non-blocking)
    syncOrderServiceConfig().catch(err => {
      console.log('Order service sync failed (non-critical):', err.message);
    });

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
syncOrderServiceConfig().catch(err => {
  console.log('Order service sync failed (non-critical):', err.message);
});
/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


