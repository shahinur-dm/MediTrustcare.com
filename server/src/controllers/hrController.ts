import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Employee } from '../models/Employee';

export const getEmployees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, status } = req.query;
    const query: any = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query).populate('branch', 'name code').sort({ name: 1 });
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch employees', error: error.message });
  }
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalGrossSalary =
      (req.body.basicSalary || 0) +
      (req.body.houseRentAllowance || 0) +
      (req.body.medicalAllowance || 0) +
      (req.body.transportAllowance || 0);

    const employee = await Employee.create({
      ...req.body,
      totalGrossSalary,
    });
    res.status(201).json({ success: true, data: employee, message: 'Employee added successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create employee', error: error.message });
  }
};
