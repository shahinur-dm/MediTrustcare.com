import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/rbac';

// Controllers
import * as authController from '../controllers/authController';
import * as dashboardController from '../controllers/dashboardController';
import * as productController from '../controllers/productController';
import * as inventoryController from '../controllers/inventoryController';
import * as purchaseController from '../controllers/purchaseController';
import * as supplierController from '../controllers/supplierController';
import * as customerController from '../controllers/customerController';
import * as salesController from '../controllers/salesController';
import * as distributionController from '../controllers/distributionController';
import * as warehouseController from '../controllers/warehouseController';
import * as batchController from '../controllers/batchController';
import * as salesRepController from '../controllers/salesRepController';
import * as accountingController from '../controllers/accountingController';
import * as paymentController from '../controllers/paymentController';
import * as returnsController from '../controllers/returnsController';
import * as hrController from '../controllers/hrController';
import * as fleetController from '../controllers/fleetController';
import * as reportController from '../controllers/reportController';
import * as notificationController from '../controllers/notificationController';
import * as settingsController from '../controllers/settingsController';

const router = Router();

// --- Auth Routes (Public) ---
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);

// --- Protected Routes ---
router.use(authenticate);

// Profile
router.get('/auth/me', authController.getMe);
router.post('/auth/logout', authController.logout);

// Module 01: Dashboard
router.get('/dashboard/summary', dashboardController.getDashboardSummary);

// Module 02: Products
router.get('/products', checkPermission('products', 'view'), productController.getProducts);
router.get('/products/:id', checkPermission('products', 'view'), productController.getProductById);
router.post('/products', checkPermission('products', 'create'), productController.createProduct);
router.put('/products/:id', checkPermission('products', 'edit'), productController.updateProduct);
router.delete('/products/:id', checkPermission('products', 'delete'), productController.deleteProduct);

// Module 03: Inventory & Stock Movements
router.get('/inventory/summary', checkPermission('inventory', 'view'), inventoryController.getInventorySummary);
router.get('/inventory/movements', checkPermission('inventory', 'view'), inventoryController.getStockMovements);
router.post('/inventory/adjustments', checkPermission('inventory', 'create'), inventoryController.createStockAdjustment);
router.post('/inventory/transfers', checkPermission('inventory', 'create'), inventoryController.createStockTransfer);

// Module 04: Purchase Management
router.get('/purchases/orders', checkPermission('purchases', 'view'), purchaseController.getPurchaseOrders);
router.post('/purchases/orders', checkPermission('purchases', 'create'), purchaseController.createPurchaseOrder);
router.patch('/purchases/orders/:id/approve', checkPermission('purchases', 'approve'), purchaseController.approvePurchaseOrder);
router.post('/purchases/receive-grn', checkPermission('purchases', 'create'), purchaseController.receiveGoodsGRN);

// Module 05: Suppliers
router.get('/suppliers', checkPermission('suppliers', 'view'), supplierController.getSuppliers);
router.post('/suppliers', checkPermission('suppliers', 'create'), supplierController.createSupplier);
router.get('/suppliers/:id/ledger', checkPermission('suppliers', 'view'), supplierController.getSupplierLedger);

// Module 06: Customers & Pharmacies CRM
router.get('/customers', checkPermission('customers', 'view'), customerController.getCustomers);
router.post('/customers', checkPermission('customers', 'create'), customerController.createCustomer);
router.get('/customers/:id/ledger', checkPermission('customers', 'view'), customerController.getCustomerLedger);

// Module 07: Sales Management
router.get('/sales/orders', checkPermission('sales', 'view'), salesController.getSalesOrders);
router.post('/sales/orders', checkPermission('sales', 'create'), salesController.createSalesOrder);
router.patch('/sales/orders/:id/approve', checkPermission('sales', 'approve'), salesController.approveSalesOrder);

// Module 08: Distribution & Delivery
router.get('/delivery/challans', checkPermission('distribution', 'view'), distributionController.getDeliveryChallans);
router.patch('/delivery/challans/:id/status', checkPermission('distribution', 'edit'), distributionController.updateDeliveryStatus);

// Module 09: Warehouses & Branches
router.get('/warehouses', warehouseController.getWarehouses);
router.post('/warehouses', checkPermission('warehouses', 'create'), warehouseController.createWarehouse);
router.get('/branches', warehouseController.getBranches);
router.post('/branches', checkPermission('branches', 'create'), warehouseController.createBranch);

// Module 10: Batches & Expiry Management
router.get('/batches', checkPermission('inventory', 'view'), batchController.getBatches);

// Module 11: Sales Representatives
router.get('/sales-reps', salesRepController.getSalesReps);
router.post('/sales-reps', checkPermission('sales', 'create'), salesRepController.createSalesRep);

// Module 12: Accounting & Finance
router.get('/accounting/chart-of-accounts', checkPermission('accounting', 'view'), accountingController.getChartOfAccounts);
router.get('/accounting/journal-entries', checkPermission('accounting', 'view'), accountingController.getJournalEntries);
router.post('/accounting/journal-entries', checkPermission('accounting', 'create'), accountingController.createManualJournalEntry);
router.get('/accounting/financial-statements', checkPermission('accounting', 'view'), accountingController.getFinancialStatements);

// Module 13: Payments
router.get('/payments', checkPermission('payments', 'view'), paymentController.getPayments);
router.post('/payments', checkPermission('payments', 'create'), paymentController.createPayment);

// Module 14: Returns & Replacements
router.get('/returns/sales', checkPermission('returns', 'view'), returnsController.getSalesReturns);
router.post('/returns/sales', checkPermission('returns', 'create'), returnsController.createSalesReturn);
router.get('/returns/purchases', checkPermission('returns', 'view'), returnsController.getPurchaseReturns);

// Module 15: HR & Payroll
router.get('/hr/employees', checkPermission('hr', 'view'), hrController.getEmployees);
router.post('/hr/employees', checkPermission('hr', 'create'), hrController.createEmployee);

// Module 16: Fleet Management
router.get('/fleet/vehicles', checkPermission('fleet', 'view'), fleetController.getVehicles);
router.post('/fleet/vehicles', checkPermission('fleet', 'create'), fleetController.createVehicle);

// Module 17: Reports & Business Intelligence
router.get('/reports/sales', checkPermission('reports', 'view'), reportController.getSalesReport);
router.get('/reports/inventory-valuation', checkPermission('reports', 'view'), reportController.getInventoryValuationReport);
router.get('/reports/mushak-tax', checkPermission('reports', 'view'), reportController.getMushakTaxReport);

// Module 18: Notifications
router.get('/notifications', notificationController.getNotifications);
router.post('/notifications/mark-read', notificationController.markAsRead);

// Module 19 & 20: System Settings, Audit Logs, Users & Roles
router.get('/settings/company', settingsController.getCompanySettings);
router.put('/settings/company', checkPermission('settings', 'edit'), settingsController.updateCompanySettings);
router.get('/settings/audit-logs', checkPermission('settings', 'view'), settingsController.getAuditLogs);
router.get('/settings/users-roles', checkPermission('settings', 'view'), settingsController.getUsersAndRoles);

export default router;
