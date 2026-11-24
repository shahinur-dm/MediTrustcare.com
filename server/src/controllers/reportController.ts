import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { SalesInvoice } from '../models/SalesInvoice';
import { PurchaseInvoice } from '../models/PurchaseInvoice';
import { Inventory } from '../models/Inventory';
import { Customer } from '../models/Customer';
import { Supplier } from '../models/Supplier';
import { Batch } from '../models/Batch';

export const getSalesReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const query: any = {};
    if (startDate && endDate) {
      query.invoiceDate = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    if (customerId) query.customer = customerId;

    const invoices = await SalesInvoice.find(query)
      .populate('customer', 'name code district')
      .populate('branch', 'name code')
      .sort({ invoiceDate: -1 });

    const totalSales = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
    const totalVat = invoices.reduce((s, i) => s + (i.totalVat || 0), 0);
    const totalCollected = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);

    res.json({
      success: true,
      data: {
        summary: { totalSales, totalVat, totalCollected, count: invoices.length },
        invoices,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate sales report', error: error.message });
  }
};

export const getInventoryValuationReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.find().populate('product').populate('warehouse', 'name code district');
    const totalValuation = inventory.reduce((s, item) => s + (item.totalValuation || 0), 0);
    const totalUnits = inventory.reduce((s, item) => s + (item.totalQuantity || 0), 0);

    res.json({
      success: true,
      data: {
        summary: { totalValuation, totalUnits, totalProductsTracked: inventory.length },
        inventory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate inventory valuation report', error: error.message });
  }
};

export const getMushakTaxReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sales = await SalesInvoice.find().populate('customer', 'name binNumber');
    const totalTaxableAmount = sales.reduce((s, i) => s + (i.subtotal - i.totalDiscount), 0);
    const totalVatPayable = sales.reduce((s, i) => s + i.totalVat, 0);

    res.json({
      success: true,
      data: {
        mushakType: 'Mushak-6.3 NBR Tax Register',
        totalTaxableAmount,
        totalVatPayable,
        records: sales.map((s) => ({
          invoiceNumber: s.invoiceNumber,
          mushakNumber: s.mushakNumber,
          customerName: (s.customer as any)?.name,
          customerBin: (s.customer as any)?.binNumber || 'Unregistered',
          date: s.invoiceDate,
          taxableValue: s.subtotal - s.totalDiscount,
          vatAmount: s.totalVat,
          totalWithVat: s.grandTotal,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate Mushak tax report', error: error.message });
  }
};
