import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, CheckCircle2, ArrowDownLeft, ArrowUpRight, Smartphone, Building } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const PaymentsPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'CustomerCollection',
    method: 'bkash',
    amount: 10000,
    customer: '',
    supplier: '',
    referenceNumber: '',
    bankName: '',
    mfsAccountNumber: '01763-638441',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, custRes, supRes] = await Promise.all([
        api.get('/payments'),
        api.get('/customers'),
        api.get('/suppliers'),
      ]);
      if (payRes.data.success) setPayments(payRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
    } catch (e) {
      console.error('Failed to load payments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      setModalOpen(false);
      fetchData();
      alert('Payment recorded! Double-entry ledger and customer/supplier balance updated.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Payment #',
      cell: (p) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{p.paymentNumber}</span>
          <p className="text-[10px] text-slate-400">
            {new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (p) => {
        const isCollection = p.type === 'CustomerCollection';
        return (
          <span
            className={`flex items-center gap-1 font-semibold text-[11px] ${
              isCollection ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isCollection ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            {isCollection ? 'Customer Collection' : 'Supplier Payment'}
          </span>
        );
      },
    },
    {
      header: 'Party (Customer / Supplier)',
      cell: (p) => p.customer?.name || p.supplier?.name || 'Direct Expense',
    },
    {
      header: 'Payment Method',
      cell: (p) => (
        <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {p.method}
        </span>
      ),
    },
    {
      header: 'Reference / TrxID',
      cell: (p) => <span className="font-mono text-xs text-slate-500">{p.referenceNumber || 'N/A'}</span>,
    },
    {
      header: 'Amount (BDT)',
      cell: (p) => (
        <span className={`font-bold ${p.type === 'CustomerCollection' ? 'text-emerald-600' : 'text-slate-900'}`}>
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
          {p.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payments & Receipts Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer collections (bKash, Nagad, Bank, Cash, Cheque) and vendor payouts with ledger reconciliation.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              type: 'CustomerCollection',
              method: 'bkash',
              amount: 5000,
              customer: customers[0]?._id || '',
              supplier: suppliers[0]?._id || '',
              referenceNumber: `TRX-${Date.now().toString().slice(-6)}`,
              bankName: '',
              mfsAccountNumber: '01763-638441',
              notes: '',
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment / Receipt</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        title={`All Payment Transactions (${payments.length})`}
        searchPlaceholder="Search payment number, party, TrxID..."
        exportFileName="meditrust-payments-transactions"
      />

      {/* Record Payment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Financial Transaction">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="CustomerCollection">Customer Collection (Receipt)</option>
                <option value="SupplierPayment">Supplier Payout (Disbursement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method *</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="bkash">bKash Merchant</option>
                <option value="nagad">Nagad Enterprise</option>
                <option value="bank_transfer">Bank Transfer / EFT</option>
                <option value="cheque">Bank Cheque</option>
                <option value="cash">Cash in Hand</option>
              </select>
            </div>
          </div>

          {formData.type === 'CustomerCollection' ? (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Customer / Pharmacy *</label>
              <select
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Pharmacy</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} (Balance Due: {formatCurrency(c.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Supplier *</label>
              <select
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} (Payable: {formatCurrency(s.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Amount (BDT) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Reference / TrxID</label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="e.g. 9JA8410294"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Voucher Remarks</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Cleared invoice SINV-2026-0001"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              Post Payment & Update Balances
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
