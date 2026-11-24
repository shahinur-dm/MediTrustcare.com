import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { Role } from '../models/Role';
import { ROLES } from '../config/constants';

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (req.user.role === ROLES.SUPER_ADMIN || allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
    });
  };
};

export const checkPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Super Admin has all permissions
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    try {
      const userRole = await Role.findOne({ name: req.user.role });
      if (!userRole) {
        res.status(403).json({ success: false, message: `Role '${req.user.role}' not found.` });
        return;
      }

      const modPerm = userRole.permissions.find((p) => p.module === module || p.module === '*');
      if (modPerm && (modPerm.actions.includes(action) || (modPerm.actions as string[]).includes('*'))) {
        return next();
      }

      res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission '${action}' on module '${module}'.`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Permission evaluation failed', error: error.message });
    }
  };
};
