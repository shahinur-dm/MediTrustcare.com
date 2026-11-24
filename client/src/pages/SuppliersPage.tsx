import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, Mail, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Supplier } from '../types';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const SuppliersPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [ledgerInvoices, setLedgerInvoices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    district: 'Dhaka',
    binNumber: '',
    tinNumber: '',
    tradeLicense: '',
    paymentTermsDays: 30,
    creditLimit: 2000000,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load suppliers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenLedger = async (sup: Supplier) => {
    setSelectedSupplier(sup);
    try {
      const res = await api.get(`/suppliers/${sup._id}/ledger`);
      if (res.data.success) {
        setLedgerInvoices(res.data.data.invoices || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLedgerModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', formData);
      setModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save supplier');
    }
  };

  const columns: Column<Supplier>[] = [
    {
      header: 'Supplier Profile',
      cell: (s) => (
        <div>
          <p className="font-semibold text-slate-900">{s.name}</p>
          <span className="font-mono text-[10px] text-slate-400">{s.code}</span>
        </div>
      ),
    },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    {
      header: 'Contact Info',
      cell: (s) => (
        <div className="text-slate-600">
          <p>{s.phone}</p>
          <p className="text-[10px] text-slate-400">{s.email}</p>
        </div>
      ),
    },
    {
      header: 'Location',
      cell: (s) => `${s.district}`,
    },
    {
      header: 'Tax Identifiers (NBR)',
      cell: (s) => (
        <div>
          <p className="text-[10px] text-slate-600">BIN: {s.binNumber || 'N/A'}</p>
          <p className="text-[10px] text-slate-400">TIN: {s.tinNumber || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Accounts Payable',
      cell: (s) => (
        <span className={`font-bold ${s.currentBalance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
          {formatCurrency(s.currentBalance)}
        </span>
      ),
    },
    {
      header: 'Ledger',
      cell: (s) => (
        <button
          onClick={() => handleOpenLedger(s)}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline"
        >
          View Ledger
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmaceutical & Packaging Suppliers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage bulk ingredient suppliers, active chemical producers, packaging partners, and credit ledgers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Supplier</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        title={`Registered Suppliers (${suppliers.length})`}
        searchPlaceholder="Search supplier by name, code, phone..."
        exportFileName="meditrust-suppliers-registry"
      />

      {/* Register Supplier Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Enterprise Supplier">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Company / Supplier Legal Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Square Pharmaceuticals Bulk Ltd."
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="017XX-XXXXXX"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">District *</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">BIN Number</label>
              <input
                type="text"
                value={formData.binNumber}
                onChange={(e) => setFormData({ ...formData, binNumber: e.target.value })}
                placeholder="003498214-0101"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">TIN Number</label>
              <input
                type="text"
                value={formData.tinNumber}
                onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                placeholder="849201948210"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Credit Limit (BDT)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Office / Factory Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Ledger Modal */}
      <Modal
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
        title={`Supplier Ledger: ${selectedSupplier?.name}`}
        subtitle={`Total Accounts Payable (Outstanding Balance): ${formatCurrency(selectedSupplier?.currentBalance || 0)}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="px-3 py-2">Invoice #</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Total Amount</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    No purchase invoices recorded yet.
                  </td>
                </tr>
              ) : (
                ledgerInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="px-3 py-2 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="px-3 py-2">{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-3 py-2 font-semibold">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-3 py-2 text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-3 py-2 font-bold text-rose-600">{formatCurrency(inv.balanceAmount)}</td>
                    <td className="px-3 py-2 capitalize">{inv.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};
