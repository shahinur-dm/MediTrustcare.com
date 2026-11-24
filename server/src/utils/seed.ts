import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Company } from '../models/Company';
import { Branch } from '../models/Branch';
import { Warehouse } from '../models/Warehouse';
import { Product } from '../models/Product';
import { Batch } from '../models/Batch';
import { Inventory } from '../models/Inventory';
import { Supplier } from '../models/Supplier';
import { Customer } from '../models/Customer';
import { Account } from '../models/Account';
import { SalesOrder } from '../models/SalesOrder';
import { SalesInvoice } from '../models/SalesInvoice';
import { PurchaseInvoice } from '../models/PurchaseInvoice';
import { ROLES } from '../config/constants';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meditrust_erp';

export const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('[Seed] Connecting to MongoDB...');
      await mongoose.connect(mongoURI);
    }
    console.log('[Seed] Connected to database. Clearing old collections...');

    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Company.deleteMany({}),
      Branch.deleteMany({}),
      Warehouse.deleteMany({}),
      Product.deleteMany({}),
      Batch.deleteMany({}),
      Inventory.deleteMany({}),
      Supplier.deleteMany({}),
      Customer.deleteMany({}),
      Account.deleteMany({}),
      SalesOrder.deleteMany({}),
      SalesInvoice.deleteMany({}),
      PurchaseInvoice.deleteMany({}),
    ]);

    // 1. Roles & Granular Permissions
    console.log('[Seed] Seeding Roles & Permissions...');
    const allActions = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'] as const;
    const modules = [
      'dashboard', 'products', 'inventory', 'purchases', 'suppliers',
      'customers', 'sales', 'distribution', 'warehouses', 'branches',
      'accounting', 'payments', 'returns', 'hr', 'fleet', 'reports', 'settings'
    ];

    const adminRole = await Role.create({
      name: ROLES.SUPER_ADMIN,
      description: 'Unrestricted enterprise super administrator access',
      permissions: modules.map((m) => ({ module: m, actions: [...allActions] })),
      isSystem: true,
    });

    const salesManagerRole = await Role.create({
      name: ROLES.SALES_MANAGER,
      description: 'Manages sales orders, pricing, customer CRM, and delivery tracking',
      permissions: [
        { module: 'dashboard', actions: ['view', 'export', 'print'] },
        { module: 'products', actions: ['view', 'export'] },
        { module: 'inventory', actions: ['view', 'export'] },
        { module: 'customers', actions: ['view', 'create', 'edit', 'export'] },
        { module: 'sales', actions: ['view', 'create', 'edit', 'approve', 'export', 'print'] },
        { module: 'distribution', actions: ['view', 'edit', 'export'] },
        { module: 'returns', actions: ['view', 'create', 'approve'] },
        { module: 'reports', actions: ['view', 'export', 'print'] },
      ],
      isSystem: true,
    });

    const warehouseManagerRole = await Role.create({
      name: ROLES.WAREHOUSE_MANAGER,
      description: 'Manages stock, batch/expiry FEFO, GRN verification, and transfers',
      permissions: [
        { module: 'dashboard', actions: ['view'] },
        { module: 'products', actions: ['view', 'create', 'edit'] },
        { module: 'inventory', actions: ['view', 'create', 'edit', 'approve', 'export'] },
        { module: 'purchases', actions: ['view', 'create', 'approve'] }, // for GRN
        { module: 'warehouses', actions: ['view', 'create', 'edit'] },
        { module: 'distribution', actions: ['view', 'edit'] },
      ],
      isSystem: true,
    });

    const accountantRole = await Role.create({
      name: ROLES.ACCOUNTANT,
      description: 'Manages double-entry accounts, collections, supplier payouts, and tax compliance',
      permissions: [
        { module: 'dashboard', actions: ['view', 'export'] },
        { module: 'accounting', actions: ['view', 'create', 'edit', 'approve', 'export', 'print'] },
        { module: 'payments', actions: ['view', 'create', 'edit', 'export', 'print'] },
        { module: 'customers', actions: ['view', 'export'] },
        { module: 'suppliers', actions: ['view', 'export'] },
        { module: 'sales', actions: ['view', 'export', 'print'] },
        { module: 'purchases', actions: ['view', 'export', 'print'] },
        { module: 'reports', actions: ['view', 'export', 'print'] },
      ],
      isSystem: true,
    });

    // 2. Company Profile
    console.log('[Seed] Seeding MediTrust Company Profile...');
    const company = await Company.create({
      name: 'MediTrust Care Bangladesh',
      legalName: 'MediTrust Healthcare & Distribution Ltd.',
      email: 'meditrust.healthcare2026@gmail.com',
      phone: '01763-638441',
      website: 'https://www.meditrustcarebd.com/',
      address: 'Faridpur, Dhaka, Bangladesh',
      district: 'Faridpur',
      binNumber: '003498214-0101',
      tinNumber: '849201948210',
      tradeLicense: 'TRAD/DSCC/2026/08942',
      drugLicense: 'DL-FD-2026-0914',
      currency: 'BDT',
      currencySymbol: '৳',
      mushakHeader: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - জাতীয় রাজস্ব বোর্ড (মূসক-৬.৩ কর চালানপত্র)',
    });

    // 3. Branches & Warehouses
    console.log('[Seed] Seeding Branches & Warehouses...');
    const faridpurBranch = await Branch.create({
      name: 'Faridpur Head Office & Central Hub',
      code: 'BR-FDP',
      address: 'Hospital Road, Faridpur Sadar',
      district: 'Faridpur',
      phone: '01763-638441',
      email: 'faridpur@meditrustcarebd.com',
      isHeadquarters: true,
      isActive: true,
    });

    const dhakaBranch = await Branch.create({
      name: 'Dhaka Regional Operations Center',
      code: 'BR-DHK',
      address: 'Dhanmondi R/A, Road 27, Dhaka',
      district: 'Dhaka',
      phone: '01819-223344',
      email: 'dhaka@meditrustcarebd.com',
      isHeadquarters: false,
      isActive: true,
    });

    const centralWarehouse = await Warehouse.create({
      name: 'Faridpur Central Pharmaceutical Depot',
      code: 'WH-FDP-01',
      branch: faridpurBranch._id,
      address: 'MediTrust Logistics Park, Faridpur Sadar',
      district: 'Faridpur',
      phone: '01763-638441',
      capacitySqFt: 12000,
      temperatureControlled: true,
      isActive: true,
    });

    const dhakaWarehouse = await Warehouse.create({
      name: 'Dhaka Metropolitan Distribution Warehouse',
      code: 'WH-DHK-01',
      branch: dhakaBranch._id,
      address: 'Tejgaon Industrial Area, Dhaka',
      district: 'Dhaka',
      phone: '01819-223344',
      capacitySqFt: 18000,
      temperatureControlled: true,
      isActive: true,
    });

    // 4. Users
    console.log('[Seed] Seeding Users with secured credentials...');
    const superAdmin = await User.create({
      name: 'Managing Director & Super Admin',
      email: 'admin@meditrust.com',
      password: 'admin123Password!',
      phone: '01763-638441',
      role: ROLES.SUPER_ADMIN,
      branch: faridpurBranch._id,
      warehouse: centralWarehouse._id,
      isActive: true,
    });

    const salesManager = await User.create({
      name: 'Kamrul Hasan',
      email: 'sales@meditrust.com',
      password: 'password123',
      phone: '01711-223344',
      role: ROLES.SALES_MANAGER,
      branch: faridpurBranch._id,
      warehouse: centralWarehouse._id,
      isActive: true,
    });

    const warehouseManager = await User.create({
      name: 'Tariqul Islam',
      email: 'warehouse@meditrust.com',
      password: 'password123',
      phone: '01722-334455',
      role: ROLES.WAREHOUSE_MANAGER,
      branch: faridpurBranch._id,
      warehouse: centralWarehouse._id,
      isActive: true,
    });

    const accountant = await User.create({
      name: 'Mahmudur Rahman',
      email: 'accounts@meditrust.com',
      password: 'password123',
      phone: '01733-445566',
      role: ROLES.ACCOUNTANT,
      branch: faridpurBranch._id,
      isActive: true,
    });

    // 5. Chart of Accounts
    console.log('[Seed] Seeding Chart of Accounts (Double Entry)...');
    const chartOfAccounts = [
      // Assets (1000 - 1999)
      { code: '1000', name: 'Cash in Hand', type: 'Asset', subType: 'Current Asset', balance: 450000, isSystem: true },
      { code: '1010', name: 'Islami Bank Bangladesh Ltd (IBBL)', type: 'Asset', subType: 'Cash Equivalent / Bank', balance: 2850000, isSystem: true },
      { code: '1015', name: 'bKash & Nagad Merchant MFS Accounts', type: 'Asset', subType: 'Cash Equivalent / MFS', balance: 350000, isSystem: true },
      { code: '1020', name: 'Merchandise Inventory', type: 'Asset', subType: 'Current Asset', balance: 1850000, isSystem: true },
      { code: '1030', name: 'Accounts Receivable (Trade Debtors)', type: 'Asset', subType: 'Current Asset', balance: 820000, isSystem: true },
      
      // Liabilities (2000 - 2999)
      { code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'Liability', subType: 'Current Liability', balance: 650000, isSystem: true },
      { code: '2020', name: 'NBR VAT Output Payable', type: 'Liability', subType: 'Current Liability', balance: 125000, isSystem: true },
      
      // Equity (3000 - 3999)
      { code: '3000', name: 'Paid-up Share Capital', type: 'Equity', subType: 'Owner Equity', balance: 5000000, isSystem: true },
      { code: '3010', name: 'Retained Earnings', type: 'Equity', subType: 'Owner Equity', balance: 745000, isSystem: true },
      
      // Revenue (4000 - 4999)
      { code: '4010', name: 'Pharmaceutical & Healthcare Sales Revenue', type: 'Revenue', subType: 'Operating Revenue', balance: 3200000, isSystem: true },
      
      // Expenses (5000 - 5999)
      { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'Expense', subType: 'Direct Expense', balance: 1950000, isSystem: true },
      { code: '5020', name: 'Salaries & Staff Allowances', type: 'Expense', subType: 'Operating Expense', balance: 420000, isSystem: true },
      { code: '5030', name: 'Warehouse Rent & Utilities', type: 'Expense', subType: 'Operating Expense', balance: 110000, isSystem: true },
      { code: '5040', name: 'Fleet Delivery & Vehicle Fuel Expenses', type: 'Expense', subType: 'Operating Expense', balance: 65000, isSystem: true },
    ];
    await Account.insertMany(chartOfAccounts);

    // 6. Products (Authentic MediTrust Portfolio)
    console.log('[Seed] Seeding Authentic MediTrust Products...');
    const productsData = [
      {
        name: 'Medi-Ket Lotion',
        code: 'MT-MKL-100',
        sku: 'MKL-100ML-01',
        barcode: '8941002026011',
        category: 'Medicated Lotion',
        subcategory: 'Anti-Dandruff & Anti-Fungal',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Laboratories BD',
        unit: 'Bottle',
        packSize: 1,
        cartonSize: 48,
        purchasePrice: 175.00,
        wholesalePrice: 220.00,
        mrp: 275.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Ketoconazole',
        strength: '2% w/v',
        dosageForm: 'Lotion',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        storageConditions: 'Store below 25°C protected from light',
        minStockLevel: 100,
        description: 'Clinically proven anti-dandruff and broad-spectrum topical anti-fungal lotion for scalp and skin application.',
        status: 'active',
      },
      {
        name: 'Medi-Scab Lotion',
        code: 'MT-MSL-60',
        sku: 'MSL-60ML-02',
        barcode: '8941002026028',
        category: 'Medicated Lotion',
        subcategory: 'Anti-Parasitic & Scabicide',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Laboratories BD',
        unit: 'Bottle',
        packSize: 1,
        cartonSize: 48,
        purchasePrice: 120.00,
        wholesalePrice: 155.00,
        mrp: 195.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Permethrin',
        strength: '5% w/v',
        dosageForm: 'Lotion',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        storageConditions: 'Store below 30°C in a dry place',
        minStockLevel: 120,
        description: 'First-line scabicidal lotion for rapid eradication of Sarcoptes scabiei mites and lice infestations.',
        status: 'active',
      },
      {
        name: 'Medi-Ket Medicated Soap',
        code: 'MT-MKS-75',
        sku: 'MKS-75G-03',
        barcode: '8941002026035',
        category: 'Medicated Soap',
        subcategory: 'Anti-Fungal Bath Bar',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Laboratories BD',
        unit: 'Piece',
        packSize: 1,
        cartonSize: 72,
        purchasePrice: 85.00,
        wholesalePrice: 110.00,
        mrp: 140.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Ketoconazole Soap',
        strength: '2% w/w',
        dosageForm: 'Soap',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        storageConditions: 'Store at room temperature in a dry soap dish',
        minStockLevel: 150,
        description: 'Medicated antifungal cleansing bar formulated for recurrent fungal skin conditions and tinea versicolor.',
        status: 'active',
      },
      {
        name: 'Medi-Scab Medicated Soap',
        code: 'MT-MSS-75',
        sku: 'MSS-75G-04',
        barcode: '8941002026042',
        category: 'Medicated Soap',
        subcategory: 'Scabies Care Soap',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Laboratories BD',
        unit: 'Piece',
        packSize: 1,
        cartonSize: 72,
        purchasePrice: 75.00,
        wholesalePrice: 98.00,
        mrp: 125.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Permethrin & Aloe Vera',
        strength: '1% w/w + Aloe Extract',
        dosageForm: 'Soap',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        storageConditions: 'Store in dry place',
        minStockLevel: 150,
        description: 'Anti-parasitic hygiene soap with soothing aloe vera for adjunct scabies treatment and infection prevention.',
        status: 'active',
      },
      {
        name: 'Medi-Ket Combo Care Pack',
        code: 'MT-MK-COMBO',
        sku: 'MK-COMBO-05',
        barcode: '8941002026059',
        category: 'Treatment Bundles',
        subcategory: 'Complete Anti-Fungal Therapy',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Laboratories BD',
        unit: 'Box',
        packSize: 1,
        cartonSize: 24,
        purchasePrice: 245.00,
        wholesalePrice: 310.00,
        mrp: 390.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Ketoconazole Lotion (100ml) + Soap (75g)',
        strength: 'Lotion 2% + Soap 2%',
        dosageForm: 'Combo Kit',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        minStockLevel: 80,
        description: 'Dual synergistic therapy pack containing Medi-Ket Medicated Lotion 100ml + Medi-Ket Medicated Soap 75g.',
        status: 'active',
      },
      {
        name: 'Medi-Scab Intensive Treatment Combo',
        code: 'MT-MS-COMBO',
        sku: 'MS-COMBO-06',
        barcode: '8941002026066',
        category: 'Treatment Bundles',
        subcategory: 'Complete Scabies Care',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Laboratories BD',
        unit: 'Box',
        packSize: 1,
        cartonSize: 24,
        purchasePrice: 180.00,
        wholesalePrice: 235.00,
        mrp: 295.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Permethrin Lotion (60ml) + Soap (75g)',
        strength: 'Lotion 5% + Soap 1%',
        dosageForm: 'Combo Kit',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        minStockLevel: 80,
        description: 'Comprehensive scabies management combo pack including Medi-Scab Lotion 60ml and Medicated Soap 75g.',
        status: 'active',
      },
      {
        name: 'MediTrust Derma Soft Cleanser / Face Wash',
        code: 'MT-DSFW-150',
        sku: 'DSFW-150ML-07',
        barcode: '8941002026073',
        category: 'Face Wash',
        subcategory: 'Dermatological Cleansers',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Healthcare Ltd.',
        unit: 'Bottle',
        packSize: 1,
        cartonSize: 36,
        purchasePrice: 190.00,
        wholesalePrice: 240.00,
        mrp: 310.00,
        vatPercentage: 15,
        isPharmaceutical: false,
        strength: '150ml',
        dosageForm: 'Gel Wash',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        minStockLevel: 60,
        description: 'Sulfate-free, pH-balanced gentle derma face cleanser for sensitive, acne-prone, and dry skin.',
        status: 'active',
      },
      {
        name: 'Medi-Clean Antiseptic Hand Wash',
        code: 'MT-MCHW-250',
        sku: 'MCHW-250ML-08',
        barcode: '8941002026080',
        category: 'Hand Wash',
        subcategory: 'Antiseptic & Hospital Grade',
        brand: 'MediTrust',
        manufacturer: 'MediTrust Healthcare Ltd.',
        unit: 'Pump Bottle',
        packSize: 1,
        cartonSize: 24,
        purchasePrice: 95.00,
        wholesalePrice: 125.00,
        mrp: 160.00,
        vatPercentage: 15,
        isPharmaceutical: true,
        genericName: 'Chlorhexidine Gluconate with Glycerin',
        strength: '0.5% w/v',
        dosageForm: 'Liquid Wash',
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        minStockLevel: 100,
        description: 'Hospital-grade antiseptic antibacterial foaming hand wash with rich skin moisturizers.',
        status: 'active',
      },
      {
        name: 'MediTrust Digital Clinical Infrared Thermometer',
        code: 'MT-IR-THERM',
        sku: 'EQ-IRT-09',
        barcode: '8941002026097',
        category: 'Medical Equipment',
        subcategory: 'Diagnostic Instruments',
        brand: 'MediTrust Care',
        manufacturer: 'MediTrust Medical Devices',
        unit: 'Unit',
        packSize: 1,
        cartonSize: 20,
        purchasePrice: 1150.00,
        wholesalePrice: 1450.00,
        mrp: 1850.00,
        vatPercentage: 7.5,
        isPharmaceutical: false,
        isMedicalEquipment: true,
        modelNumber: 'MT-DX200',
        serialNumberRequired: true,
        warrantyMonths: 12,
        requiresBatchTracking: false,
        requiresExpiryTracking: false,
        minStockLevel: 25,
        description: 'High-precision non-contact medical infrared forehead thermometer with LCD color alert.',
        status: 'active',
      },
      {
        name: 'MediTrust Nitrile Examination Gloves (Box of 100)',
        code: 'MT-GLV-100',
        sku: 'EQ-GLV-10',
        barcode: '8941002026103',
        category: 'Hospital Supplies',
        subcategory: 'Barrier Protection & PPE',
        brand: 'MediTrust Care',
        manufacturer: 'MediTrust Healthcare Supplies',
        unit: 'Box',
        packSize: 100,
        cartonSize: 10,
        purchasePrice: 420.00,
        wholesalePrice: 530.00,
        mrp: 650.00,
        vatPercentage: 7.5,
        isPharmaceutical: false,
        requiresBatchTracking: true,
        requiresExpiryTracking: true,
        minStockLevel: 50,
        description: 'Powder-free, medical examination grade nitrile protective gloves.',
        status: 'active',
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);

    // 7. Batches & Initial Real Inventory
    console.log('[Seed] Seeding FEFO Batches & Real Inventory Records...');
    const now = new Date();
    const batchList = [
      {
        product: insertedProducts[0]._id, // Medi-Ket Lotion
        warehouse: centralWarehouse._id,
        batchNumber: 'MKL26A01',
        mfgDate: new Date(2026, 0, 15),
        expDate: new Date(2028, 0, 14), // 2 years expiry
        purchasePrice: 175.00,
        mrp: 275.00,
        initialQuantity: 1200,
        currentQuantity: 850,
        status: 'active',
      },
      {
        product: insertedProducts[1]._id, // Medi-Scab Lotion
        warehouse: centralWarehouse._id,
        batchNumber: 'MSL26A02',
        mfgDate: new Date(2026, 1, 10),
        expDate: new Date(2028, 1, 9),
        purchasePrice: 120.00,
        mrp: 195.00,
        initialQuantity: 1500,
        currentQuantity: 1100,
        status: 'active',
      },
      {
        product: insertedProducts[2]._id, // Medi-Ket Soap
        warehouse: centralWarehouse._id,
        batchNumber: 'MKS26B01',
        mfgDate: new Date(2026, 2, 1),
        expDate: new Date(2028, 7, 30),
        purchasePrice: 85.00,
        mrp: 140.00,
        initialQuantity: 2000,
        currentQuantity: 1600,
        status: 'active',
      },
      {
        product: insertedProducts[3]._id, // Medi-Scab Soap
        warehouse: centralWarehouse._id,
        batchNumber: 'MSS26B02',
        mfgDate: new Date(2026, 2, 1),
        expDate: new Date(2028, 7, 30),
        purchasePrice: 75.00,
        mrp: 125.00,
        initialQuantity: 2000,
        currentQuantity: 1750,
        status: 'active',
      },
      {
        product: insertedProducts[4]._id, // Medi-Ket Combo Pack
        warehouse: centralWarehouse._id,
        batchNumber: 'MKC26C01',
        mfgDate: new Date(2026, 2, 15),
        expDate: new Date(2028, 2, 14),
        purchasePrice: 245.00,
        mrp: 390.00,
        initialQuantity: 600,
        currentQuantity: 420,
        status: 'active',
      },
      {
        product: insertedProducts[5]._id, // Medi-Scab Combo
        warehouse: centralWarehouse._id,
        batchNumber: 'MSC26C02',
        mfgDate: new Date(2026, 2, 20),
        expDate: new Date(2028, 2, 19),
        purchasePrice: 180.00,
        mrp: 295.00,
        initialQuantity: 600,
        currentQuantity: 480,
        status: 'active',
      },
      {
        product: insertedProducts[6]._id, // Derma Face Wash
        warehouse: centralWarehouse._id,
        batchNumber: 'FW26D01',
        mfgDate: new Date(2026, 1, 5),
        expDate: new Date(2028, 1, 4),
        purchasePrice: 190.00,
        mrp: 310.00,
        initialQuantity: 500,
        currentQuantity: 380,
        status: 'active',
      },
      {
        product: insertedProducts[7]._id, // Hand Wash
        warehouse: centralWarehouse._id,
        batchNumber: 'HW26E01',
        mfgDate: new Date(2026, 0, 20),
        expDate: new Date(2028, 0, 19),
        purchasePrice: 95.00,
        mrp: 160.00,
        initialQuantity: 800,
        currentQuantity: 650,
        status: 'active',
      },
    ];

    const insertedBatches = await Batch.insertMany(batchList);

    // Create Inventory records for each product
    for (let i = 0; i < insertedProducts.length; i++) {
      const prod = insertedProducts[i];
      const prodBatches = insertedBatches.filter((b) => b.product.toString() === prod._id.toString());
      const totalQty = prodBatches.reduce((acc, b) => acc + b.currentQuantity, 0) || (prod.isMedicalEquipment ? 45 : 300);

      await Inventory.create({
        product: prod._id,
        warehouse: centralWarehouse._id,
        totalQuantity: totalQty,
        availableQuantity: totalQty,
        reservedQuantity: 0,
        damagedQuantity: 0,
        returnedQuantity: 0,
        averageCost: prod.purchasePrice,
        totalValuation: totalQty * prod.purchasePrice,
        lastRestockedAt: new Date(),
      });
    }

    // 8. Suppliers
    console.log('[Seed] Seeding Suppliers with BIN/TIN records...');
    const suppliers = await Supplier.insertMany([
      {
        code: 'SUP-001',
        name: 'Square Pharmaceuticals Bulk Chemicals Ltd.',
        contactPerson: 'Engr. Mizanur Rahman',
        email: 'supply@squarepharma.com.bd',
        phone: '01713-098877',
        address: 'Square Centre, 48 Mohakhali C/A, Dhaka',
        district: 'Dhaka',
        binNumber: '000184920-0101',
        tinNumber: '584920194820',
        tradeLicense: 'TRAD/DNCC/2026/04912',
        paymentTermsDays: 30,
        creditLimit: 5000000,
        currentBalance: 320000,
        isActive: true,
      },
      {
        code: 'SUP-002',
        name: 'Renata Active Pharmaceutical Ingredients Div.',
        contactPerson: 'Kazi Ashfaqur Rahman',
        email: 'api@renatabd.com',
        phone: '01711-556677',
        address: 'Plot 1, Milk Vita Road, Mirpur-7, Dhaka',
        district: 'Dhaka',
        binNumber: '000294819-0102',
        tinNumber: '748291049281',
        tradeLicense: 'TRAD/DNCC/2026/08914',
        paymentTermsDays: 45,
        creditLimit: 4000000,
        currentBalance: 180000,
        isActive: true,
      },
      {
        code: 'SUP-003',
        name: 'Bengal Plastic & Medical Packaging Ltd.',
        contactPerson: 'Mohammad Shahidul Islam',
        email: 'sales@bengalplastic.com',
        phone: '01911-334455',
        address: 'Tejgaon Industrial Area, Dhaka',
        district: 'Dhaka',
        binNumber: '000384918-0101',
        tinNumber: '928374819201',
        paymentTermsDays: 15,
        creditLimit: 1500000,
        currentBalance: 150000,
        isActive: true,
      },
    ]);

    // 9. Customers (Pharmacies, Hospitals, Clinics)
    console.log('[Seed] Seeding Customers (Pharmacies, Clinics, Hospitals)...');
    const customers = await Customer.insertMany([
      {
        code: 'CUST-FDP-01',
        name: 'Faridpur Model Pharmacy & Derma Care',
        customerType: 'pharmacy',
        contactPerson: 'Dr. Shahabuddin Ahmed',
        email: 'modelpharmacy.fdp@gmail.com',
        phone: '01712-445566',
        deliveryAddress: 'Main Gate, Faridpur Medical College Hospital, Faridpur Sadar',
        district: 'Faridpur',
        upazila: 'Faridpur Sadar',
        drugLicense: 'DL-FDP-2024-0012',
        tradeLicense: 'TRAD/FMC/2026/012',
        binNumber: '001928471-0201',
        creditLimit: 500000,
        creditDays: 15,
        currentBalance: 145000,
        discountRate: 3.5,
        status: 'active',
      },
      {
        code: 'CUST-FDP-02',
        name: 'Popular Diagnostic & Skin Clinic Ltd.',
        customerType: 'clinic',
        contactPerson: 'Nazmul Huda',
        email: 'fdp.popular@diagnostic.com',
        phone: '01819-887766',
        deliveryAddress: 'Mujib Sarak, Faridpur Sadar',
        district: 'Faridpur',
        upazila: 'Faridpur Sadar',
        drugLicense: 'DL-FDP-2023-0891',
        tradeLicense: 'TRAD/FMC/2026/089',
        binNumber: '002847192-0202',
        creditLimit: 600000,
        creditDays: 30,
        currentBalance: 210000,
        discountRate: 5.0,
        status: 'active',
      },
      {
        code: 'CUST-DHK-03',
        name: 'Green Life Medical College & Hospital Dispensary',
        customerType: 'hospital',
        contactPerson: 'Major (Retd.) Dr. Enamul Karim',
        email: 'dispensary@greenlife.edu.bd',
        phone: '01713-221100',
        deliveryAddress: '32 Green Road, Dhanmondi, Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        drugLicense: 'DL-DHK-2022-1082',
        tradeLicense: 'TRAD/DSCC/2026/194',
        binNumber: '004918274-0101',
        creditLimit: 1200000,
        creditDays: 30,
        currentBalance: 345000,
        discountRate: 6.0,
        status: 'active',
      },
      {
        code: 'CUST-DHK-04',
        name: 'Lazz Pharma (Kalabagan Branch)',
        customerType: 'pharmacy',
        contactPerson: 'Saiful Islam',
        email: 'kalabagan@lazzpharma.com',
        phone: '01711-998877',
        deliveryAddress: 'Mirpur Road, Kalabagan, Dhaka',
        district: 'Dhaka',
        upazila: 'Kalabagan',
        drugLicense: 'DL-DHK-2021-0045',
        tradeLicense: 'TRAD/DSCC/2026/045',
        binNumber: '003928174-0102',
        creditLimit: 800000,
        creditDays: 15,
        currentBalance: 120000,
        discountRate: 4.0,
        status: 'active',
      },
    ]);

    // 10. Sample Transactions for Realistic Dashboard
    console.log('[Seed] Seeding Linked Sales and Invoices for Real DB Calculations...');
    const sampleOrder = await SalesOrder.create({
      orderNumber: 'SO-2026-0001',
      customer: customers[0]._id,
      branch: faridpurBranch._id,
      warehouse: centralWarehouse._id,
      orderDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      items: [
        {
          product: insertedProducts[0]._id,
          batch: insertedBatches[0]._id,
          quantity: 50,
          unitPrice: 220.00,
          discountPercent: 3.5,
          discountAmount: 385.00,
          vatPercent: 15,
          vatAmount: 1592.25,
          totalAmount: 12207.25,
        },
        {
          product: insertedProducts[1]._id,
          batch: insertedBatches[1]._id,
          quantity: 40,
          unitPrice: 155.00,
          discountPercent: 3.5,
          discountAmount: 217.00,
          vatPercent: 15,
          vatAmount: 897.45,
          totalAmount: 6880.45,
        },
      ],
      subtotal: 17200.00,
      totalDiscount: 602.00,
      totalVat: 2489.70,
      grandTotal: 19087.70,
      paidAmount: 10000.00,
      paymentStatus: 'partially_paid',
      status: 'delivered',
      deliveryStatus: 'delivered',
      shippingAddress: customers[0].deliveryAddress,
      createdBy: superAdmin._id,
      approvedBy: salesManager._id,
    });

    await SalesInvoice.create({
      invoiceNumber: 'SINV-2026-0001',
      mushakNumber: 'MUSHAK-6.3-000841',
      salesOrder: sampleOrder._id,
      customer: customers[0]._id,
      branch: faridpurBranch._id,
      warehouse: centralWarehouse._id,
      invoiceDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 13),
      items: sampleOrder.items,
      subtotal: sampleOrder.subtotal,
      totalDiscount: sampleOrder.totalDiscount,
      totalVat: sampleOrder.totalVat,
      grandTotal: sampleOrder.grandTotal,
      paidAmount: 10000.00,
      balanceAmount: 9087.70,
      paymentStatus: 'partially_paid',
      deliveryStatus: 'delivered',
      createdBy: superAdmin._id,
    });

    console.log('[Seed] Database successfully seeded with authentic MediTrust Care BD records!');
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]', error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}
