import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertTriangle, UserCheck, MapPin, FileText } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const DistributionPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [challans, setChallans] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeChallan, setActiveChallan] = useState<any>(null);

  const [updateData, setUpdateData] = useState({
    status: 'dispatched',
    driverName: '',
    driverPhone: '',
    vehicleRegNumber: '',
    receiverName: '',
    proofOfDeliveryNotes: '',
    deliveryExpenses: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chalRes, vehRes] = await Promise.all([api.get('/delivery/challans'), api.get('/fleet/vehicles')]);
      if (chalRes.data.success) setChallans(chalRes.data.data);
      if (vehRes.data.success) setVehicles(vehRes.data.data);
    } catch (e) {
      console.error('Failed to load challans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenUpdate = (ch: any) => {
    setActiveChallan(ch);
    setUpdateData({
      status: ch.status === 'assigned' ? 'dispatched' : 'delivered',
      driverName: ch.driverName || 'Md. Rafiqul Islam',
      driverPhone: ch.driverPhone || '01712-998877',
      vehicleRegNumber: ch.vehicleRegNumber || 'DHAKA-METRO-TA-11-2026',
      receiverName: ch.receiverName || '',
      proofOfDeliveryNotes: ch.proofOfDeliveryNotes || '',
      deliveryExpenses: ch.deliveryExpenses || 0,
    });
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/delivery/challans/${activeChallan._id}/status`, updateData);
      setStatusModalOpen(false);
      fetchData();
      alert('Delivery Challan status and dispatch telemetry updated!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update challan');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Challan #',
      cell: (ch) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{ch.challanNumber}</span>
          <p className="text-[10px] text-slate-400">
            Ref: {ch.salesOrder?.orderNumber}
          </p>
        </div>
      ),
    },
    {
      header: 'Recipient Pharmacy',
      cell: (ch) => (
        <div>
          <p className="font-semibold text-slate-900">{ch.customer?.name}</p>
          <p className="text-[10px] text-slate-400">
            {ch.routeArea}, {ch.district}
          </p>
        </div>
      ),
    },
    {
      header: 'Vehicle & Driver',
      cell: (ch) => (
        <div>
          <p className="font-medium text-slate-800">{ch.driverName || 'Assigned Driver'}</p>
          <p className="text-[10px] font-mono text-slate-400">{ch.vehicleRegNumber || 'Van Fleet'}</p>
        </div>
      ),
    },
    {
      header: 'Delivery Status',
      cell: (ch) => {
        const statusMap: any = {
          pending: 'bg-slate-100 text-slate-700',
          assigned: 'bg-blue-50 text-blue-700 border-blue-200',
          dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
          in_transit: 'bg-amber-50 text-amber-700 border-amber-200',
          delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          failed: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMap[ch.status] || ''}`}>
            {ch.status?.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Logistics Expenses',
      cell: (ch) => formatCurrency(ch.deliveryExpenses || 0),
    },
    {
      header: 'Action',
      cell: (ch) => (
        <button
          onClick={() => handleOpenUpdate(ch)}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline"
        >
          Update Status
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Distribution & Delivery Logistics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet tracking, route planning, driver assignments, delivery challans, and proof of delivery (POD).
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={challans}
        title={`Delivery Challans (${challans.length})`}
        searchPlaceholder="Search challan number, customer..."
        exportFileName="meditrust-delivery-challans"
      />

      {/* Update Challan Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Delivery Challan — ${activeChallan?.challanNumber}`}
        subtitle={`Customer: ${activeChallan?.customer?.name}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Delivery Status *</label>
            <select
              value={updateData.status}
              onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="assigned">Assigned to Driver</option>
              <option value="dispatched">Dispatched from Warehouse</option>
              <option value="in_transit">In Transit to Destination</option>
              <option value="delivered">Delivered & Verified</option>
              <option value="returned">Returned to Depot</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Driver Name</label>
              <input
                type="text"
                value={updateData.driverName}
                onChange={(e) => setUpdateData({ ...updateData, driverName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Driver Phone</label>
              <input
                type="text"
                value={updateData.driverPhone}
                onChange={(e) => setUpdateData({ ...updateData, driverPhone: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Reg Number</label>
              <input
                type="text"
                value={updateData.vehicleRegNumber}
                onChange={(e) => setUpdateData({ ...updateData, vehicleRegNumber: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Expenses (BDT)</label>
              <input
                type="number"
                value={updateData.deliveryExpenses}
                onChange={(e) => setUpdateData({ ...updateData, deliveryExpenses: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Receiver Name (Proof of Delivery)</label>
            <input
              type="text"
              value={updateData.receiverName}
              onChange={(e) => setUpdateData({ ...updateData, receiverName: e.target.value })}
              placeholder="Name of receiving pharmacist or store in-charge"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Notes</label>
            <textarea
              value={updateData.proofOfDeliveryNotes}
              onChange={(e) => setUpdateData({ ...updateData, proofOfDeliveryNotes: e.target.value })}
              placeholder="e.g. Received in good condition with signed invoice..."
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              Commit Status Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
