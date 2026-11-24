import React, { useState, useEffect } from 'react';
import { Warehouse as WarehouseIcon, Building2, Plus, Thermometer, MapPin } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/ui/Modal';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    branch: '',
    address: '',
    district: 'Faridpur',
    phone: '01763-638441',
    capacitySqFt: 5000,
    temperatureControlled: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whRes, brRes] = await Promise.all([api.get('/warehouses'), api.get('/branches')]);
      if (whRes.data.success) setWarehouses(whRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (e) {
      console.error('Failed to load depots', e);
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
      await api.post('/warehouses', formData);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create warehouse');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Warehouses & Logistics Depots</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-depot storage network with GDP temperature-controlled pharmaceutical logistics.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse Depot</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <div key={wh._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                  <WarehouseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
                  <span className="font-mono text-xs text-brand-600 font-semibold">{wh.code}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Depot
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {wh.address}, {wh.district}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Branch: {wh.branch?.name || 'Central Head Office'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>
                  {wh.temperatureControlled ? 'Climate & Temperature Controlled (15°C - 25°C)' : 'Ambient Storage'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Area: {Number(wh.capacitySqFt || 5000).toLocaleString()} Sq. Ft</span>
              <span>Hotline: {wh.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Warehouse Depot">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Depot Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chattogram Regional Depot"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Depot Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WH-CTG-01"
                className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Linked Branch *</label>
              <select
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Capacity (Sq. Ft)</label>
              <input
                type="number"
                value={formData.capacitySqFt}
                onChange={(e) => setFormData({ ...formData, capacitySqFt: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Physical Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full depot street address"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tempCtrl"
              checked={formData.temperatureControlled}
              onChange={(e) => setFormData({ ...formData, temperatureControlled: e.target.checked })}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="tempCtrl" className="text-xs text-slate-700">
              GDP Temperature Controlled Depot (15°C - 25°C)
            </label>
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
              Save Depot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
