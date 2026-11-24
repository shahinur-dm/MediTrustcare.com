import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Truck, FileCheck, ClipboardList, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const PurchasesPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [activePO, setActivePO] = useState<any>(null);

  // New PO State
  const [newPO, setNewPO] = useState({
    supplier: '',
    warehouse: '',
    items: [{ product: '', orderedQuantity: 100, unitPrice: 0, vatPercentage: 0 }],
    notes: '',
  });

  // GRN State
  const [grnData, setGrnData] = useState({
    challanNumber: '',
    challanDate: new Date().toISOString().split('T')[0],
    items: [] as any[],
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prodRes, whRes] = await Promise.all([
        api.get('/purchases/orders'),
        api.get('/suppliers'),
        api.get('/products?limit=100'),
        api.get('/warehouses'),
      ]);
      if (poRes.data.success) setOrders(poRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (whRes.data.success) setWarehouses(whRes.data.data);
    } catch (e) {
      console.error('Failed to load purchase data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/purchases/orders', newPO);
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create PO');
    }
  };

  const handleApprovePO = async (poId: string) => {
    try {
      await api.patch(`/purchases/orders/${poId}/approve`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve PO');
    }
  };

  const handleOpenGRN = (po: any) => {
    setActivePO(po);
    setGrnData({
      challanNumber: `CHAL-${Date.now().toString().slice(-6)}`,
      challanDate: new Date().toISOString().split('T')[0],
      items: po.items.map((i: any) => ({
        product: i.product._id,
        name: i.product.name,
        code: i.product.code,
        orderedQuantity: i.orderedQuantity,
        receivedQuantity: i.orderedQuantity,
        acceptedQuantity: i.orderedQuantity,
        rejectedQuantity: 0,
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        mfgDate: new Date().toISOString().split('T')[0],
        expDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
        unitPrice: i.unitPrice,
        qcNotes: 'Quality verified at depot receiving',
      })),
      notes: '',
    });
    setGrnModalOpen(true);
  };

  const handleSubmitGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/purchases/receive-grn', {
        poId: activePO._id,
        challanNumber: grnData.challanNumber,
        challanDate: grnData.challanDate,
        items: grnData.items,
        notes: grnData.notes,
      });
      setGrnModalOpen(false);
      fetchData();
      alert('Goods Received! Inventory stock updated, batches created, and Accounts Payable invoice recorded.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process GRN');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'PO Number',
      cell: (po) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{po.poNumber}</span>
          <p className="text-[10px] text-slate-400">
            {new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ),
    },
    { header: 'Supplier', cell: (po) => po.supplier?.name },
    { header: 'Depot Warehouse', cell: (po) => po.warehouse?.name },
    {
      header: 'Total Items',
      cell: (po) => `${po.items?.length || 0} Products`,
    },
    {
      header: 'Grand Total (BDT)',
      cell: (po) => <span className="font-bold text-slate-900">{formatCurrency(po.grandTotal)}</span>,
    },
    {
      header: 'Status',
      cell: (po) => {
        const statusMap: any = {
          draft: 'bg-slate-100 text-slate-700 border-slate-200',
          pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
          approved: 'bg-blue-50 text-blue-700 border-blue-200',
          received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMap[po.status] || ''}`}>
            {po.status?.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Workflow Action',
      cell: (po) => (
        <div className="flex items-center gap-2">
          {po.status === 'pending_approval' && (
            <button
              onClick={() => handleApprovePO(po._id)}
              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-[11px] font-medium"
            >
              Approve PO
            </button>
          )}
          {po.status === 'approved' && (
            <button
              onClick={() => handleOpenGRN(po)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-1"
            >
              <Truck className="w-3 h-3" /> Receive GRN
            </button>
          )}
          {po.status === 'received' && (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Received
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Procurement & Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Purchase-to-Pay workflow: PO → Approval → Quality Inspection (GRN) → Batch Creation & Accounts Payable.
          </p>
        </div>

        <button
          onClick={() => {
            setNewPO({
              supplier: suppliers[0]?._id || '',
              warehouse: warehouses[0]?._id || '',
              items: [{ product: products[0]?._id || '', orderedQuantity: 100, unitPrice: products[0]?.purchasePrice || 100, vatPercentage: 0 }],
              notes: '',
            });
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        title={`Purchase Orders (${orders.length})`}
        searchPlaceholder="Search by PO number, supplier..."
        exportFileName="meditrust-purchase-orders"
      />

      {/* Create PO Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Purchase Order">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Supplier *</label>
              <select
                required
                value={newPO.supplier}
                onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Destination Depot *</label>
              <select
                required
                value={newPO.warehouse}
                onChange={(e) => setNewPO({ ...newPO, warehouse: e.target.value })}
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
            <span className="text-xs font-semibold text-slate-800">Order Items</span>
            {newPO.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-6">
                  <select
                    value={item.product}
                    onChange={(e) => {
                      const prod = products.find((p) => p._id === e.target.value);
                      const copy = [...newPO.items];
                      copy[idx].product = e.target.value;
                      copy[idx].unitPrice = prod?.purchasePrice || 0;
                      setNewPO({ ...newPO, items: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.orderedQuantity}
                    onChange={(e) => {
                      const copy = [...newPO.items];
                      copy[idx].orderedQuantity = Number(e.target.value);
                      setNewPO({ ...newPO, items: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const copy = [...newPO.items];
                      copy[idx].unitPrice = Number(e.target.value);
                      setNewPO({ ...newPO, items: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              Generate Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Goods Receive Note (GRN) & QC Modal */}
      <Modal
        isOpen={grnModalOpen}
        onClose={() => setGrnModalOpen(false)}
        title={`Goods Receive Note (GRN) — ${activePO?.poNumber}`}
        subtitle="Verifying quantities received, assigning pharmaceutical batch numbers & expiry dates."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitGRN} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Supplier Challan No. *</label>
              <input
                type="text"
                required
                value={grnData.challanNumber}
                onChange={(e) => setGrnData({ ...grnData, challanNumber: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Challan Date</label>
              <input
                type="date"
                required
                value={grnData.challanDate}
                onChange={(e) => setGrnData({ ...grnData, challanDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
            <span className="text-xs font-semibold text-slate-800">Quality & Batch Verification</span>
            {grnData.items.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{item.name}</span>
                  <span className="font-mono text-slate-500">Ordered: {item.orderedQuantity}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Accepted Qty</label>
                    <input
                      type="number"
                      required
                      value={item.acceptedQuantity}
                      onChange={(e) => {
                        const copy = [...grnData.items];
                        copy[idx].acceptedQuantity = Number(e.target.value);
                        setGrnData({ ...grnData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Batch Number *</label>
                    <input
                      type="text"
                      required
                      value={item.batchNumber}
                      onChange={(e) => {
                        const copy = [...grnData.items];
                        copy[idx].batchNumber = e.target.value.toUpperCase();
                        setGrnData({ ...grnData, items: copy });
                      }}
                      className="w-full px-2 py-1 uppercase font-mono border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={item.expDate}
                      onChange={(e) => {
                        const copy = [...grnData.items];
                        copy[idx].expDate = e.target.value;
                        setGrnData({ ...grnData, items: copy });
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setGrnModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold">
              Approve GRN & Update Inventory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
