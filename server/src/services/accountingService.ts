import { Account } from '../models/Account';
import { JournalEntry } from '../models/JournalEntry';
import { logAudit } from './auditService';

export class AccountingService {
  /**
   * Create balanced double-entry Journal Entry and update Account balances
   */
  static async recordJournalEntry(params: {
    narration: string;
    referenceType: 'SalesInvoice' | 'PurchaseInvoice' | 'PaymentReceipt' | 'PaymentVoucher' | 'SalesReturn' | 'PurchaseReturn' | 'Manual';
    referenceId?: string;
    createdBy: any;
    lines: {
      accountCode: string;
      debit: number;
      credit: number;
      description?: string;
    }[];
  }) {
    const totalDebit = params.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = params.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.01) {
      throw new Error(`Accounting Error: Unbalanced journal entry. Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit}).`);
    }

    const resolvedLines = [];

    for (const line of params.lines) {
      const account = await Account.findOne({ code: line.accountCode });
      if (!account) {
        throw new Error(`Accounting Account with code '${line.accountCode}' not found in Chart of Accounts.`);
      }

      // Update Account balance based on natural account balance type
      // Asset & Expense: Debit increases (+), Credit decreases (-)
      // Liability, Equity, Revenue: Credit increases (+), Debit decreases (-)
      let balanceChange = 0;
      if (['Asset', 'Expense'].includes(account.type)) {
        balanceChange = line.debit - line.credit;
      } else {
        balanceChange = line.credit - line.debit;
      }

      account.balance += balanceChange;
      await account.save();

      resolvedLines.push({
        account: account._id,
        accountCode: account.code,
        accountName: account.name,
        debit: line.debit,
        credit: line.credit,
        description: line.description || params.narration,
      });
    }

    const entryNumber = `JE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const journalEntry = await JournalEntry.create({
      entryNumber,
      date: new Date(),
      narration: params.narration,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      lines: resolvedLines,
      totalDebit,
      totalCredit,
      createdBy: params.createdBy,
    });

    await logAudit({
      userId: params.createdBy,
      action: 'CREATE_JOURNAL_ENTRY',
      module: 'Accounting',
      entityId: entryNumber,
      details: `Created Journal Entry ${entryNumber} for ${params.referenceType} (${totalDebit} BDT)`,
    });

    return journalEntry;
  }
}
