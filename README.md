# MediTrust Care Bangladesh — Enterprise Healthcare & Distribution ERP System

Official Corporate Website: [https://www.meditrustcarebd.com/](https://www.meditrustcarebd.com/)  
Corporate Headquarters: Hospital Road, Faridpur Sadar, Dhaka, Bangladesh  
Contact Hotline: `01763-638441`  
Corporate Email: `meditrust.healthcare2026@gmail.com`  

---

## 1. System Architecture Overview

MediTrust ERP is a complete, scalable, multi-branch, multi-warehouse Enterprise Resource Planning platform tailored specifically to the pharmaceutical and dermatological distribution landscape in Bangladesh.

### Technology Stack:
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query, React Hook Form, Zod, Recharts, XLSX.
- **Backend**: Node.js, Express.js, TypeScript, REST API, JWT with token rotation, Role-Based Access Control (RBAC), Socket.IO, Helmet, Morgan.
- **Database**: MongoDB Atlas / Mongoose with indexed schemas, transactions, and audit trails.
- **Localization**: Bangladesh BDT (`৳`), 64 Districts & Upazilas, NBR Mushak-6.3 Tax registers, BIN & TIN tracking, MFS (bKash & Nagad) reconciliation.

---

## 2. ERP Modules (All 20 Modules Functional)

1. **Dashboard**: Live DB aggregated KPIs (Sales, Revenue, Purchases, Inventory Value, AR, AP, Net Profit, Expired Batches), Recharts trendlines, and top customer accounts.
2. **Product Catalog**: Full pharmaceutical & medical device catalog (Medi-Ket, Medi-Scab, Medicated Soaps, Face Wash, Hand Wash, Thermometers, Gloves) with pack size, carton size, generic, strength, dosage form, and DGDA parameters.
3. **Inventory Management**: Real-time multi-depot stock, physical stock adjustments, inter-warehouse transfers, and immutable stock movement ledger.
4. **Procurement**: Purchase requisitions, PO creation, approval workflow, and Quality Verification (GRN) with batch creation.
5. **Supplier Management**: Ingredient and packaging vendors, trade licenses, BIN/TIN, credit terms, and purchase ledgers.
6. **Customer CRM**: Retail pharmacies, clinics, hospitals, drug license verification, credit limit enforcement, and AR ledgers.
7. **Sales & Invoicing**: Sales orders, credit check, automated FEFO allocation, stock reservation, and NBR Mushak-6.3 tax invoice generation.
8. **Distribution & Delivery**: Delivery challans, vehicle/driver assignment, dispatch tracking, and Proof of Delivery (POD) logging.
9. **Warehouses & Depots**: Multi-depot network (Faridpur Central Pharma Depot & Dhaka Metropolitan Hub) with GDP climate control flags.
10. **Batch & Expiry (FEFO)**: Batch tracking with automated First-Expiry-First-Out ordering, alerts (<180d, <90d, <30d), and strict expired stock blocking.
11. **Sales Representatives**: Territory assignments, target tracking, order collection, and commission calculations.
12. **Double-Entry Accounting**: Full Chart of Accounts, balanced general journal entries (Debit == Credit), Trial Balance, Profit & Loss, and Balance Sheet.
13. **Payments & Receipts**: Customer collections (bKash, Nagad, Bank, Cash, Cheque) and vendor payouts with automatic double-entry journal sync.
14. **Returns & QC Inspection**: Quality inspection, configurable restocking into sellable inventory vs. scrap quarantine.
15. **HR & Payroll**: Employee profiles, NID records, salary structures, and department allocations.
16. **Fleet Logistics**: Van registration, BRTA token tracking, driver assignment, and fuel expense logging.
17. **Reporting & BI**: Sales report, inventory valuation at cost, NBR Mushak-6.3 tax registers, Excel export, and print.
18. **Notification Center**: Real-time alerts for low stock, near expiry, order approvals, and delivery milestones.
19. **User & Role Management**: Granular permissions (View, Create, Edit, Delete, Approve, Export, Print) enforced at the backend middleware level.
20. **System Settings & Audit Logs**: Company profile, NBR tax settings, invoice prefixes, and immutable user audit trail.

---

## 3. Getting Started & Development

### Prerequisites:
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### Installation:
```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
```

### Seeding Authentic MediTrust Data:
```bash
cd server
npm run seed
```

### Starting the ERP:
```bash
# Start backend server (Port 5000)
cd server
npm run dev

# Start frontend application (Port 5173)
cd client
npm run dev
```

### Production Build:
```bash
# Backend build
cd server && npm run build

# Frontend build
cd client && npm run build
```

---

## 4. Default Credentials (Seeded)

| Role | Corporate Email | Password |
|---|---|---|
| **Super Admin** | `admin@meditrust.com` | `admin123Password!` |
| **Sales Manager** | `sales@meditrust.com` | `password123` |
| **Warehouse Manager** | `warehouse@meditrust.com` | `password123` |
| **Accountant** | `accounts@meditrust.com` | `password123` |
