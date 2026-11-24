import React, { useState, useEffect } from 'react';
import { Plus, Users, Building, ShieldCheck, MapPin, Receipt, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Customer } from '../types';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const CustomersPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [ledgerInvoices, setLedgerInvoices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    customerType: 'pharmacy',
    contactPerson: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    district: 'Faridpur',
    upazila: 'Faridpur Sadar',
    drugLicense: '',
    tradeLicense: '',
    binNumber: '',
    tinNumber: '',
    creditLimit: 300000,
    creditDays: 15,
    discountRate: 3.5,
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenLedger = async (c: Customer) => {
    setSelectedCustomer(c);
    try {
      const res = await api.get(`/customers/${c._id}/ledger`);
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
      await api.post('/customers', formData);
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Pharmacy / Healthcare Facility',
      cell: (c) => (
        <div>
          <p className="font-semibold text-slate-900">{c.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[10px] text-slate-400">{c.code}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-brand-50 text-brand-700 capitalize">
              {c.customerType}
            </span>
          </div>
        </div>
      ),
    },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    {
      header: 'Phone / Territory',
      cell: (c) => (
        <div>
          <p className="font-medium text-slate-800">{c.phone}</p>
          <p className="text-[10px] text-slate-400">
            {c.upazila}, {c.district}
          </p>
        </div>
      ),
    },
    {
      header: 'Drug License (DGDA)',
      cell: (c) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
          {c.drugLicense || 'Pending verification'}
        </span>
      ),
    },
    {
      header: 'Credit Terms',
      cell: (c) => (
        <div>
          <p className="text-slate-800">Limit: {formatCurrency(c.creditLimit)}</p>
          <p className="text-[10px] text-slate-400">
            {c.creditDays} Days • Disc: {c.discountRate}%
          </p>
        </div>
      ),
    },
    {
      header: 'Receivables (AR)',
      cell: (c) => (
        <span className={`font-bold ${c.currentBalance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
          {formatCurrency(c.currentBalance)}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (c) => (
        <button
          onClick={() => handleOpenLedger(c)}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline"
        >
          Ledger
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmacies & Healthcare CRM</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered retail pharmacies, clinic dispensaries, hospital supply accounts, and credit limits.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Pharmacy / Customer</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        title={`Registered Customers (${customers.length})`}
        searchPlaceholder="Search by pharmacy name, phone, drug license..."
        exportFileName="meditrust-customers-crm"
      />

      {/* Register Customer Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Customer / Pharmacy Account">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pharmacy / Facility Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Faridpur Model Pharmacy"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Classification *</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="pharmacy">Retail Pharmacy</option>
                <option value="hospital">Hospital Dispensary</option>
                <option value="clinic">Specialized Clinic</option>
                <option value="distributor">Sub-Distributor</option>
                <option value="retail_individual">Direct Healthcare Professional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person / Pharmacist *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone *</label>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">District *</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Upazila / Area *</label>
              <input
                type="text"
                required
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Drug License No. (DGDA)</label>
              <input
                type="text"
                value={formData.drugLicense}
                onChange={(e) => setFormData({ ...formData, drugLicense: e.target.value })}
                placeholder="DL-FDP-XXXX"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Trade License</label>
              <input
                type="text"
                value={formData.tradeLicense}
                onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">BIN Number</label>
              <input
                type="text"
                value={formData.binNumber}
                onChange={(e) => setFormData({ ...formData, binNumber: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Credit Limit (BDT)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Credit Days</label>
              <input
                type="number"
                value={formData.creditDays}
                onChange={(e) => setFormData({ ...formData, creditDays: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Discount Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.discountRate}
                onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Address *</label>
            <input
              type="text"
              required
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
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
              Save Customer Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Ledger Modal */}
      <Modal
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
        title={`Customer Ledger: ${selectedCustomer?.name}`}
        subtitle={`Current Balance Due (Accounts Receivable): ${formatCurrency(selectedCustomer?.currentBalance || 0)}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="px-3 py-2">Invoice #</th>
                <th className="px-3 py-2">Mushak-6.3</th>
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
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                    No sales invoices issued yet.
                  </td>
                </tr>
              ) : (
                ledgerInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="px-3 py-2 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-brand-700">{inv.mushakNumber}</td>
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
