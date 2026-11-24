import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Customer } from '../models/Customer';
import { SalesInvoice } from '../models/SalesInvoice';

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, customerType, district } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (customerType) query.customerType = customerType;
    if (district) query.district = district;

    const customers = await Customer.find(query).sort({ name: 1 });
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: error.message });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const code = req.body.code || `CUST-${Date.now().toString().slice(-4)}`;
    const customer = await Customer.create({ ...req.body, code });
    res.status(201).json({ success: true, data: customer, message: 'Customer registered successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create customer', error: error.message });
  }
};

export const getCustomerLedger = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }
    const invoices = await SalesInvoice.find({ customer: customer._id }).sort({ invoiceDate: -1 });
    res.json({ success: true, data: { customer, invoices } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer ledger', error: error.message });
  }
};
