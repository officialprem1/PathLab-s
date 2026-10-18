import React, { useState } from 'react';
import { 
  X, Download, CheckCircle2, Smartphone, Database, 
  FileCode, ShieldCheck, Terminal, HelpCircle, Copy, Check
} from 'lucide-react';
import { createAndDownloadProjectZip } from '../services/zipExport';

interface ProjectZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectZipModal: React.FC<ProjectZipModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    const success = await createAndDownloadProjectZip();
    setDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    }
  };

  const handleCopySqlHint = () => {
    navigator.clipboard.writeText('See supabase-schema.sql inside the ZIP bundle or in project root');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Download Path LIS Project ZIP</h2>
              <p className="text-xs text-purple-200">
                Complete, deployable standalone bundle for Android & Vercel
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          
          {/* Main Download Callout */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-purple-950">
                Production-Ready Source Package (.zip)
              </h3>
              <p className="text-purple-800 mt-0.5">
                Contains complete source code, <code>supabase-schema.sql</code>, starter tests, automated tests, and mobile deployment manual.
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Packing ZIP...' : 'Download ZIP Now'}</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ZIP file downloaded successfully to your device!</span>
            </div>
          )}

          {/* Mobile Android Deployment in 3 Steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-purple-700" />
              <span>Beginner-Friendly Android Mobile Deployment (Free Tier)</span>
            </h4>

            <div className="space-y-2.5 pl-2 border-l-2 border-purple-200">
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-900 block">Step 1: Set up Free Supabase Database</span>
                <p className="text-slate-600 mt-1">
                  Open Chrome on your phone, go to <span className="font-semibold text-slate-800">supabase.com</span>, create a project (e.g. <code>MaaPathLab</code>). In the <strong>SQL Editor</strong>, run the contents of <code>supabase-schema.sql</code>. Copy your Project URL & Anon Key from Settings.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-900 block">Step 2: Deploy to Vercel (100% Free)</span>
                <p className="text-slate-600 mt-1">
                  Upload the extracted files to GitHub from your phone or desktop. Go to <span className="font-semibold text-slate-800">vercel.com</span>, click "Import Project", add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to Environment Variables, and click <strong>Deploy</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-900 block">Step 3: Add to Phone Home Screen (PWA)</span>
                <p className="text-slate-600 mt-1">
                  Open your live Vercel URL in Chrome on Android, tap the three dots menu (⋮), and select <strong>"Add to Home screen"</strong> to install Path LIS as a native laboratory app on your phone!
                </p>
              </div>

            </div>
          </div>

          {/* Included Files Manifest */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-purple-700" />
              <span>Package Contents Manifest</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>📁 src/components/* (12 UI modules)</div>
              <div>📁 src/services/* (Formulas, PDF, Supabase)</div>
              <div>📁 src/types/models.ts</div>
              <div>📁 src/i18n/* (English & Hindi)</div>
              <div>📄 supabase-schema.sql (Postgres DDL)</div>
              <div>📄 README.md (Comprehensive Guide)</div>
              <div>📄 tests/formulas.test.ts (Automated Tests)</div>
              <div>📄 .env.example (Environment template)</div>
            </div>
          </div>

          {/* Verified Feature Checklist */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verified Feature Checklist</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-emerald-900">
              <div>✓ Multi-role: Admin, Staff, Pathologist</div>
              <div>✓ English & Hindi bilingual switcher</div>
              <div>✓ Duplicate patient warning on phone/name</div>
              <div>✓ Clinical formulas (Friedewald LDL, BUN, eGFR)</div>
              <div>✓ Critical panic value alert system</div>
              <div>✓ Verified report release & amendment audit</div>
              <div>✓ Real medical PDF reports with jsPDF</div>
              <div>✓ Cashiering with Cash, UPI, partial payments</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Maa PathLab's • Gopalganj, Seoni MP</span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
