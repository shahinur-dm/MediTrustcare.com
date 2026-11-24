import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Warehouse } from '../models/Warehouse';
import { Branch } from '../models/Branch';

export const getWarehouses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await Warehouse.find().populate('branch', 'name code').populate('manager', 'name email phone');
    res.json({ success: true, data: warehouses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses', error: error.message });
  }
};

export const createWarehouse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: warehouse, message: 'Warehouse created successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create warehouse', error: error.message });
  }
};

export const getBranches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const branches = await Branch.find().populate('manager', 'name email phone');
    res.json({ success: true, data: branches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
  }
};

export const createBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ success: true, data: branch, message: 'Branch created successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create branch', error: error.message });
  }
};
