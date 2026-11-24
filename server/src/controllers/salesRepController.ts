import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { SalesRep } from '../models/SalesRep';

export const getSalesReps = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reps = await SalesRep.find().populate('user', 'name email phone avatar').sort({ monthlySalesTarget: -1 });
    res.json({ success: true, data: reps });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch sales representatives', error: error.message });
  }
};

export const createSalesRep = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rep = await SalesRep.create(req.body);
    res.status(201).json({ success: true, data: rep, message: 'Sales Representative assigned successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create sales rep', error: error.message });
  }
};
