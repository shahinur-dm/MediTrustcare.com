import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Supplier } from '../models/Supplier';
import { PurchaseInvoice } from '../models/PurchaseInvoice';

export const getSuppliers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, district } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (district) query.district = district;

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers', error: error.message });
  }
};

export const createSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const code = req.body.code || `SUP-${Date.now().toString().slice(-4)}`;
    const supplier = await Supplier.create({ ...req.body, code });
    res.status(201).json({ success: true, data: supplier, message: 'Supplier registered successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create supplier', error: error.message });
  }
};

export const getSupplierLedger = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    const invoices = await PurchaseInvoice.find({ supplier: supplier._id }).sort({ invoiceDate: -1 });
    res.json({ success: true, data: { supplier, invoices } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch supplier ledger', error: error.message });
  }
};
