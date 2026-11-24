import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, History, Building2, Save } from 'lucide-react';
import api from '../services/api';
import { DataTable, Column } from '../components/ui/DataTable';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'users' | 'audit'>('company');
  const [company, setCompany] = useState<any>({});
  const [usersData, setUsersData] = useState<any>({ users: [], roles: [] });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, usrRes, audRes] = await Promise.all([
        api.get('/settings/company'),
        api.get('/settings/users-roles'),
        api.get('/settings/audit-logs'),
      ]);
      if (compRes.data.success) setCompany(compRes.data.data.company);
      if (usrRes.data.success) setUsersData(usrRes.data.data);
      if (audRes.data.success) setAuditLogs(audRes.data.data);
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings/company', company);
      alert('Company profile & NBR tax configuration updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update company');
    }
  };

  const auditColumns: Column<any>[] = [
    {
      header: 'Timestamp',
      cell: (log) => (
        <div>
          <p className="font-mono text-xs text-slate-800">
            {new Date(log.createdAt).toLocaleDateString('en-GB')}{' '}
            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      header: 'User',
      cell: (log) => (
        <div>
          <p className="font-semibold text-slate-900">{log.userName}</p>
          <p className="text-[10px] text-slate-400">{log.userRole}</p>
        </div>
      ),
    },
    {
      header: 'Module / Action',
      cell: (log) => (
        <div>
          <span className="font-mono text-[11px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
            {log.action}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">{log.module}</p>
        </div>
      ),
    },
    { header: 'Event Details', accessorKey: 'details' },
    {
      header: 'IP Address',
      cell: (log) => <span className="font-mono text-[10px] text-slate-400">{log.ipAddress || '127.0.0.1'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration & Security Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            MediTrust enterprise profile, Bangladesh NBR tax settings, RBAC role permissions, and immutable audit trails.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'company'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company & Brand Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Users & RBAC Roles ({usersData.users?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSaveCompany} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Commercial Name</label>
                <input
                  type="text"
                  value={company.name || ''}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Legal Registered Name</label>
                <input
                  type="text"
                  value={company.legalName || ''}
                  onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={company.email || ''}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Hotline</label>
                <input
                  type="text"
                  value={company.phone || ''}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Official Website</label>
                <input
                  type="text"
                  value={company.website || ''}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">NBR BIN Number</label>
                <input
                  type="text"
                  value={company.binNumber || ''}
                  onChange={(e) => setCompany({ ...company, binNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">TIN Number</label>
                <input
                  type="text"
                  value={company.tinNumber || ''}
                  onChange={(e) => setCompany({ ...company, tinNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Trade License</label>
                <input
                  type="text"
                  value={company.tradeLicense || ''}
                  onChange={(e) => setCompany({ ...company, tradeLicense: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NBR Mushak Header Text</label>
              <input
                type="text"
                value={company.mushakHeader || ''}
                onChange={(e) => setCompany({ ...company, mushakHeader: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Enterprise Users & Role-Based Permissions</h3>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Branch Assigned</th>
                <th className="p-3">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersData.users?.map((u: any) => (
                <tr key={u._id}>
                  <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3 font-medium text-brand-700">{u.role}</td>
                  <td className="p-3">{u.branch?.name || 'Headquarters'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <DataTable
          columns={auditColumns}
          data={auditLogs}
          title="System Audit & Security Logs"
          searchPlaceholder="Search audit details, action, user..."
          exportFileName="meditrust-audit-trail"
        />
      )}
    </div>
  );
};
