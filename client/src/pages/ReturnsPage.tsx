import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const ReturnsPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [salesReturns, setSalesReturns] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    warehouse: '',
    items: [{ product: '', quantity: 5, unitPrice: 100, reason: 'damaged', qcStatus: 'passed_for_restock' }],
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [retRes, custRes, prodRes, whRes] = await Promise.all([
        api.get('/returns/sales'),
        api.get('/customers'),
        api.get('/products?limit=100'),
        api.get('/warehouses'),
      ]);
      if (retRes.data.success) setSalesReturns(retRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (whRes.data.success) setWarehouses(whRes.data.data);
    } catch (e) {
      console.error('Failed to load returns', e);
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
      await api.post('/returns/sales', formData);
      setModalOpen(false);
      fetchData();
      alert('Return request processed! Restocking rules applied and customer ledger adjusted.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process return');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Return #',
      cell: (r) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{r.returnNumber}</span>
          <p className="text-[10px] text-slate-400">
            {new Date(r.createdAt).toLocaleDateString('en-GB')}
          </p>
        </div>
      ),
    },
    { header: 'Customer', cell: (r) => r.customer?.name },
    { header: 'Warehouse Depot', cell: (r) => r.warehouse?.name },
    {
      header: 'Total Items',
      cell: (r) => `${r.items?.length || 0} Products`,
    },
    {
      header: 'Refund Amount',
      cell: (r) => <span className="font-bold text-rose-600">{formatCurrency(r.grandTotal)}</span>,
    },
    {
      header: 'Refund Status',
      cell: (r) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
          {r.refundStatus?.replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Returns, Replacements & QC Inspection</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable restocking: returned stock is inspected before restocking, scrap quarantine, or supplier return.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              customer: customers[0]?._id || '',
              warehouse: warehouses[0]?._id || '',
              items: [{ product: products[0]?._id || '', quantity: 5, unitPrice: products[0]?.wholesalePrice || 100, reason: 'damaged', qcStatus: 'passed_for_restock' }],
              notes: '',
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Return</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={salesReturns}
        title={`Sales Returns Log (${salesReturns.length})`}
        searchPlaceholder="Search return number, customer..."
        exportFileName="meditrust-sales-returns"
      />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Process Sales Return & Quality Inspection">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Customer *</label>
              <select
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Receiving Depot *</label>
              <select
                required
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
            <span className="text-xs font-semibold text-slate-800">Return Items & Inspection</span>
            {formData.items.map((item, idx) => (
              <div key={idx} className="space-y-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <select
                      value={item.product}
                      onChange={(e) => {
                        const prod = products.find((p) => p._id === e.target.value);
                        const copy = [...formData.items];
                        copy[idx].product = e.target.value;
                        copy[idx].unitPrice = prod?.wholesalePrice || 100;
                        setFormData({ ...formData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const copy = [...formData.items];
                        copy[idx].quantity = Number(e.target.value);
                        setFormData({ ...formData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const copy = [...formData.items];
                        copy[idx].unitPrice = Number(e.target.value);
                        setFormData({ ...formData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] text-slate-500">Return Reason</label>
                    <select
                      value={item.reason}
                      onChange={(e) => {
                        const copy = [...formData.items];
                        copy[idx].reason = e.target.value;
                        setFormData({ ...formData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    >
                      <option value="damaged">Damaged in Transit</option>
                      <option value="expired">Near Expiry / Expired</option>
                      <option value="incorrect_item">Incorrect Item Delivered</option>
                      <option value="quality_issue">Quality Discrepancy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">QC Restocking Action</label>
                    <select
                      value={item.qcStatus}
                      onChange={(e) => {
                        const copy = [...formData.items];
                        copy[idx].qcStatus = e.target.value;
                        setFormData({ ...formData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    >
                      <option value="passed_for_restock">Restock to Sellable Inventory</option>
                      <option value="damaged_scrap">Write Off to Damaged Scrap</option>
                      <option value="return_to_manufacturer">Return to Supplier / Factory</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
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
              Approve Return & Adjust Ledger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
