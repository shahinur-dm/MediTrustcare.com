import { AuditLog } from '../models/AuditLog';

interface AuditLogParams {
  userId?: any;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

export const logAudit = async (params: AuditLogParams): Promise<void> => {
  try {
    await AuditLog.create({
      user: params.userId,
      userName: params.userName || 'System',
      userRole: params.userRole || 'System',
      action: params.action,
      module: params.module,
      entityId: params.entityId,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
};
