import React, { useState, useEffect } from 'react';
import { Plus, Package, Shield, Pill, Stethoscope, Search, Download } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { DataTable, Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';

export const ProductsPage: React.FC = () => {
  const { formatCurrency } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form state
  const initialForm = {
    name: '',
    code: '',
    sku: '',
    barcode: '',
    category: 'Medicated Lotion',
    subcategory: '',
    brand: 'MediTrust',
    manufacturer: 'MediTrust Laboratories BD',
    unit: 'Bottle',
    packSize: 1,
    cartonSize: 24,
    purchasePrice: 0,
    wholesalePrice: 0,
    mrp: 0,
    vatPercentage: 15,
    isPharmaceutical: true,
    genericName: '',
    strength: '',
    dosageForm: 'Lotion',
    requiresBatchTracking: true,
    requiresExpiryTracking: true,
    storageConditions: 'Store below 25°C',
    isMedicalEquipment: false,
    modelNumber: '',
    serialNumberRequired: false,
    warrantyMonths: 0,
    minStockLevel: 50,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=100');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditProduct(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setFormData({
      name: p.name,
      code: p.code,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      subcategory: p.subcategory || '',
      brand: p.brand,
      manufacturer: p.manufacturer,
      unit: p.unit,
      packSize: p.packSize,
      cartonSize: p.cartonSize,
      purchasePrice: p.purchasePrice,
      wholesalePrice: p.wholesalePrice,
      mrp: p.mrp,
      vatPercentage: p.vatPercentage,
      isPharmaceutical: p.isPharmaceutical,
      genericName: p.genericName || '',
      strength: p.strength || '',
      dosageForm: p.dosageForm || 'Lotion',
      requiresBatchTracking: p.requiresBatchTracking,
      requiresExpiryTracking: p.requiresExpiryTracking,
      storageConditions: p.storageConditions || '',
      isMedicalEquipment: p.isMedicalEquipment || false,
      modelNumber: p.modelNumber || '',
      serialNumberRequired: false,
      warrantyMonths: 0,
      minStockLevel: p.minStockLevel || 50,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Details',
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            {p.isPharmaceutical ? <Pill className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{p.name}</p>
            <p className="text-[10px] text-slate-400">
              {p.genericName ? `${p.genericName} (${p.strength || ''})` : p.brand}
            </p>
          </div>
        </div>
      ),
    },
    { header: 'Item Code', accessorKey: 'code' },
    { header: 'Category', accessorKey: 'category' },
    {
      header: 'Pricing',
      cell: (p) => (
        <div>
          <span className="font-bold text-slate-800">{formatCurrency(p.mrp)}</span>
          <p className="text-[10px] text-slate-400">WS: {formatCurrency(p.wholesalePrice)}</p>
        </div>
      ),
    },
    {
      header: 'Pack / Carton',
      cell: (p) => (
        <span className="text-slate-600">
          {p.unit} ({p.packSize}s) • Ctn: {p.cartonSize}
        </span>
      ),
    },
    {
      header: 'Tracking',
      cell: (p) => (
        <div className="flex items-center gap-1">
          {p.requiresBatchTracking && (
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200">
              Batch
            </span>
          )}
          {p.requiresExpiryTracking && (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
              Expiry
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (p) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
          {p.status}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (p) => (
        <button
          onClick={() => handleOpenEdit(p)}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage MediTrust medicated skincare products, pharmaceuticals, clinical bundles, and supplies.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        title={`All Products (${products.length})`}
        searchPlaceholder="Search product by name, code, generic, brand..."
        exportFileName="meditrust-products-catalog"
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? `Edit Product: ${editProduct.name}` : 'Register New MediTrust Product'}
        subtitle="Ensure compliance with Bangladesh DGDA and NBR guidelines."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Product Commercial Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Medi-Ket Lotion"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Internal Item Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MT-MKL-100"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. MKL-100ML-01"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Barcode *</label>
              <input
                type="text"
                required
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 8941002026011"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Medicated Lotion">Medicated Lotion</option>
                <option value="Medicated Soap">Medicated Soap</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Face Wash">Face Wash</option>
                <option value="Hand Wash">Hand Wash</option>
                <option value="Treatment Bundles">Treatment Bundles</option>
                <option value="Medical Equipment">Medical Equipment</option>
                <option value="Hospital Supplies">Hospital Supplies</option>
              </select>
            </div>
          </div>

          {/* Pharmaceutical attributes */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-brand-600" /> Pharmaceutical & Clinical Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Generic Name</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Ketoconazole"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Strength</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g. 2% w/v"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Dosage Form</label>
                <input
                  type="text"
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  placeholder="e.g. Lotion, Soap, Cream"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Pricing & VAT */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Purchase Price (BDT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Wholesale Price (BDT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">MRP (BDT) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">VAT Percentage (%)</label>
              <input
                type="number"
                value={formData.vatPercentage}
                onChange={(e) => setFormData({ ...formData, vatPercentage: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              Save Product Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
