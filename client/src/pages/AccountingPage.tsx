import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Scale, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Account } from '../types';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const AccountingPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [activeTab, setActiveTab] = useState<'coa' | 'journal' | 'statements'>('coa');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [statements, setStatements] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Journal Entry Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    narration: '',
    lines: [
      { accountCode: '1000', debit: 0, credit: 0, description: '' },
      { accountCode: '4010', debit: 0, credit: 0, description: '' },
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, jeRes, stmtRes] = await Promise.all([
        api.get('/accounting/chart-of-accounts'),
        api.get('/accounting/journal-entries'),
        api.get('/accounting/financial-statements'),
      ]);
      if (accRes.data.success) setAccounts(accRes.data.data);
      if (jeRes.data.success) setJournalEntries(jeRes.data.data);
      if (stmtRes.data.success) setStatements(stmtRes.data.data);
    } catch (e) {
      console.error('Failed to load accounting data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalDebit = newEntry.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = newEntry.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert(`Journal entry must be balanced! Debit (${totalDebit}) does not equal Credit (${totalCredit}).`);
      return;
    }
    try {
      await api.post('/accounting/journal-entries', newEntry);
      setModalOpen(false);
      fetchData();
      alert('Journal entry posted successfully to general ledger!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post entry');
    }
  };

  const accountColumns: Column<Account>[] = [
    {
      header: 'Account Code',
      cell: (a) => <span className="font-mono font-bold text-slate-800">{a.code}</span>,
    },
    { header: 'Account Name', accessorKey: 'name' },
    {
      header: 'Category / Type',
      cell: (a) => {
        const typeColor: any = {
          Asset: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          Liability: 'bg-rose-50 text-rose-700 border-rose-200',
          Equity: 'bg-purple-50 text-purple-700 border-purple-200',
          Revenue: 'bg-blue-50 text-blue-700 border-blue-200',
          Expense: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeColor[a.type]}`}>
            {a.type}
          </span>
        );
      },
    },
    { header: 'Sub-Classification', accessorKey: 'subType' },
    {
      header: 'Current General Ledger Balance',
      cell: (a) => <span className="font-bold text-slate-900">{formatCurrency(a.balance)}</span>,
    },
  ];

  const journalColumns: Column<any>[] = [
    {
      header: 'Entry #',
      cell: (j) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{j.entryNumber}</span>
          <p className="text-[10px] text-slate-400">
            {new Date(j.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ),
    },
    { header: 'Narration / Description', accessorKey: 'narration' },
    {
      header: 'Debits & Credits',
      cell: (j) => (
        <div className="space-y-1">
          {j.lines?.map((line: any, idx: number) => (
            <div key={idx} className="flex justify-between text-[11px] font-mono gap-4">
              <span className="text-slate-600">{line.accountName} ({line.accountCode})</span>
              <span>
                {line.debit > 0 && <span className="text-emerald-700 font-semibold">Dr {formatCurrency(line.debit)}</span>}
                {line.credit > 0 && <span className="text-slate-700 font-semibold">Cr {formatCurrency(line.credit)}</span>}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Balanced Total',
      cell: (j) => <span className="font-bold text-slate-900">{formatCurrency(j.totalDebit)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Double-Entry Accounting & Financials</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict double-entry bookkeeping, Chart of Accounts, balanced journal entries, P&L, and balance sheet.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Manual Journal Entry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('coa')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'coa'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Chart of Accounts ({accounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'journal'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Journal Entries ({journalEntries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'statements'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Financial Statements (P&L, Balance Sheet)</span>
        </button>
      </div>

      {activeTab === 'coa' && (
        <DataTable
          columns={accountColumns}
          data={accounts}
          title="Chart of Accounts Registry"
          searchPlaceholder="Search account name, code..."
          exportFileName="meditrust-chart-of-accounts"
        />
      )}

      {activeTab === 'journal' && (
        <DataTable
          columns={journalColumns}
          data={journalEntries}
          title="General Journal Transactions"
          searchPlaceholder="Search entry number, narration..."
          exportFileName="meditrust-journal-entries"
        />
      )}

      {activeTab === 'statements' && statements && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profit & Loss */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Statement of Profit & Loss</h3>
              <p className="text-xs text-slate-400">Operating revenues and enterprise expenditures</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-800 pb-1 border-b border-slate-100">
                <span>Revenue Accounts</span>
                <span>Amount (BDT)</span>
              </div>
              {statements.profitAndLoss?.revenues?.map((r: any) => (
                <div key={r._id} className="flex justify-between text-slate-600">
                  <span>{r.name}</span>
                  <span>{formatCurrency(r.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-brand-700 pt-1 border-t border-slate-100">
                <span>Total Operating Revenue:</span>
                <span>{formatCurrency(statements.profitAndLoss?.totalRevenue || 0)}</span>
              </div>

              <div className="flex justify-between font-semibold text-slate-800 pt-4 pb-1 border-b border-slate-100">
                <span>Expense Accounts (COGS & OpEx)</span>
                <span>Amount (BDT)</span>
              </div>
              {statements.profitAndLoss?.expenses?.map((e: any) => (
                <div key={e._id} className="flex justify-between text-slate-600">
                  <span>{e.name}</span>
                  <span>{formatCurrency(e.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-rose-700 pt-1 border-t border-slate-100">
                <span>Total Operating Expenses:</span>
                <span>{formatCurrency(statements.profitAndLoss?.totalExpenses || 0)}</span>
              </div>

              <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg flex justify-between items-center text-sm font-bold text-brand-900 mt-4">
                <span>Net Operating Income:</span>
                <span>{formatCurrency(statements.profitAndLoss?.netIncome || 0)}</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Balance Sheet</h3>
              <p className="text-xs text-slate-400">Total Assets = Total Liabilities + Equity</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-800 pb-1 border-b border-slate-100">
                <span>Total Assets</span>
                <span className="font-bold text-emerald-700">{formatCurrency(statements.balanceSheet?.totalAssets || 0)}</span>
              </div>
              {statements.balanceSheet?.assets?.map((a: any) => (
                <div key={a._id} className="flex justify-between text-slate-600">
                  <span>{a.name}</span>
                  <span>{formatCurrency(a.balance)}</span>
                </div>
              ))}

              <div className="flex justify-between font-semibold text-slate-800 pt-4 pb-1 border-b border-slate-100">
                <span>Total Liabilities</span>
                <span className="font-bold text-rose-700">{formatCurrency(statements.balanceSheet?.totalLiabilities || 0)}</span>
              </div>
              {statements.balanceSheet?.liabilities?.map((l: any) => (
                <div key={l._id} className="flex justify-between text-slate-600">
                  <span>{l.name}</span>
                  <span>{formatCurrency(l.balance)}</span>
                </div>
              ))}

              <div className="flex justify-between font-semibold text-slate-800 pt-4 pb-1 border-b border-slate-100">
                <span>Total Equity & Retained Earnings</span>
                <span className="font-bold text-purple-700">{formatCurrency(statements.balanceSheet?.totalEquity || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Journal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Manual Double-Entry Journal Entry"
        subtitle="Debit must equal Credit. Enforced by database schema validation."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveJournal} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Narration / Description *</label>
            <input
              type="text"
              required
              value={newEntry.narration}
              onChange={(e) => setNewEntry({ ...newEntry, narration: e.target.value })}
              placeholder="e.g. Month-end depreciation adjustment..."
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
            <span className="text-xs font-semibold text-slate-800">Journal Lines</span>
            {newEntry.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-6">
                  <select
                    value={line.accountCode}
                    onChange={(e) => {
                      const copy = [...newEntry.lines];
                      copy[idx].accountCode = e.target.value;
                      setNewEntry({ ...newEntry, lines: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Debit"
                    value={line.debit}
                    onChange={(e) => {
                      const copy = [...newEntry.lines];
                      copy[idx].debit = Number(e.target.value);
                      if (Number(e.target.value) > 0) copy[idx].credit = 0;
                      setNewEntry({ ...newEntry, lines: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Credit"
                    value={line.credit}
                    onChange={(e) => {
                      const copy = [...newEntry.lines];
                      copy[idx].credit = Number(e.target.value);
                      if (Number(e.target.value) > 0) copy[idx].debit = 0;
                      setNewEntry({ ...newEntry, lines: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Balance Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span>Total Debit: <strong className="text-slate-800">{formatCurrency(totalDebit)}</strong></span>
              <span className="ml-4">Total Credit: <strong className="text-slate-800">{formatCurrency(totalCredit)}</strong></span>
            </div>
            <div>
              {isBalanced ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Balanced Entry
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  <AlertCircle className="w-4 h-4" /> Unbalanced (Diff: {formatCurrency(Math.abs(totalDebit - totalCredit))})
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isBalanced}
              className="px-4 py-2 bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
            >
              Post to General Ledger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
