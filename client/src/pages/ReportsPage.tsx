import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Filter, Calendar, FileSpreadsheet, Scale, Receipt } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';
import * as XLSX from 'xlsx';

export const ReportsPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'mushak'>('sales');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '/reports/sales';
      if (activeReport === 'inventory') endpoint = '/reports/inventory-valuation';
      if (activeReport === 'mushak') endpoint = '/reports/mushak-tax';

      const res = await api.get(endpoint);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load report', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    const records = reportData.invoices || reportData.inventory || reportData.records || [];
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `meditrust-${activeReport}-report.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Intelligence & Tax Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliant NBR Mushak-6.3 registers, sales ledgers, and FEFO inventory valuation audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs no-print">
        <button
          onClick={() => setActiveReport('sales')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeReport === 'sales'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Sales & Revenue Summary</span>
        </button>
        <button
          onClick={() => setActiveReport('inventory')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeReport === 'inventory'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Inventory Valuation Audit</span>
        </button>
        <button
          onClick={() => setActiveReport('mushak')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeReport === 'mushak'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>NBR Mushak-6.3 Tax Register</span>
        </button>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Printable Letterhead */}
        <div className="border-b border-slate-200 pb-4 text-center">
          <h2 className="text-lg font-bold text-slate-900">MediTrust Care Bangladesh</h2>
          <p className="text-xs text-slate-600 font-medium">Enterprise Healthcare & Pharmaceutical Distribution ERP</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Head Office: Hospital Road, Faridpur Sadar, Dhaka • BIN: 003498214-0101 • Hotline: 01763-638441
          </p>
        </div>

        {activeReport === 'sales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <p className="text-slate-400">Total Billed Sales:</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(reportData?.summary?.totalSales || 0)}</p>
              </div>
              <div>
                <p className="text-slate-400">Total VAT Collected (15%):</p>
                <p className="text-base font-bold text-brand-600">{formatCurrency(reportData?.summary?.totalVat || 0)}</p>
              </div>
              <div>
                <p className="text-slate-400">Payments Realized:</p>
                <p className="text-base font-bold text-emerald-600">{formatCurrency(reportData?.summary?.totalCollected || 0)}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Customer / Pharmacy</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">VAT</th>
                  <th className="p-3">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.invoices?.map((inv: any) => (
                  <tr key={inv._id}>
                    <td className="p-3 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="p-3">{inv.customer?.name}</td>
                    <td className="p-3">{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                    <td className="p-3">{formatCurrency(inv.subtotal)}</td>
                    <td className="p-3 text-slate-600">{formatCurrency(inv.totalVat)}</td>
                    <td className="p-3 font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <p className="text-slate-400">Total Stock Valuation (At Cost):</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(reportData?.summary?.totalValuation || 0)}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Physical Units in Network:</p>
                <p className="text-base font-bold text-brand-600">{Number(reportData?.summary?.totalUnits || 0).toLocaleString()} Units</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Depot</th>
                  <th className="p-3">Total Qty</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Average Cost</th>
                  <th className="p-3">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.inventory?.map((item: any) => (
                  <tr key={item._id}>
                    <td className="p-3 font-semibold text-slate-800">{item.product?.name}</td>
                    <td className="p-3">{item.warehouse?.name}</td>
                    <td className="p-3">{item.totalQuantity}</td>
                    <td className="p-3 font-bold text-brand-700">{item.availableQuantity}</td>
                    <td className="p-3">{formatCurrency(item.averageCost)}</td>
                    <td className="p-3 font-bold text-slate-900">{formatCurrency(item.totalValuation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'mushak' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-emerald-900 text-sm">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার — জাতীয় রাজস্ব বোর্ড</span>
                <p className="text-emerald-700 mt-0.5">মূসক-৬.৩ কর চালানপত্র রেজিস্টার (ভ্যাট আইন ও বিধিমালা অনুযায়ী প্রস্তুতকৃত)</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">Total Output VAT: {formatCurrency(reportData?.totalVatPayable || 0)}</span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <th className="p-3">Mushak-6.3 #</th>
                  <th className="p-3">Customer Legal Name</th>
                  <th className="p-3">Buyer BIN</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Taxable Value</th>
                  <th className="p-3">VAT (15%)</th>
                  <th className="p-3">Invoice Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.records?.map((rec: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono font-bold text-brand-700">{rec.mushakNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{rec.customerName}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">{rec.customerBin}</td>
                    <td className="p-3">{new Date(rec.date).toLocaleDateString('en-GB')}</td>
                    <td className="p-3">{formatCurrency(rec.taxableValue)}</td>
                    <td className="p-3 font-semibold text-slate-800">{formatCurrency(rec.vatAmount)}</td>
                    <td className="p-3 font-bold text-slate-900">{formatCurrency(rec.totalWithVat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
