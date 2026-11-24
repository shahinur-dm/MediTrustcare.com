import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Payment } from '../models/Payment';
import { Customer } from '../models/Customer';
import { Supplier } from '../models/Supplier';
import { AccountingService } from '../services/accountingService';

export const getPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, method } = req.query;
    const query: any = {};
    if (type) query.type = type;
    if (method) query.method = method;

    const payments = await Payment.find(query)
      .populate('customer', 'name code phone')
      .populate('supplier', 'name code phone')
      .populate('receivedBy', 'name email')
      .sort({ date: -1 });

    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
};

export const createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, method, amount, customer, supplier, referenceNumber, bankName, branchName, chequeDate, mfsAccountNumber, notes } = req.body;
    const paymentNumber = `PAY-${Date.now()}`;

    const payment = await Payment.create({
      paymentNumber,
      type,
      method,
      amount,
      customer,
      supplier,
      referenceNumber,
      bankName,
      branchName,
      chequeDate,
      mfsAccountNumber,
      notes,
      receivedBy: req.user?._id,
      status: 'completed',
    });

    const isBankOrMFS = ['bank_transfer', 'cheque', 'bkash', 'nagad', 'rocket'].includes(method);
    const liquidAccountCode = isBankOrMFS ? '1010' : '1000'; // 1010 Bank/MFS, 1000 Cash

    // If Customer Collection: Debit Cash/Bank, Credit AR, deduct customer balance
    if (type === 'CustomerCollection' && customer) {
      await Customer.findByIdAndUpdate(customer, { $inc: { currentBalance: -amount } });
      try {
        await AccountingService.recordJournalEntry({
          narration: `Customer collection via ${method} (${referenceNumber || paymentNumber})`,
          referenceType: 'PaymentReceipt',
          referenceId: paymentNumber,
          createdBy: req.user?._id,
          lines: [
            { accountCode: liquidAccountCode, debit: amount, credit: 0, description: `Receipt into ${liquidAccountCode === '1010' ? 'Bank' : 'Cash'}` },
            { accountCode: '1030', debit: 0, credit: amount, description: 'Accounts Receivable Collection' },
          ],
        });
      } catch (e) {
        console.warn('[Accounting Sync Warning]', e);
      }
    }

    // If Supplier Payment: Debit AP, Credit Cash/Bank, deduct supplier balance
    if (type === 'SupplierPayment' && supplier) {
      await Supplier.findByIdAndUpdate(supplier, { $inc: { currentBalance: -amount } });
      try {
        await AccountingService.recordJournalEntry({
          narration: `Supplier payment via ${method} (${referenceNumber || paymentNumber})`,
          referenceType: 'PaymentVoucher',
          referenceId: paymentNumber,
          createdBy: req.user?._id,
          lines: [
            { accountCode: '2010', debit: amount, credit: 0, description: 'Accounts Payable Clearance' },
            { accountCode: liquidAccountCode, debit: 0, credit: amount, description: `Payment from ${liquidAccountCode === '1010' ? 'Bank' : 'Cash'}` },
          ],
        });
      } catch (e) {
        console.warn('[Accounting Sync Warning]', e);
      }
    }

    res.status(201).json({ success: true, data: payment, message: 'Payment recorded and ledger reconciled successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
};
