import React from 'react';
import { 
  Users, TestTube2, Clock, CheckCircle, AlertOctagon, 
  IndianRupee, TrendingUp, ArrowRight, UserPlus, FileText,
  AlertTriangle, Eye, ShieldCheck
} from 'lucide-react';
import { Visit, CriticalAlert, UserRole } from '../types/models';
import { Language, getTranslation } from '../i18n';

interface DashboardProps {
  visits: Visit[];
  criticalAlerts: CriticalAlert[];
  currentLang: Language;
  userRole: UserRole;
  onOpenNewPatientModal: () => void;
  onOpenVisits: () => void;
  onSelectVisit: (visit: Visit) => void;
  onOpenAlerts: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  visits,
  criticalAlerts,
  currentLang,
  userRole,
  onOpenNewPatientModal,
  onOpenVisits,
  onSelectVisit,
  onOpenAlerts
}) => {
  const t = getTranslation(currentLang);

  // Today's Date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  const todaysVisits = visits.filter(v => v.registrationDate.startsWith(todayStr));
  const pendingSamples = visits.filter(v => v.status === 'registered');
  const pendingResults = visits.filter(v => v.status === 'sample_collected' || v.status === 'processing');
  const pendingVerification = visits.filter(v => v.status === 'results_entered' || v.status === 'pending_verification');
  const releasedReports = visits.filter(v => v.status === 'released' || v.status === 'verified');
  
  // Outstanding billing
  const outstandingVisits = visits.filter(v => v.paymentStatus === 'unpaid' || v.paymentStatus === 'partial');
  const totalOutstanding = outstandingVisits.reduce((sum, v) => sum + (v.totalAmount - v.discountAmount - v.paidAmount), 0);

  // Today's collections
  const todaysCollections = todaysVisits.reduce((sum, v) => sum + v.paidAmount, 0);

  const unacknowledgedAlerts = criticalAlerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-purple-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-purple-100">
                Live Laboratory Control
              </span>
              <span className="text-xs text-purple-200">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">
              {currentLang === 'hi' ? 'लैबोरेटरी डैशबोर्ड' : 'Laboratory Command Center'}
            </h1>
            <p className="text-purple-100 text-sm mt-1 max-w-xl">
              {currentLang === 'hi'
                ? 'मरीज़ पंजीकरण, सैंपलिंग, क्लिनिकल परिणाम प्रविष्टि एवं डॉक्टर रिपोर्ट सत्यापन का संपूर्ण प्रबंधन।'
                : 'Manage clinical testing, sample collection, automated formulas, and report verification.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewPatientModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>{t.registerPatient}</span>
            </button>
            <button
              onClick={onOpenVisits}
              className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600/80 hover:bg-purple-600 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all"
            >
              <span>{t.visits}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Critical Panic Value Notice Banner if any */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900">
                {unacknowledgedAlerts.length} {t.criticalAlert}
              </h2>
              <p className="text-xs text-rose-700">
                Immediate clinical review required! Patient panic threshold values detected.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAlerts}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Review Alerts
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Registrations */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Visits</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{todaysVisits.length}</span>
            <span className="text-xs text-slate-400">Total: {visits.length}</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-medium">
            Active patient flow
          </div>
        </div>

        {/* Pending Samples */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Samples</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TestTube2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-600">{pendingSamples.length}</span>
            <span className="text-xs text-slate-400">Awaiting draw</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            Requires phlebotomy
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Verification</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-600">{pendingVerification.length}</span>
            <span className="text-xs text-slate-400">For Pathologist</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-medium">
            Results entered
          </div>
        </div>

        {/* Released Reports */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Released Reports</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-600">{releasedReports.length}</span>
            <span className="text-xs text-slate-400">Authorized</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            Ready for PDF / Share
          </div>
        </div>

        {/* Today's Collections */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-900">₹{todaysCollections.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Cash, UPI & Card
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-rose-600">₹{totalOutstanding.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium">
            Across {outstandingVisits.length} visits
          </div>
        </div>

        {/* Pending Result Entry */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Processing</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-indigo-700">{pendingResults.length}</span>
            <span className="text-xs text-slate-400">In analyzer</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-medium">
            Result entry pending
          </div>
        </div>

        {/* Laboratory Technical Verification Status */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Verification</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-xl font-bold text-purple-900">Lab Technician</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700 font-medium truncate">
            Medical Diagnostic Operations
          </div>
        </div>

      </div>

      {/* Recent Visits / Worklist Preview */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-purple-50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {currentLang === 'hi' ? 'हाल की विज़िट और रिपोर्ट स्थिति' : 'Active Patient Worklist'}
            </h2>
            <p className="text-xs text-slate-500">
              Real-time specimen workflow and clinical testing progression
            </p>
          </div>
          <button
            onClick={onOpenVisits}
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Visit #</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Age / Sex</th>
                <th className="px-4 py-3">Tests Ordered</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No patient visits recorded yet. Click "Register Patient" above to get started.
                  </td>
                </tr>
              ) : (
                visits.slice(0, 7).map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-purple-700 whitespace-nowrap">
                        {v.visitNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {v.patient.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {v.patient.age} {v.patient.ageUnit || 'Y'} / {v.patient.gender[0].toUpperCase()}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">
                        {v.tests.map(t => t.testName).join(', ')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'released' || v.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'results_entered'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'sample_collected'
                            ? 'bg-amber-100 text-amber-800'
                            : v.status === 'amended'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {v.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : v.paymentStatus === 'partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {v.paymentStatus.toUpperCase()} (₹{v.paidAmount}/{v.totalAmount - v.discountAmount})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectVisit(v)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
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
