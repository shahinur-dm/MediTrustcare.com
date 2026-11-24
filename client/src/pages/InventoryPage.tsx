import React, { useState, useEffect } from 'react';
import { Boxes, ArrowLeftRight, SlidersHorizontal, AlertTriangle, History } from 'lucide-react';
import api from '../services/api';
import { InventoryItem } from '../types';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const InventoryPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [loading, setLoading] = useState(true);

  // Modals
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Adjustment Form
  const [adjData, setAdjData] = useState({
    warehouse: '',
    product: '',
    reason: 'physical_count',
    systemQuantity: 0,
    countedQuantity: 0,
    unitCost: 0,
    notes: '',
  });

  // Transfer Form
  const [trfData, setTrfData] = useState({
    sourceWarehouse: '',
    targetWarehouse: '',
    product: '',
    quantity: 1,
    notes: '',
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/summary');
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load inventory', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get('/inventory/movements?limit=100');
      if (res.data.success) {
        setMovements(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load movements', e);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, []);

  const handleOpenAdjust = (item?: InventoryItem) => {
    if (item) {
      setAdjData({
        warehouse: item.warehouse._id,
        product: item.product._id,
        reason: 'physical_count',
        systemQuantity: item.totalQuantity,
        countedQuantity: item.totalQuantity,
        unitCost: item.averageCost || item.product.purchasePrice,
        notes: '',
      });
    }
    setAdjModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjustments', {
        warehouse: adjData.warehouse,
        reason: adjData.reason,
        items: [
          {
            product: adjData.product,
            systemQuantity: adjData.systemQuantity,
            countedQuantity: adjData.countedQuantity,
            unitCost: adjData.unitCost,
          },
        ],
        notes: adjData.notes,
      });
      setAdjModalOpen(false);
      fetchInventory();
      fetchMovements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to apply adjustment');
    }
  };

  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trfData.sourceWarehouse === trfData.targetWarehouse) {
      alert('Source and target warehouses cannot be the same');
      return;
    }
    try {
      await api.post('/inventory/transfers', {
        sourceWarehouse: trfData.sourceWarehouse,
        targetWarehouse: trfData.targetWarehouse,
        items: [
          {
            product: trfData.product,
            quantity: trfData.quantity,
          },
        ],
        notes: trfData.notes,
      });
      setTransferModalOpen(false);
      fetchInventory();
      fetchMovements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to transfer stock');
    }
  };

  const inventoryColumns: Column<InventoryItem>[] = [
    {
      header: 'Product',
      cell: (i) => (
        <div>
          <p className="font-semibold text-slate-900">{i.product?.name}</p>
          <p className="text-[10px] text-slate-400">
            {i.product?.code} • {i.product?.category}
          </p>
        </div>
      ),
    },
    {
      header: 'Warehouse Depot',
      cell: (i) => (
        <div>
          <span className="font-medium text-slate-800">{i.warehouse?.name}</span>
          <p className="text-[10px] text-slate-400">{i.warehouse?.district}</p>
        </div>
      ),
    },
    {
      header: 'Available Stock',
      cell: (i) => {
        const isLow = i.availableQuantity <= (i.product?.minStockLevel || 50);
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
              {i.availableQuantity} {i.product?.unit}s
            </span>
            {isLow && (
              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-semibold">
                Low
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Reserved / Damaged',
      cell: (i) => (
        <span className="text-slate-500">
          Res: {i.reservedQuantity} | Dmg: {i.damagedQuantity}
        </span>
      ),
    },
    {
      header: 'Valuation',
      cell: (i) => (
        <div>
          <span className="font-semibold text-slate-800">{formatCurrency(i.totalValuation)}</span>
          <p className="text-[10px] text-slate-400">@ {formatCurrency(i.averageCost || 0)}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: (i) => (
        <button
          onClick={() => handleOpenAdjust(i)}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline"
        >
          Adjust Stock
        </button>
      ),
    },
  ];

  const movementColumns: Column<any>[] = [
    { header: 'Movement ID', accessorKey: 'movementNumber' },
    {
      header: 'Type',
      cell: (m) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 font-mono">
          {m.type}
        </span>
      ),
    },
    {
      header: 'Product',
      cell: (m) => (
        <div>
          <p className="font-medium text-slate-900">{m.product?.name}</p>
          <p className="text-[10px] text-slate-400">{m.batch?.batchNumber || 'N/A'}</p>
        </div>
      ),
    },
    { header: 'Depot', cell: (m) => m.warehouse?.name },
    {
      header: 'Stock Change',
      cell: (m) => (
        <span className={`font-bold ${m.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
        </span>
      ),
    },
    {
      header: 'New Balance',
      cell: (m) => <span className="font-medium text-slate-800">{m.newStock}</span>,
    },
    {
      header: 'Ref Document',
      cell: (m) => (
        <div>
          <p className="text-slate-700">{m.referenceDocType}</p>
          <p className="text-[10px] text-slate-400 font-mono">{m.referenceDocId}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Real-Time Inventory & Stock Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict FEFO movement ledger, warehouse-level valuation, and physical stock reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdjust()}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Stock Adjustment</span>
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Warehouse Transfer</span>
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Current Stock Positions ({inventory.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Stock Ledger ({movements.length})</span>
        </button>
      </div>

      {activeTab === 'stock' ? (
        <DataTable
          columns={inventoryColumns}
          data={inventory}
          title="Warehouse Stock Breakdown"
          searchPlaceholder="Search by product name, item code..."
          exportFileName="meditrust-inventory-stock"
        />
      ) : (
        <DataTable
          columns={movementColumns}
          data={movements}
          title="Complete Stock Movement History"
          searchPlaceholder="Search movement ID, doc number..."
          exportFileName="meditrust-stock-ledger"
        />
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjModalOpen}
        onClose={() => setAdjModalOpen(false)}
        title="Physical Stock Adjustment"
        subtitle="Every adjustment creates an immutable ledger movement record."
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Warehouse Depot *</label>
            <select
              required
              value={adjData.warehouse}
              onChange={(e) => setAdjData({ ...adjData, warehouse: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Select Warehouse</option>
              {Array.from(new Set(inventory.map((i) => JSON.stringify(i.warehouse)))).map((str) => {
                const wh = JSON.parse(str);
                return (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.district})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Product *</label>
            <select
              required
              value={adjData.product}
              onChange={(e) => {
                const found = inventory.find(
                  (i) => i.product._id === e.target.value && i.warehouse._id === adjData.warehouse
                );
                setAdjData({
                  ...adjData,
                  product: e.target.value,
                  systemQuantity: found ? found.totalQuantity : 0,
                  countedQuantity: found ? found.totalQuantity : 0,
                  unitCost: found ? found.averageCost : 0,
                });
              }}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Select Product</option>
              {inventory.map((i) => (
                <option key={i._id} value={i.product._id}>
                  {i.product?.name} ({i.product?.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">System Quantity</label>
              <input
                type="number"
                readOnly
                value={adjData.systemQuantity}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Physical Counted Quantity *</label>
              <input
                type="number"
                required
                value={adjData.countedQuantity}
                onChange={(e) => setAdjData({ ...adjData, countedQuantity: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Variance (Adjustment Change):</span>
            <span
              className={`font-bold ${
                adjData.countedQuantity - adjData.systemQuantity >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {adjData.countedQuantity - adjData.systemQuantity > 0 ? '+' : ''}
              {adjData.countedQuantity - adjData.systemQuantity} units
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Adjustment Reason *</label>
            <select
              value={adjData.reason}
              onChange={(e) => setAdjData({ ...adjData, reason: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="physical_count">Physical Audit Verification</option>
              <option value="damaged">Damaged in Warehouse Handling</option>
              <option value="expired">Expired Write-Off</option>
              <option value="sample_distribution">Clinical Samples Distribution</option>
              <option value="theft">Pilferage / Discrepancy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Verification Remarks</label>
            <textarea
              value={adjData.notes}
              onChange={(e) => setAdjData({ ...adjData, notes: e.target.value })}
              placeholder="e.g. Annual audit count by warehouse lead..."
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdjModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              Commit Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Transfer Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Inter-Warehouse Depot Transfer"
        subtitle="Transfer goods between Faridpur and Dhaka regional distribution centers."
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Source Depot *</label>
              <select
                required
                value={trfData.sourceWarehouse}
                onChange={(e) => setTrfData({ ...trfData, sourceWarehouse: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Source</option>
                {Array.from(new Set(inventory.map((i) => JSON.stringify(i.warehouse)))).map((str) => {
                  const wh = JSON.parse(str);
                  return (
                    <option key={wh._id} value={wh._id}>
                      {wh.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Destination Depot *</label>
              <select
                required
                value={trfData.targetWarehouse}
                onChange={(e) => setTrfData({ ...trfData, targetWarehouse: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Select Destination</option>
                {Array.from(new Set(inventory.map((i) => JSON.stringify(i.warehouse)))).map((str) => {
                  const wh = JSON.parse(str);
                  return (
                    <option key={wh._id} value={wh._id}>
                      {wh.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Product *</label>
            <select
              required
              value={trfData.product}
              onChange={(e) => setTrfData({ ...trfData, product: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Select Product to Transfer</option>
              {inventory.map((i) => (
                <option key={i._id} value={i.product._id}>
                  {i.product?.name} ({i.product?.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={trfData.quantity}
              onChange={(e) => setTrfData({ ...trfData, quantity: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Notes</label>
            <textarea
              value={trfData.notes}
              onChange={(e) => setTrfData({ ...trfData, notes: e.target.value })}
              placeholder="e.g. Stock replenishment for Dhaka region..."
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
