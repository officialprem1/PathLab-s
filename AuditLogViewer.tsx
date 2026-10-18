import React, { useState } from 'react';
import { History, Search, Shield, Filter, UserCheck, Calendar } from 'lucide-react';
import { AuditLog, UserProfile } from '../types/models';
import { Language, getTranslation } from '../i18n';

interface AuditLogViewerProps {
  logs: AuditLog[];
  currentUser: UserProfile;
  currentLang: Language;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  currentUser,
  currentLang
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter(log => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.reason && log.reason.toLowerCase().includes(q));

    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.auditLogs} & Compliance Trail
          </h2>
          <p className="text-xs text-slate-500">
            Immutable clinical history, report authorizations, amendments, and financial records
          </p>
        </div>
        <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
          <History className="w-5 h-5" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search user, action, details, or amendment reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing {filtered.length} audit trail records
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold tracking-wider border-b border-purple-50">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Authorized User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Clinical / Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                      {log.userName}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        {log.userRole}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-purple-900">
                      {log.action}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <div>{log.details}</div>
                      {log.reason && (
                        <div className="text-[11px] text-amber-800 font-medium mt-0.5 bg-amber-50 px-2 py-0.5 rounded inline-block">
                          Reason: {log.reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
