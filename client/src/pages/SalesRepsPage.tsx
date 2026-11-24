import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Target, Award, MapPin } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';
import { useApp } from '../contexts/AppContext';

export const SalesRepsPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales-reps');
      if (res.data.success) {
        setReps(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load reps', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    {
      header: 'Sales Representative',
      cell: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.user?.name || 'Assigned Executive'}</p>
          <span className="font-mono text-[10px] text-slate-400">{r.employeeCode}</span>
        </div>
      ),
    },
    { header: 'Assigned Territory', accessorKey: 'territory' },
    {
      header: 'Monthly Sales Target',
      cell: (r) => <span className="font-bold text-slate-800">{formatCurrency(r.monthlySalesTarget)}</span>,
    },
    {
      header: 'Current Sales Achieved',
      cell: (r) => {
        const pct = Math.min(100, Math.round(((r.currentMonthSales || 0) / (r.monthlySalesTarget || 1)) * 100));
        return (
          <div>
            <span className="font-semibold text-emerald-600">{formatCurrency(r.currentMonthSales || 0)}</span>
            <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{pct}% achieved</span>
          </div>
        );
      },
    },
    {
      header: 'Commission Rate',
      cell: (r) => `${r.commissionRate}%`,
    },
    {
      header: 'Status',
      cell: (r) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Representative & Field Force</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Territory assignment, monthly sales targets, order collection telemetry, and commission calculations.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reps}
        title={`Field Force Representatives (${reps.length})`}
        searchPlaceholder="Search by executive name, territory..."
        exportFileName="meditrust-sales-reps"
      />
    </div>
  );
};
