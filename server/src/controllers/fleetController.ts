import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Vehicle } from '../models/Vehicle';

export const getVehicles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, vehicleType } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (vehicleType) query.vehicleType = vehicleType;

    const vehicles = await Vehicle.find(query).populate('assignedDriver', 'name phone email').sort({ registrationNumber: 1 });
    res.json({ success: true, data: vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles', error: error.message });
  }
};

export const createVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle, message: 'Vehicle registered successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to register vehicle', error: error.message });
  }
};
