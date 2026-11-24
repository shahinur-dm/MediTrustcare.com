import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building,
  Warehouse,
  ExternalLink,
  ChevronDown,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

interface TopNavProps {
  onToggleMobileMenu?: () => void;
  onQuickActionClick?: (action: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { activeBranch, setActiveBranch, activeWarehouse, setActiveWarehouse } = useApp();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const branches = [
    { code: 'BR-FDP', name: 'Faridpur Central Hub' },
    { code: 'BR-DHK', name: 'Dhaka Operations' },
  ];

  const warehouses = [
    { code: 'WH-FDP-01', name: 'Faridpur Depot' },
    { code: 'WH-DHK-01', name: 'Dhaka Depot' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Hamburger & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo & Brand */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-sm border border-slate-200 flex items-center justify-center">
            <img src="/logo.png" alt="MediTrust Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight truncate">MediTrust</span>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, orders, batch number, customer..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Branch Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 text-xs">
          <Building className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer max-w-[130px] md:max-w-none truncate"
          >
            {branches.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 text-xs">
          <Warehouse className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <select
            value={activeWarehouse}
            onChange={(e) => setActiveWarehouse(e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer max-w-[130px] lg:max-w-none truncate"
          >
            {warehouses.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Official Website Link */}
        <a
          href="https://www.meditrustcarebd.com/"
          target="_blank"
          rel="noreferrer"
          className="hidden xl:flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-brand-600 transition-colors px-2 py-1"
        >
          <span>meditrustcarebd.com</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-16 sm:top-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-800">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-brand-600 hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No new notifications</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n._id}
                      className={`p-2 rounded-lg text-xs ${
                        n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-brand-50/50 text-slate-800 border-l-2 border-brand-500'
                      }`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-brand-600 font-medium hover:underline"
                >
                  View all in Notification Center
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 sm:pl-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 leading-none">{user?.role || 'Super Admin'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-slate-400 text-[10px] truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Account & Permissions</span>
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-2.5 z-20 md:hidden flex items-center gap-2 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
