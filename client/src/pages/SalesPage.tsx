import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, CheckCircle, Truck, FileText, AlertCircle, Eye } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const SalesPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewOrderModalOpen, setViewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // New Order State
  const [newOrder, setNewOrder] = useState({
    customer: '',
    branch: '',
    warehouse: '',
    items: [{ product: '', quantity: 20, unitPrice: 0, discountPercent: 0 }],
    shippingAddress: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, custRes, prodRes, whRes, brRes] = await Promise.all([
        api.get('/sales/orders'),
        api.get('/customers'),
        api.get('/products?limit=100'),
        api.get('/warehouses'),
        api.get('/branches'),
      ]);
      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (whRes.data.success) setWarehouses(whRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (e) {
      console.error('Failed to load sales data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sales/orders', newOrder);
      setCreateModalOpen(false);
      fetchData();
      alert('Sales Order booked successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book sales order');
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm('Approve this Sales Order? Stock will be allocated FEFO, Delivery Challan issued, and Mushak-6.3 invoice created.')) {
      return;
    }
    try {
      const res = await api.patch(`/sales/orders/${orderId}/approve`);
      if (res.data.success) {
        alert('Order Approved! FEFO Stock deducted, Challan created & Mushak-6.3 generated.');
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve order');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Order #',
      cell: (o) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
          <p className="text-[10px] text-slate-400">
            {new Date(o.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (o) => (
        <div>
          <p className="font-semibold text-slate-900">{o.customer?.name}</p>
          <p className="text-[10px] text-slate-400">{o.customer?.district}</p>
        </div>
      ),
    },
    { header: 'Depot', cell: (o) => o.warehouse?.name },
    {
      header: 'Grand Total',
      cell: (o) => <span className="font-bold text-slate-900">{formatCurrency(o.grandTotal)}</span>,
    },
    {
      header: 'Payment Status',
      cell: (o) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
            o.paymentStatus === 'paid'
              ? 'bg-emerald-50 text-emerald-700'
              : o.paymentStatus === 'partially_paid'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {o.paymentStatus?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Order Status',
      cell: (o) => {
        const statusMap: any = {
          pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
          approved: 'bg-blue-50 text-blue-700 border-blue-200',
          dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
          delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMap[o.status] || ''}`}>
            {o.status?.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Workflow Action',
      cell: (o) => (
        <div className="flex items-center gap-2">
          {o.status === 'pending_approval' && (
            <button
              onClick={() => handleApproveOrder(o._id)}
              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-[11px] font-medium"
            >
              Approve (FEFO)
            </button>
          )}
          <button
            onClick={() => {
              setSelectedOrder(o);
              setViewOrderModalOpen(true);
            }}
            className="p-1 text-slate-500 hover:text-slate-800"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const selectedCustObj = customers.find((c) => c._id === newOrder.customer);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Orders & Invoicing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Credit-checked order placement, FEFO automated batch reservation, and Bangladesh Mushak-6.3 tax invoice generation.
          </p>
        </div>

        <button
          onClick={() => {
            setNewOrder({
              customer: customers[0]?._id || '',
              branch: branches[0]?._id || '',
              warehouse: warehouses[0]?._id || '',
              items: [{ product: products[0]?._id || '', quantity: 20, unitPrice: products[0]?.wholesalePrice || 100, discountPercent: customers[0]?.discountRate || 0 }],
              shippingAddress: customers[0]?.deliveryAddress || '',
              notes: '',
            });
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Order</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        title={`Sales Orders (${orders.length})`}
        searchPlaceholder="Search by order number, customer..."
        exportFileName="meditrust-sales-orders"
      />

      {/* Book Sales Order Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Book New Sales Order" maxWidth="2xl">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Customer / Pharmacy *</label>
              <select
                required
                value={newOrder.customer}
                onChange={(e) => {
                  const cust = customers.find((c) => c._id === e.target.value);
                  setNewOrder({
                    ...newOrder,
                    customer: e.target.value,
                    shippingAddress: cust ? cust.deliveryAddress : '',
                  });
                }}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Pharmacy</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Branch *</label>
              <select
                required
                value={newOrder.branch}
                onChange={(e) => setNewOrder({ ...newOrder, branch: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Dispatch Depot *</label>
              <select
                required
                value={newOrder.warehouse}
                onChange={(e) => setNewOrder({ ...newOrder, warehouse: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
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

          {/* Credit Check Banner */}
          {selectedCustObj && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800">{selectedCustObj.name}</span>
                <p className="text-[10px] text-slate-500">Current Balance: {formatCurrency(selectedCustObj.currentBalance)}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-800">Credit Limit: {formatCurrency(selectedCustObj.creditLimit)}</span>
                <p className="text-[10px] text-emerald-600">
                  Available Credit: {formatCurrency(Math.max(0, selectedCustObj.creditLimit - selectedCustObj.currentBalance))}
                </p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
            <span className="text-xs font-semibold text-slate-800">Order Items</span>
            {newOrder.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-5">
                  <select
                    value={item.product}
                    onChange={(e) => {
                      const prod = products.find((p) => p._id === e.target.value);
                      const copy = [...newOrder.items];
                      copy[idx].product = e.target.value;
                      copy[idx].unitPrice = prod?.wholesalePrice || 0;
                      setNewOrder({ ...newOrder, items: copy });
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
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const copy = [...newOrder.items];
                      copy[idx].quantity = Number(e.target.value);
                      setNewOrder({ ...newOrder, items: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const copy = [...newOrder.items];
                      copy[idx].unitPrice = Number(e.target.value);
                      setNewOrder({ ...newOrder, items: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Disc %"
                    value={item.discountPercent}
                    onChange={(e) => {
                      const copy = [...newOrder.items];
                      copy[idx].discountPercent = Number(e.target.value);
                      setNewOrder({ ...newOrder, items: copy });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Address *</label>
            <input
              type="text"
              required
              value={newOrder.shippingAddress}
              onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
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
              Confirm Sales Order
            </button>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={viewOrderModalOpen}
        onClose={() => setViewOrderModalOpen(false)}
        title={`Sales Order Details — ${selectedOrder?.orderNumber}`}
        subtitle={`Total Grand Total: ${formatCurrency(selectedOrder?.grandTotal || 0)}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-slate-400">Customer:</p>
              <p className="font-semibold text-slate-800">{selectedOrder?.customer?.name}</p>
              <p className="text-slate-500 mt-1">{selectedOrder?.shippingAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Order Status:</p>
              <p className="font-bold text-brand-600 uppercase">{selectedOrder?.status}</p>
              <p className="text-slate-400 mt-1">Payment Status: <span className="font-semibold text-slate-700 capitalize">{selectedOrder?.paymentStatus}</span></p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-semibold text-slate-700">
                <th className="p-2">Item</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedOrder?.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="p-2">{item.product?.name || 'Product'}</td>
                  <td className="p-2 font-bold">{item.quantity}</td>
                  <td className="p-2">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-2 font-bold">{formatCurrency(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};
