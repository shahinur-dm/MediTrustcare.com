import React, { useState, useEffect } from 'react';
import { Car, Plus, Fuel, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const FleetPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'Covered Van',
    brandModel: 'Toyota HiAce / Isuzu NPR',
    capacityKg: 1500,
    fuelType: 'Diesel',
    currentOdometer: 12500,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fleet/vehicles');
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load fleet', e);
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
      await api.post('/fleet/vehicles', formData);
      setModalOpen(false);
      fetchData();
      alert('Vehicle registered to fleet successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register vehicle');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Vehicle Reg #',
      cell: (v) => (
        <div>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {v.registrationNumber}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">{v.brandModel}</p>
        </div>
      ),
    },
    { header: 'Type', accessorKey: 'vehicleType' },
    {
      header: 'Capacity (KG)',
      cell: (v) => `${Number(v.capacityKg || 0).toLocaleString()} KG`,
    },
    { header: 'Fuel Type', accessorKey: 'fuelType' },
    {
      header: 'Odometer (KM)',
      cell: (v) => `${Number(v.currentOdometer || 0).toLocaleString()} KM`,
    },
    {
      header: 'Total Fuel / Maintenance',
      cell: (v) => (
        <div>
          <p className="text-slate-800">Fuel: {formatCurrency(v.totalFuelCost || 0)}</p>
          <p className="text-[10px] text-slate-400">Maint: {formatCurrency(v.totalMaintenanceCost || 0)}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (v) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
          {v.status?.replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fleet & Transport Logistics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution vans, fuel consumption logs, fitness document validity, and route vehicle assignments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        title={`Distribution Fleet (${vehicles.length})`}
        searchPlaceholder="Search by vehicle registration, model..."
        exportFileName="meditrust-fleet-registry"
      />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Logistics Vehicle">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Registration Plate (BRTA) *</label>
            <input
              type="text"
              required
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. DHAKA METRO-TA-11-2026"
              className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Type *</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Covered Van">Covered Van</option>
                <option value="Pickup">Pickup</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Heavy Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Brand & Model *</label>
              <input
                type="text"
                required
                value={formData.brandModel}
                onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payload Capacity (KG) *</label>
              <input
                type="number"
                required
                value={formData.capacityKg}
                onChange={(e) => setFormData({ ...formData, capacityKg: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fuel Type *</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Diesel">Diesel</option>
                <option value="Octane">Octane</option>
                <option value="Petrol">Petrol</option>
                <option value="CNG">CNG</option>
              </select>
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
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
