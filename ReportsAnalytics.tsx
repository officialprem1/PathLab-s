import React, { useState } from 'react';
import { 
  BarChart3, IndianRupee, Download, Calendar, 
  TrendingUp, Users, PieChart, FileSpreadsheet, ArrowUpRight
} from 'lucide-react';
import { Visit, Bill, UserProfile } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface ReportsAnalyticsProps {
  visits: Visit[];
  currentUser: UserProfile;
  currentLang: Language;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  visits,
  currentUser,
  currentLang
}) => {
  const t = getTranslation(currentLang);
  const bills = storage.getBills();

  const [dateRange, setDateRange] = useState<'today' | 'month' | 'all'>('month');

  // Total Revenue Metrics
  const totalSubtotal = visits.reduce((sum, v) => sum + v.totalAmount, 0);
  const totalDiscounts = visits.reduce((sum, v) => sum + v.discountAmount, 0);
  const totalBilled = totalSubtotal - totalDiscounts;
  const totalCollected = visits.reduce((sum, v) => sum + v.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  // Department-wise test volume
  const departmentCounts: Record<string, number> = {};
  visits.forEach(v => {
    v.tests.forEach(t => {
      departmentCounts[t.department] = (departmentCounts[t.department] || 0) + 1;
    });
  });

  // Staff-wise payment collection calculation
  const staffCollections: Record<string, number> = {};
  bills.forEach(b => {
    b.payments.forEach(p => {
      const staffName = p.collectedBy || 'Staff';
      staffCollections[staffName] = (staffCollections[staffName] || 0) + p.amount;
    });
  });

  // CSV Export Helper
  const handleExportCsv = () => {
    const headers = ['Visit Number', 'Patient ID', 'Patient Name', 'Age', 'Gender', 'Phone', 'Date', 'Tests', 'Status', 'Total (INR)', 'Discount (INR)', 'Paid (INR)', 'Payment Status', 'Referred By'];
    
    const rows = visits.map(v => [
      v.visitNumber,
      v.patient.patientId,
      `"${v.patient.fullName.replace(/"/g, '""')}"`,
      v.patient.age,
      v.patient.gender,
      v.patient.phone,
      v.registrationDate.slice(0, 10),
      `"${v.tests.map(t => t.testName).join('; ')}"`,
      v.status,
      v.totalAmount,
      v.discountAmount,
      v.paidAmount,
      v.paymentStatus,
      `"${(v.referringDoctorName || 'Direct').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PathLIS_Visits_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.analytics} & Management Insights
          </h2>
          <p className="text-xs text-slate-500">
            Financial collections, staff performance, and clinical workload summaries
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-purple-200 transition-all self-start md:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{t.exportCsv}</span>
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium uppercase">Gross Billed</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalBilled.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Gross Subtotal: ₹{totalSubtotal}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium uppercase">Total Cash Inflow</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Realized revenue</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium uppercase">Total Discounts Given</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">₹{totalDiscounts.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Promotional & concessions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium uppercase">Outstanding Balance</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">₹{totalOutstanding.toLocaleString()}</div>
          <div className="text-[11px] text-rose-600 mt-1">Accounts receivable</div>
        </div>

      </div>

      {/* Grid: Staff Performance & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Volume */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-purple-700" />
            <span>Test Workload by Department</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(departmentCounts).length === 0 ? (
              <p className="text-xs text-slate-400">No test data recorded yet.</p>
            ) : (
              Object.entries(departmentCounts).map(([dept, count]) => {
                const totalTests = Object.values(departmentCounts).reduce((a, b) => a + b, 0);
                const percent = Math.round((count / (totalTests || 1)) * 100);

                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{dept}</span>
                      <span>{count} tests ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-700 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Staff Collections */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-700" />
            <span>Staff-wise Payment Collections</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(staffCollections).length === 0 ? (
              <p className="text-xs text-slate-400">No cashier collections recorded yet.</p>
            ) : (
              Object.entries(staffCollections).map(([staff, amount]) => (
                <div key={staff} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-200 text-purple-900 font-bold flex items-center justify-center text-xs">
                      {staff[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{staff}</h4>
                      <p className="text-[10px] text-slate-500">Authorized Cashier</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-700">₹{amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">Collected</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
