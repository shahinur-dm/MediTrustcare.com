import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Company } from '../models/Company';
import { SystemSetting } from '../models/SystemSetting';
import { AuditLog } from '../models/AuditLog';
import { Role } from '../models/Role';
import { User } from '../models/User';

export const getCompanySettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'MediTrust Care Bangladesh',
        email: 'meditrust.healthcare2026@gmail.com',
        phone: '01763-638441',
        address: 'Faridpur, Dhaka, Bangladesh',
        website: 'https://www.meditrustcarebd.com/',
      });
    }
    const settings = await SystemSetting.find();
    res.json({ success: true, data: { company, settings } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
  }
};

export const updateCompanySettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, data: company, message: 'Company settings updated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to update settings', error: error.message });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
  }
};

export const getUsersAndRoles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').populate('branch', 'name code').populate('warehouse', 'name code');
    const roles = await Role.find();
    res.json({ success: true, data: { users, roles } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users and roles', error: error.message });
  }
};
