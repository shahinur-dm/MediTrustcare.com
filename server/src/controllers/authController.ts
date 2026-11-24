import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { logAudit } from '../services/auditService';
import { AuthenticatedRequest } from '../middlewares/auth';

const generateTokens = (userId: string, role: string) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'meditrust_super_secure_access_secret_key_2026_bd';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'meditrust_super_secure_refresh_secret_key_2026_bd';

  const accessToken = jwt.sign({ id: userId, role }, accessSecret, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ id: userId, role }, refreshSecret, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Please contact administrator.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    // Fetch user role permissions
    const userRole = await Role.findOne({ name: user.role });

    await logAudit({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'Auth',
      details: `User ${user.email} logged in successfully`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          branch: user.branch,
          warehouse: user.warehouse,
          avatar: user.avatar,
        },
        permissions: userRole?.permissions || [],
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'meditrust_super_secure_refresh_secret_key_2026_bd';
    const decoded = jwt.verify(token, refreshSecret) as { id: string; role: string };

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });
      return;
    }

    // Refresh token rotation
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const newTokens = generateTokens(user._id.toString(), user.role);
    user.refreshTokens.push(newTokens.refreshToken);
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRole = await Role.findOne({ name: req.user?.role });
    res.json({
      success: true,
      data: {
        user: req.user,
        permissions: userRole?.permissions || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile', error: error.message });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (req.user && token) {
      req.user.refreshTokens = req.user.refreshTokens.filter((t) => t !== token);
      await req.user.save();
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};
