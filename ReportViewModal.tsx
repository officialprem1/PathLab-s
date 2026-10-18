import React, { useState } from 'react';
import { 
  X, Download, Printer, Share2, CheckCircle2, 
  AlertCircle, ShieldCheck, History, Edit3, Eye
} from 'lucide-react';
import { Visit, LabSettings, UserProfile, ReportSnapshot } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { generateReportPdf, downloadPdfFile, printPdfDocument, sharePdfReport } from '../services/pdfGenerator';
import { storage } from '../services/storage';

interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  settings: LabSettings;
  currentUser: UserProfile;
  currentLang: Language;
  onStatusChange: (updatedVisit: Visit) => void;
  onOpenResultEntry: () => void;
}

export const ReportViewModal: React.FC<ReportViewModalProps> = ({
  isOpen,
  onClose,
  visit,
  settings,
  currentUser,
  currentLang,
  onStatusChange,
  onOpenResultEntry
}) => {
  const t = getTranslation(currentLang);

  // Amendment Workflow state
  const [showAmendPrompt, setShowAmendPrompt] = useState(false);
  const [amendReason, setAmendReason] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen || !visit) return null;

  const isPathologistOrAdmin = currentUser.role === 'pathologist' || currentUser.role === 'admin';
  const isReleased = visit.status === 'released' || visit.status === 'amended';
  const isVerified = visit.status === 'verified';

  // Handle Verify Action (Pathologist / Admin only)
  const handleVerifyReport = () => {
    if (!isPathologistOrAdmin) {
      alert('Only a Pathologist or Administrator is authorized to verify and approve clinical laboratory reports.');
      return;
    }

    const updated: Visit = {
      ...visit,
      status: 'verified',
      tests: visit.tests.map(t => ({
        ...t,
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser.name
      }))
    };

    storage.saveVisit(updated, currentUser.id, currentUser.name, 'Clinical results verified by Pathologist');
    onStatusChange(updated);
  };

  // Handle Release Action
  const handleReleaseReport = () => {
    if (!isPathologistOrAdmin) {
      alert('Only authorized personnel (Pathologist or Administrator) can release final diagnostic reports to patients.');
      return;
    }

    // Save snapshot of report
    const snapshot: ReportSnapshot = {
      version: visit.version,
      releasedAt: new Date().toISOString(),
      releasedBy: currentUser.name,
      tests: JSON.parse(JSON.stringify(visit.tests))
    };

    const updated: Visit = {
      ...visit,
      status: 'released',
      releasedDate: new Date().toISOString(),
      reportHistory: [...(visit.reportHistory || []), snapshot]
    };

    storage.saveVisit(updated, currentUser.id, currentUser.name, 'Final clinical report authorized & released');
    onStatusChange(updated);
  };

  // Handle Amendment (Reopening released report with mandatory reason)
  const handleConfirmAmend = () => {
    if (!amendReason.trim()) {
      alert('A formal clinical amendment reason is mandatory to unlock and preserve the audit trail.');
      return;
    }

    const nextVersion = (visit.version || 1) + 1;
    const updated: Visit = {
      ...visit,
      status: 'amended',
      version: nextVersion,
      amendedDate: new Date().toISOString(),
      amendmentReason: amendReason,
      amendedBy: currentUser.name
    };

    storage.saveVisit(updated, currentUser.id, currentUser.name, `Amended report to v${nextVersion}: ${amendReason}`);
    setShowAmendPrompt(false);
    setAmendReason('');
    onStatusChange(updated);
    onOpenResultEntry();
  };

  // PDF Actions
  const handleDownloadPdf = () => {
    const doc = generateReportPdf(visit, settings);
    const filename = `Report_${visit.visitNumber}_${visit.patient.fullName.replace(/\s+/g, '_')}.pdf`;
    downloadPdfFile(doc, filename);
  };

  const handlePrintPdf = () => {
    const doc = generateReportPdf(visit, settings);
    printPdfDocument(doc);
  };

  const handleShare = async () => {
    const result = await sharePdfReport(visit, settings);
    setShareFeedback(result.message);
    setTimeout(() => setShareFeedback(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Actions Header */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">{visit.visitNumber}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                v{visit.version}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isReleased ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {visit.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              {visit.patient.fullName} ({visit.patient.age} {visit.patient.ageUnit || 'Y'} / {visit.patient.gender.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>{t.downloadPdf}</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printReport}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Share report via WhatsApp or native sheet"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareReport}</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share feedback toast if present */}
        {shareFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-semibold text-emerald-800 text-center">
            {shareFeedback}
          </div>
        )}

        {/* Amendment Banner if amended */}
        {visit.status === 'amended' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Amended Report (Version {visit.version}):</span> {visit.amendmentReason}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              Authorized by {visit.amendedBy || 'Pathologist'}
            </span>
          </div>
        )}

        {/* Diagnostic Letterhead Preview (Rendered as in medical PDF) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-6 text-slate-800">
            
            {/* Lab Letterhead */}
            <div className="border-b-2 border-purple-800 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-purple-900 tracking-tight">
                  {settings.labName.toUpperCase()}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{settings.tagline}</p>
                <p className="text-xs text-slate-600 mt-1">{settings.address}</p>
              </div>
              <div className="text-right text-xs text-slate-500 space-y-0.5">
                <p>Phone: <span className="font-semibold text-slate-800">{settings.phone}</span></p>
                <p>Email: {settings.email}</p>
                {settings.registrationNumber && <p>Reg: {settings.registrationNumber}</p>}
              </div>
            </div>

            {/* Patient Demographic Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400">Patient Name:</span>{' '}
                <span className="font-bold text-slate-900">{visit.patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400">Visit / Accession:</span>{' '}
                <span className="font-bold text-purple-700">{visit.visitNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">Age / Gender:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {visit.patient.age} {visit.patient.ageUnit || 'Yrs'} / {visit.patient.gender.toUpperCase()}
                  {visit.patient.isPregnant ? ' (Pregnant)' : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Patient ID:</span>{' '}
                <span className="font-semibold text-slate-800">{visit.patient.patientId}</span>
              </div>
              <div>
                <span className="text-slate-400">Referred By:</span>{' '}
                <span className="font-semibold text-slate-800">{visit.referringDoctorName || 'Self / Direct'}</span>
              </div>
              <div>
                <span className="text-slate-400">Date & Time:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {new Date(visit.registrationDate).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Results Table grouped by Test */}
            <div className="space-y-6">
              {visit.tests.map((order) => {
                const results = Object.values(order.results || {});
                return (
                  <div key={order.id} className="border border-purple-100 rounded-xl overflow-hidden">
                    <div className="bg-purple-100/70 px-4 py-2 flex items-center justify-between">
                      <span className="font-bold text-purple-900 text-xs uppercase tracking-wide">
                        {order.testName} [{order.department}]
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold">
                        Sample: EDTA Blood / Serum
                      </span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-purple-50">
                        <tr>
                          <th className="px-4 py-2">Test Parameter</th>
                          <th className="px-4 py-2">Result Value</th>
                          <th className="px-4 py-2">Unit</th>
                          <th className="px-4 py-2">Reference Interval</th>
                          <th className="px-4 py-2">Flag / Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-slate-400 italic">
                              Results pending entry
                            </td>
                          </tr>
                        ) : (
                          results.map((r) => {
                            const isAbnormal = r.flag && r.flag !== 'NORMAL';
                            const isCritical = r.flag === 'CRITICAL_LOW' || r.flag === 'CRITICAL_HIGH';
                            return (
                              <tr key={r.parameterId} className={isCritical ? 'bg-rose-50/70 font-semibold' : ''}>
                                <td className="px-4 py-2.5 font-semibold text-slate-900">
                                  {r.parameterName}
                                  {r.method && <span className="block text-[10px] text-slate-400 font-normal">{r.method}</span>}
                                </td>
                                <td className={`px-4 py-2.5 font-bold ${
                                  isCritical ? 'text-rose-700 text-sm' : isAbnormal ? 'text-amber-700' : 'text-slate-800'
                                }`}>
                                  {r.value}
                                </td>
                                <td className="px-4 py-2.5 text-slate-500 font-medium">{r.unit || '-'}</td>
                                <td className="px-4 py-2.5 text-slate-600">{r.referenceRangeText || '-'}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  {r.flag === 'HIGH' && <span className="text-rose-600 font-bold">▲ HIGH</span>}
                                  {r.flag === 'LOW' && <span className="text-blue-600 font-bold">▼ LOW</span>}
                                  {isCritical && <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">CRITICAL</span>}
                                  {r.flag === 'ABNORMAL' && <span className="text-amber-600 font-bold">ABNORMAL</span>}
                                  {r.flag === 'NORMAL' && <span className="text-slate-400">NORMAL</span>}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Lab Technician Verification & Digital Signature Block */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <p className="font-semibold text-slate-800">Prepared & Checked By:</p>
                <p className="text-slate-500 text-[11px]">Medical Laboratory Section</p>
                <p className="text-slate-400 text-[10px]">Maa PathLab's, Seoni MP</p>
              </div>

              <div className="text-right">
                <div className="inline-block p-1.5 border border-emerald-300 bg-emerald-50/60 rounded-lg text-emerald-800 text-[10px] font-bold mb-1">
                  ✓ DIGITALLY RELEASED
                </div>
                <p className="font-bold text-sm text-purple-900">Lab Technician</p>
                <p className="text-slate-500 text-xs">Maa PathLab's, Seoni MP</p>
              </div>
            </div>

            {/* Medical Disclaimer Footer */}
            <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-500 italic text-center">
              {settings.reportDisclaimer} • {t.digitallyGeneratedReport}
            </div>

          </div>
        </div>

        {/* Amendment Prompt Modal Layer */}
        {showAmendPrompt && (
          <div className="p-4 bg-amber-50 border-t border-amber-300">
            <h4 className="text-xs font-bold text-amber-900 mb-1">
              Clinical Report Amendment Notice (Audit Protected)
            </h4>
            <p className="text-xs text-amber-800 mb-2">
              Modifying an authorized clinical report requires a medical justification. A new version (v{visit.version + 1}) will be generated, preserving the released version snapshot.
            </p>
            <textarea
              required
              placeholder="e.g. Repeated test on sample dilution due to lipemic interference; corrected SGPT result."
              value={amendReason}
              onChange={(e) => setAmendReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-amber-300 rounded-lg bg-white mb-2"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAmendPrompt(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-amber-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAmend}
                className="px-4 py-1.5 text-xs bg-amber-800 text-white font-bold rounded-lg hover:bg-amber-900"
              >
                Confirm Amendment & Edit Results
              </button>
            </div>
          </div>
        )}

        {/* Footer Workflow Control Buttons */}
        <div className="p-4 bg-white border-t border-purple-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Logged in as: <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.role})</span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* If unverified, Pathologist can Verify */}
            {!isVerified && !isReleased && (
              <button
                onClick={handleVerifyReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Verify Report (Pathologist)
              </button>
            )}

            {/* If verified but not released, Authorize and Release */}
            {isVerified && !isReleased && (
              <button
                onClick={handleReleaseReport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200"
              >
                Authorize & Release Final Report
              </button>
            )}

            {/* If already released, allow controlled amendment */}
            {isReleased && !showAmendPrompt && (
              <button
                onClick={() => setShowAmendPrompt(true)}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors"
              >
                {t.reopenAmend}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
