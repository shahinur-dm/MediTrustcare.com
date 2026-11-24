import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter || n.severity === filter;
  });

  const severityIcon = {
    info: <Info className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational alerts, near-expiry warnings, stock threshold alerts, and approval requests.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
            filter === 'all' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('low_stock')}
          className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
            filter === 'low_stock' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          Low Stock Alerts
        </button>
        <button
          onClick={() => setFilter('near_expiry')}
          className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
            filter === 'near_expiry' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          Near Expiry Warnings
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No notifications matching current filter.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start gap-3 transition-colors ${
                n.isRead ? 'bg-white' : 'bg-brand-50/30'
              }`}
            >
              <div className="mt-0.5">{severityIcon[n.severity] || severityIcon.info}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(n.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
