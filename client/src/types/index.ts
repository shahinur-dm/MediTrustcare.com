export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch?: string;
  warehouse?: string;
  avatar?: string;
}

export interface Permission {
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print')[];
}

export interface Product {
  _id: string;
  name: string;
  code: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory?: string;
  brand: string;
  manufacturer: string;
  unit: string;
  packSize: number;
  cartonSize: number;
  purchasePrice: number;
  wholesalePrice: number;
  mrp: number;
  vatPercentage: number;
  isPharmaceutical: boolean;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  requiresBatchTracking: boolean;
  requiresExpiryTracking: boolean;
  storageConditions?: string;
  isMedicalEquipment?: boolean;
  modelNumber?: string;
  minStockLevel: number;
  status: 'active' | 'inactive' | 'discontinued';
}

export interface Batch {
  _id: string;
  batchNumber: string;
  product: Product | string;
  warehouse: any;
  mfgDate: string;
  expDate: string;
  purchasePrice: number;
  mrp: number;
  initialQuantity: number;
  currentQuantity: number;
  status: 'active' | 'near_expiry' | 'expired' | 'recalled';
}

export interface InventoryItem {
  _id: string;
  product: Product;
  warehouse: {
    _id: string;
    name: string;
    code: string;
    district: string;
  };
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  returnedQuantity: number;
  averageCost: number;
  totalValuation: number;
}

export interface Customer {
  _id: string;
  code: string;
  name: string;
  customerType: 'pharmacy' | 'hospital' | 'clinic' | 'distributor' | 'retail_individual';
  contactPerson: string;
  email?: string;
  phone: string;
  deliveryAddress: string;
  district: string;
  upazila: string;
  binNumber?: string;
  tinNumber?: string;
  drugLicense?: string;
  creditLimit: number;
  creditDays: number;
  currentBalance: number;
  discountRate: number;
  status: 'active' | 'suspended' | 'blacklisted';
}

export interface Supplier {
  _id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  binNumber?: string;
  tinNumber?: string;
  tradeLicense?: string;
  currentBalance: number;
  creditLimit: number;
}

export interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: Customer;
  warehouse: any;
  orderDate: string;
  items: {
    product: Product;
    batch?: Batch;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
  }[];
  subtotal: number;
  totalDiscount: number;
  totalVat: number;
  grandTotal: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  status: string;
  deliveryStatus: string;
  shippingAddress: string;
}

export interface DeliveryChallan {
  _id: string;
  challanNumber: string;
  salesOrder: any;
  customer: Customer;
  warehouse: any;
  driverName?: string;
  driverPhone?: string;
  vehicleRegNumber?: string;
  routeArea: string;
  district: string;
  status: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  receiverName?: string;
  deliveryExpenses: number;
}

export interface Account {
  _id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  balance: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}
