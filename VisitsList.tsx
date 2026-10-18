import React, { useState } from 'react';
import { 
  Search, Filter, Plus, FileText, CheckCircle2, 
  Clock, AlertTriangle, Eye, CreditCard, TestTube2,
  Calendar, UserCheck, ShieldAlert, ArrowUpDown
} from 'lucide-react';
import { Visit, VisitStatus, UserProfile, UserRole } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface VisitsListProps {
  visits: Visit[];
  currentUser: UserProfile;
  currentLang: Language;
  onOpenNewPatientModal: () => void;
  onOpenResultEntry: (visit: Visit) => void;
  onOpenReportView: (visit: Visit) => void;
  onOpenBilling: (visit: Visit) => void;
  onUpdateVisit: (updatedVisit: Visit) => void;
}

export const VisitsList: React.FC<VisitsListProps> = ({
  visits,
  currentUser,
  currentLang,
  onOpenNewPatientModal,
  onOpenResultEntry,
  onOpenReportView,
  onOpenBilling,
  onUpdateVisit
}) => {
  const t = getTranslation(currentLang);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Handle Specimen Collection transition
  const handleCollectSample = (visit: Visit) => {
    const updated: Visit = {
      ...visit,
      status: 'sample_collected',
      sampleCollectedDate: new Date().toISOString(),
      tests: visit.tests.map(t => ({
        ...t,
        status: 'sample_collected',
        sampleCollectedAt: new Date().toISOString(),
        sampleCollectorName: currentUser.name
      }))
    };
    storage.saveVisit(updated, currentUser.id, currentUser.name, 'Specimen collected by phlebotomy staff');
    onUpdateVisit(updated);
  };

  // Filter logic
  const filtered = visits.filter(v => {
    // Search query
    const query = searchTerm.toLowerCase();
    const matchSearch = 
      v.visitNumber.toLowerCase().includes(query) ||
      v.patient.patientId.toLowerCase().includes(query) ||
      v.patient.fullName.toLowerCase().includes(query) ||
      v.patient.phone.includes(query) ||
      (v.referringDoctorName && v.referringDoctorName.toLowerCase().includes(query));

    // Status filter
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;

    // Payment filter
    const matchPayment = paymentFilter === 'all' || v.paymentStatus === paymentFilter;

    // Date filter (YYYY-MM-DD)
    const matchDate = !dateFilter || v.registrationDate.startsWith(dateFilter);

    return matchSearch && matchStatus && matchPayment && matchDate;
  });

  return (
    <div className="space-y-4">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.visits}
          </h2>
          <p className="text-xs text-slate-500">
            Total {visits.length} registered accessions • Showing {filtered.length} matching visits
          </p>
        </div>

        <button
          onClick={onOpenNewPatientModal}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newVisit}</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
          >
            <option value="all">All Diagnostic Statuses</option>
            <option value="registered">{t.status_registered}</option>
            <option value="sample_collected">{t.status_sample_collected}</option>
            <option value="results_entered">{t.status_results_entered}</option>
            <option value="pending_verification">{t.status_pending_verification}</option>
            <option value="verified">{t.status_verified}</option>
            <option value="released">{t.status_released}</option>
            <option value="amended">{t.status_amended}</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">{t.status_paid}</option>
            <option value="partial">{t.status_partial}</option>
            <option value="unpaid">{t.status_unpaid}</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium"
          />
        </div>

      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-purple-50">
              <tr>
                <th className="px-4 py-3.5">Accession / Patient</th>
                <th className="px-4 py-3.5">Age / Sex / Phone</th>
                <th className="px-4 py-3.5">Investigation Profiles</th>
                <th className="px-4 py-3.5">Referred By</th>
                <th className="px-4 py-3.5">Workflow Status</th>
                <th className="px-4 py-3.5">Billing</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No matching patient visits found. Adjust search filters or register a new patient.
                  </td>
                </tr>
              ) : (
                filtered.map((visit) => {
                  const isReleased = visit.status === 'released' || visit.status === 'amended';
                  const isVerified = visit.status === 'verified';
                  const balance = Math.max(0, visit.totalAmount - visit.discountAmount - visit.paidAmount);

                  return (
                    <tr key={visit.id} className="hover:bg-purple-50/40 transition-colors">
                      
                      {/* Accession & Patient ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-purple-700 text-sm">{visit.visitNumber}</div>
                        <div className="font-semibold text-slate-900 mt-0.5">{visit.patient.fullName}</div>
                        <div className="text-[10px] text-slate-400">PID: {visit.patient.patientId}</div>
                      </td>

                      {/* Age, Gender, Phone */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {visit.patient.age} {visit.patient.ageUnit || 'Y'} • {visit.patient.gender.toUpperCase()}
                          {visit.patient.isPregnant && (
                            <span className="ml-1 text-purple-600 font-bold">(Preg)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{visit.patient.phone}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(visit.registrationDate).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Tests ordered */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="font-medium text-slate-900 line-clamp-2">
                          {visit.tests.map(t => t.testName).join(', ')}
                        </div>
                        <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                          {visit.tests.length} investigation{visit.tests.length > 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Referred Doctor */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {visit.referringDoctorName || 'Self / Direct'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isReleased
                              ? 'bg-emerald-100 text-emerald-800'
                              : isVerified
                              ? 'bg-blue-100 text-blue-800'
                              : visit.status === 'sample_collected'
                              ? 'bg-amber-100 text-amber-800'
                              : visit.status === 'results_entered' || visit.status === 'pending_verification'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {visit.status.replace('_', ' ').toUpperCase()} {visit.version > 1 ? `(v${visit.version})` : ''}
                          </span>

                          {/* Quick transition button: Collect Sample */}
                          {visit.status === 'registered' && (
                            <button
                              onClick={() => handleCollectSample(visit)}
                              className="text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center space-x-1"
                            >
                              <TestTube2 className="w-3 h-3" />
                              <span>Draw Sample</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Billing status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          ₹{visit.paidAmount} / ₹{visit.totalAmount - visit.discountAmount}
                        </div>
                        <span className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                          visit.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : visit.paymentStatus === 'partial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {visit.paymentStatus} {balance > 0 ? `(Bal ₹${balance})` : ''}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Result Entry button */}
                          <button
                            onClick={() => onOpenResultEntry(visit)}
                            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Enter or Review Laboratory Results"
                          >
                            Results
                          </button>

                          {/* View Report button */}
                          <button
                            onClick={() => onOpenReportView(visit)}
                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1"
                            title="View and Print Diagnostic Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>

                          {/* Billing button */}
                          <button
                            onClick={() => onOpenBilling(visit)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Payment & Invoicing"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
