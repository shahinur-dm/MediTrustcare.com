import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { SalesInvoice } from '../models/SalesInvoice';
import { SalesOrder } from '../models/SalesOrder';
import { PurchaseInvoice } from '../models/PurchaseInvoice';
import { Inventory } from '../models/Inventory';
import { Batch } from '../models/Batch';
import { Customer } from '../models/Customer';
import { Supplier } from '../models/Supplier';
import { Product } from '../models/Product';
import { EXPIRY_ALERT_DAYS } from '../config/constants';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filter = 'this_month', startDate, endDate } = req.query;

    let dateRangeQuery: any = {};
    const now = new Date();

    if (startDate && endDate) {
      dateRangeQuery = { createdAt: { $gte: new Date(startDate as string), $lte: new Date(endDate as string) } };
    } else if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateRangeQuery = { createdAt: { $gte: startOfDay } };
    } else if (filter === 'yesterday') {
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateRangeQuery = { createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd } };
    } else if (filter === 'last_7_days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      dateRangeQuery = { createdAt: { $gte: d7 } };
    } else if (filter === 'last_30_days') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      dateRangeQuery = { createdAt: { $gte: d30 } };
    } else if (filter === 'last_month') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      dateRangeQuery = { createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } };
    } else {
      // default: this_month
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateRangeQuery = { createdAt: { $gte: firstDayThisMonth } };
    }

    // 1. Sales & Revenue
    const salesInvoices = await SalesInvoice.find(dateRangeQuery);
    const totalSales = salesInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalRevenue = salesInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);

    // 2. Purchases
    const purchaseInvoices = await PurchaseInvoice.find(dateRangeQuery);
    const totalPurchase = purchaseInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);

    // 3. Orders
    const totalOrders = await SalesOrder.countDocuments(dateRangeQuery);
    const pendingOrders = await SalesOrder.countDocuments({ status: { $in: ['pending_approval', 'approved', 'reserved', 'picking'] } });

    // 4. Inventory Valuation & Low Stock
    const inventoryItems = await Inventory.find().populate('product');
    const totalInventoryValue = inventoryItems.reduce((acc, item) => acc + (item.totalValuation || 0), 0);
    
    let lowStockCount = 0;
    for (const item of inventoryItems) {
      const prod = item.product as any;
      if (prod && item.availableQuantity <= (prod.minStockLevel || 50)) {
        lowStockCount++;
      }
    }

    // 5. Expiry Tracking
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + EXPIRY_ALERT_DAYS.ATTENTION); // 180 days
    const nearExpiryCount = await Batch.countDocuments({
      status: { $in: ['active', 'near_expiry'] },
      currentQuantity: { $gt: 0 },
      expDate: { $lte: warningDate, $gt: now },
    });
    const expiredCount = await Batch.countDocuments({
      currentQuantity: { $gt: 0 },
      expDate: { $lte: now },
    });

    // 6. Receivables & Payables
    const customers = await Customer.find({ currentBalance: { $gt: 0 } });
    const totalReceivables = customers.reduce((acc, c) => acc + c.currentBalance, 0);

    const suppliers = await Supplier.find({ currentBalance: { $gt: 0 } });
    const totalPayables = suppliers.reduce((acc, s) => acc + s.currentBalance, 0);

    // Net Profit estimated = Sales - Purchase
    const netProfit = totalSales - totalPurchase;

    // 7. Monthly Performance Chart data (last 6 months)
    const monthlySales: { month: string; sales: number; purchase: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mNext = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${monthNames[mDate.getMonth()]} ${mDate.getFullYear()}`;

      const mInvoices = await SalesInvoice.find({ createdAt: { $gte: mDate, $lt: mNext } });
      const mSalesTotal = mInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);

      const mPurchases = await PurchaseInvoice.find({ createdAt: { $gte: mDate, $lt: mNext } });
      const mPurchTotal = mPurchases.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);

      monthlySales.push({
        month: label,
        sales: mSalesTotal,
        purchase: mPurchTotal,
      });
    }

    // 8. Top Selling Products
    const topProducts = await Product.find({ status: 'active' }).limit(5).select('name code category mrp wholesalePrice');

    // 9. Top Customers by Receivables / Purchases
    const topCustomers = await Customer.find().sort({ currentBalance: -1 }).limit(5).select('name code district currentBalance customerType');

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalSales,
          totalPurchase,
          totalOrders,
          pendingOrders,
          totalInventoryValue,
          lowStockProducts: lowStockCount,
          nearExpiryProducts: nearExpiryCount,
          expiredProducts: expiredCount,
          totalReceivables,
          totalPayables,
          netProfit,
        },
        charts: {
          monthlyPerformance: monthlySales,
          topProducts,
          topCustomers,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data', error: error.message });
  }
};
