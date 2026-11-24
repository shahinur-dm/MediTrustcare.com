import React, { useState, useEffect } from 'react';
import { Users, Plus, DollarSign, Briefcase, Calendar } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const HRPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nidNumber: '',
    department: 'Sales & Marketing',
    designation: 'Medical Information Executive',
    branch: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 35000,
    houseRentAllowance: 15000,
    medicalAllowance: 5000,
    transportAllowance: 5000,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, brRes] = await Promise.all([api.get('/hr/employees'), api.get('/branches')]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (e) {
      console.error('Failed to load HR data', e);
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
      await api.post('/hr/employees', {
        ...formData,
        employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
      });
      setModalOpen(false);
      fetchData();
      alert('Employee registered successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Employee Name',
      cell: (e) => (
        <div>
          <p className="font-semibold text-slate-900">{e.name}</p>
          <span className="font-mono text-[10px] text-slate-400">{e.employeeCode}</span>
        </div>
      ),
    },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Designation', accessorKey: 'designation' },
    {
      header: 'Phone / NID',
      cell: (e) => (
        <div>
          <p>{e.phone}</p>
          <p className="text-[10px] text-slate-400 font-mono">NID: {e.nidNumber}</p>
        </div>
      ),
    },
    {
      header: 'Gross Salary (BDT)',
      cell: (e) => <span className="font-bold text-slate-900">{formatCurrency(e.totalGrossSalary)}</span>,
    },
    {
      header: 'Status',
      cell: (e) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
          {e.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Human Resources & Payroll</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Employee directory, salary breakdown, branch assignments, and attendance records.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ ...formData, branch: branches[0]?._id || '' });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        title={`All Employees (${employees.length})`}
        searchPlaceholder="Search by name, department, designation..."
        exportFileName="meditrust-employees-hr"
      />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Enterprise Employee" maxWidth="2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">National ID (NID) *</label>
              <input
                type="text"
                required
                value={formData.nidNumber}
                onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Administration">Administration</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Accounts & Finance">Accounts & Finance</option>
                <option value="Distribution & Logistics">Distribution & Logistics</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Branch *</label>
              <select
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Basic Salary</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">House Rent</label>
              <input
                type="number"
                value={formData.houseRentAllowance}
                onChange={(e) => setFormData({ ...formData, houseRentAllowance: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Medical</label>
              <input
                type="number"
                value={formData.medicalAllowance}
                onChange={(e) => setFormData({ ...formData, medicalAllowance: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Transport</label>
              <input
                type="number"
                value={formData.transportAllowance}
                onChange={(e) => setFormData({ ...formData, transportAllowance: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
              />
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
              Save Employee Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
