export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  MANAGING_DIRECTOR: 'Managing Director',
  GENERAL_MANAGER: 'General Manager',
  PURCHASE_MANAGER: 'Purchase Manager',
  SALES_MANAGER: 'Sales Manager',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  ACCOUNTANT: 'Accountant',
  SALES_EXECUTIVE: 'Sales Executive',
  DELIVERY_MANAGER: 'Delivery Manager',
  DELIVERY_STAFF: 'Delivery Staff',
  HR_MANAGER: 'HR Manager',
} as const;

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
  PRINT: 'print',
} as const;

export const BD_DISTRICTS = [
  'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail',
  'Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Brahmanbaria', 'Chandpur', 'Lakshmipur', 'Noakhali', 'Khagrachhari', 'Rangamati', 'Bandarban',
  'Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Pabna', 'Sirajganj',
  'Khulna', 'Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
  'Barishal', 'Barguna', 'Bhola', 'Jhalokathi', 'Patuakhali', 'Pirojpur',
  'Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj',
  'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon',
  'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
];

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad', 'rocket'] as const;

export const ORDER_STATUSES = [
  'draft',
  'pending_approval',
  'approved',
  'reserved',
  'picking',
  'packing',
  'dispatched',
  'delivered',
  'partially_delivered',
  'cancelled',
  'returned'
] as const;

export const DELIVERY_STATUSES = [
  'pending',
  'assigned',
  'processing',
  'dispatched',
  'in_transit',
  'delivered',
  'partially_delivered',
  'failed',
  'returned'
] as const;

export const STOCK_MOVEMENT_TYPES = [
  'OPENING_STOCK',
  'PURCHASE_RECEIPT',
  'PURCHASE_RETURN',
  'SALES_DISPATCH',
  'SALES_RETURN',
  'STOCK_TRANSFER_IN',
  'STOCK_TRANSFER_OUT',
  'ADJUSTMENT_ADD',
  'ADJUSTMENT_SUBTRACT',
  'DAMAGED_WRITE_OFF',
  'EXPIRED_WRITE_OFF'
] as const;

export const EXPIRY_ALERT_DAYS = {
  CRITICAL: 30,
  WARNING: 90,
  ATTENTION: 180,
};
