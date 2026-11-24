import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  CalendarCheck,
  Receipt,
  RotateCcw,
  UserCheck,
  Car,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  LogOut,
  Warehouse,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationSections = [
    {
      title: 'Executive',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Business Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Catalog & Inventory',
      items: [
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Inventory & Stock', path: '/inventory', icon: Boxes },
        { label: 'Batch & Expiry (FEFO)', path: '/batches', icon: CalendarCheck },
        { label: 'Warehouses', path: '/warehouses', icon: Warehouse },
      ],
    },
    {
      title: 'Sales & Distribution',
      items: [
        { label: 'Sales Orders', path: '/sales', icon: ShoppingCart },
        { label: 'Customers & CRM', path: '/customers', icon: Users },
        { label: 'Delivery & Challans', path: '/distribution', icon: Truck },
        { label: 'Sales Representatives', path: '/sales-reps', icon: UserCheck },
      ],
    },
    {
      title: 'Procurement & Returns',
      items: [
        { label: 'Purchase Orders', path: '/purchases', icon: FileSpreadsheet },
        { label: 'Suppliers', path: '/suppliers', icon: Building2 },
        { label: 'Returns & QC', path: '/returns', icon: RotateCcw },
      ],
    },
    {
      title: 'Finance & Accounts',
      items: [
        { label: 'Accounts & GL', path: '/accounting', icon: Receipt },
        { label: 'Payments & Receipts', path: '/payments', icon: Sparkles },
      ],
    },
    {
      title: 'Enterprise Management',
      items: [
        { label: 'HR & Employees', path: '/hr', icon: Users },
        { label: 'Fleet & Vehicles', path: '/fleet', icon: Car },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'System & Audit Logs', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-navy-900 text-slate-200 border-r border-navy-800 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-navy-800 bg-navy-950">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <span className="font-bold text-lg tracking-wider">M</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight leading-none">MediTrust</span>
              <span className="text-[10px] text-brand-400 font-medium tracking-wider uppercase mt-1">Care Bangladesh</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-navy-800 bg-navy-950">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'MediTrust User'}</p>
                <p className="text-[10px] text-brand-400 truncate">{user?.role || 'Admin'}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-navy-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
