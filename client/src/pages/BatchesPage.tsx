import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, Clock, ShieldX, Filter } from 'lucide-react';
import api from '../services/api';
import { Batch } from '../types';
import { DataTable, Column } from '../components/ui/DataTable';
import { useApp } from '../contexts/AppContext';

export const BatchesPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filter, setFilter] = useState<'all' | 'near_expiry_180' | 'near_expiry_30' | 'expired'>('all');
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/batches' : `/batches?filter=${filter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBatches(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load batches', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [filter]);

  const columns: Column<Batch>[] = [
    {
      header: 'Batch Number',
      cell: (b) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {b.batchNumber}
        </span>
      ),
    },
    {
      header: 'Product Name',
      cell: (b) => {
        const prod = b.product as any;
        return (
          <div>
            <p className="font-semibold text-slate-900">{prod?.name}</p>
            <p className="text-[10px] text-slate-400">
              {prod?.code} • {prod?.dosageForm}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Manufacturing Date',
      cell: (b) => new Date(b.mfgDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      header: 'Expiry Date (FEFO)',
      cell: (b) => {
        const exp = new Date(b.expDate);
        const now = new Date();
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const isExpired = diffDays <= 0;
        const isUrgent = diffDays > 0 && diffDays <= 30;
        const isWarning = diffDays > 30 && diffDays <= 90;

        return (
          <div>
            <span
              className={`font-semibold ${
                isExpired ? 'text-rose-600' : isUrgent ? 'text-rose-500' : isWarning ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {exp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <p className="text-[10px] font-medium text-slate-500">
              {isExpired ? 'Expired' : `${diffDays} days remaining`}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Available Stock',
      cell: (b) => (
        <span className="font-bold text-slate-900">
          {b.currentQuantity} / {b.initialQuantity} units
        </span>
      ),
    },
    {
      header: 'Pricing',
      cell: (b) => (
        <div>
          <span className="font-semibold text-slate-800">{formatCurrency(b.mrp)}</span>
          <p className="text-[10px] text-slate-400">Cost: {formatCurrency(b.purchasePrice)}</p>
        </div>
      ),
    },
    {
      header: 'FEFO Status',
      cell: (b) => {
        const exp = new Date(b.expDate);
        const diffDays = Math.ceil((exp.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 0) {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Expired (Blocked)
            </span>
          );
        }
        if (diffDays <= 30) {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              Critical (&lt;30d)
            </span>
          );
        }
        if (diffDays <= 90) {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Near Expiry (90d)
            </span>
          );
        }
        if (diffDays <= 180) {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Attention (180d)
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active / Prime
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Batch & Expiry Management (FEFO)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic First-Expiry-First-Out allocation, near-expiry alerts, and strict expired stock blocking.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Batches
          </button>
          <button
            onClick={() => setFilter('near_expiry_180')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filter === 'near_expiry_180' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &lt; 180 Days
          </button>
          <button
            onClick={() => setFilter('near_expiry_30')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filter === 'near_expiry_30' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &lt; 30 Days
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filter === 'expired' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={batches}
        title={`Batches Monitored (${batches.length})`}
        searchPlaceholder="Search by batch number, product name..."
        exportFileName="meditrust-batches-fefo"
      />
    </div>
  );
};
