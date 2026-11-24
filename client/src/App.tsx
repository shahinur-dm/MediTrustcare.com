import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider } from './contexts/AppContext';

// Layout
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { BatchesPage } from './pages/BatchesPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { CustomersPage } from './pages/CustomersPage';
import { SalesPage } from './pages/SalesPage';
import { DistributionPage } from './pages/DistributionPage';
import { SalesRepsPage } from './pages/SalesRepsPage';
import { AccountingPage } from './pages/AccountingPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { HRPage } from './pages/HRPage';
import { FleetPage } from './pages/FleetPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-brand-400 font-semibold text-sm">
        Initializing MediTrust ERP Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <Routes>
              {/* Public Auth */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected ERP Modules */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="batches" element={<BatchesPage />} />
                <Route path="warehouses" element={<WarehousesPage />} />
                <Route path="purchases" element={<PurchasesPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="distribution" element={<DistributionPage />} />
                <Route path="sales-reps" element={<SalesRepsPage />} />
                <Route path="accounting" element={<AccountingPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="hr" element={<HRPage />} />
                <Route path="fleet" element={<FleetPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
