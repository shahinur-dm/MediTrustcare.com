import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Account } from '../models/Account';
import { JournalEntry } from '../models/JournalEntry';
import { AccountingService } from '../services/accountingService';

export const getChartOfAccounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accounts = await Account.find({ isActive: true }).sort({ code: 1 });
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch Chart of Accounts', error: error.message });
  }
};

export const getJournalEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const entries = await JournalEntry.find().populate('createdBy', 'name email').sort({ date: -1 }).limit(100);
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch journal entries', error: error.message });
  }
};

export const createManualJournalEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { narration, lines } = req.body;
    const entry = await AccountingService.recordJournalEntry({
      narration,
      referenceType: 'Manual',
      createdBy: req.user?._id,
      lines,
    });
    res.status(201).json({ success: true, data: entry, message: 'Journal entry created successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFinancialStatements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const accounts = await Account.find();

    const assets = accounts.filter((a) => a.type === 'Asset');
    const liabilities = accounts.filter((a) => a.type === 'Liability');
    const equities = accounts.filter((a) => a.type === 'Equity');
    const revenues = accounts.filter((a) => a.type === 'Revenue');
    const expenses = accounts.filter((a) => a.type === 'Expense');

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
    const totalEquity = equities.reduce((s, a) => s + a.balance, 0);
    const totalRevenue = revenues.reduce((s, a) => s + a.balance, 0);
    const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);

    const netIncome = totalRevenue - totalExpenses;

    res.json({
      success: true,
      data: {
        trialBalance: accounts.map((a) => ({
          code: a.code,
          name: a.name,
          type: a.type,
          debit: ['Asset', 'Expense'].includes(a.type) ? Math.max(0, a.balance) : 0,
          credit: ['Liability', 'Equity', 'Revenue'].includes(a.type) ? Math.max(0, a.balance) : 0,
        })),
        profitAndLoss: {
          revenues,
          expenses,
          totalRevenue,
          totalExpenses,
          netIncome,
        },
        balanceSheet: {
          assets,
          liabilities,
          equities,
          totalAssets,
          totalLiabilities,
          totalEquity: totalEquity + netIncome,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate financial statements', error: error.message });
  }
};
