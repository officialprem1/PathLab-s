import React, { useState } from 'react';
import { 
  Building2, Save, Database, ShieldCheck, Download, 
  Upload, CheckCircle2, AlertTriangle, Key, RefreshCw, UserPlus
} from 'lucide-react';
import { LabSettings, UserProfile, UserRole } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';
import { testSupabaseConnection } from '../services/supabase';

interface LabSettingsModalProps {
  settings: LabSettings;
  currentUser: UserProfile;
  currentLang: Language;
  onUpdateSettings: (settings: LabSettings) => void;
  onRefreshData: () => void;
}

export const LabSettingsModal: React.FC<LabSettingsModalProps> = ({
  settings,
  currentUser,
  currentLang,
  onUpdateSettings,
  onRefreshData
}) => {
  const t = getTranslation(currentLang);
  const isAdmin = currentUser.role === 'admin';

  // Form states
  const [labName, setLabName] = useState(settings.labName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [registrationNumber, setRegistrationNumber] = useState(settings.registrationNumber);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || '');
  const [pathologistName, setPathologistName] = useState(settings.pathologistName);
  const [pathologistQualification, setPathologistQualification] = useState(settings.pathologistQualification);
  const [pathologistRegNumber, setPathologistRegNumber] = useState(settings.pathologistRegNumber);
  const [reportFooterText, setReportFooterText] = useState(settings.reportFooterText);
  const [reportDisclaimer, setReportDisclaimer] = useState(settings.reportDisclaimer);

  // Supabase Config states
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [connectionStatus, setConnectionStatus] = useState<{ testing: boolean; message: string | null; success?: boolean }>({
    testing: false,
    message: null
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Backup & Restore
  const handleExportBackup = () => {
    const dataStr = storage.exportFullDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PathLIS_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importDatabase(content, currentUser.id, currentUser.name);
        if (success) {
          alert('Database restored successfully! Refreshing view.');
          onRefreshData();
        } else {
          alert('Failed to parse the backup JSON file. Ensure it is a valid Path LIS export.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setConnectionStatus({ testing: false, message: 'Please provide both Supabase Project URL and Anon Key.', success: false });
      return;
    }
    setConnectionStatus({ testing: true, message: 'Testing connection to Supabase...' });
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setConnectionStatus({ testing: false, message: res.message, success: res.success });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only administrators can edit laboratory configuration.');
      return;
    }

    const updated: LabSettings = {
      ...settings,
      labName,
      tagline,
      address,
      phone,
      email,
      registrationNumber,
      gstNumber,
      pathologistName,
      pathologistQualification,
      pathologistRegNumber,
      reportFooterText,
      reportDisclaimer,
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseAnonKey.trim() || undefined,
      isSupabaseConfigured: !!(supabaseUrl && supabaseAnonKey)
    };

    storage.saveSettings(updated, currentUser.id, currentUser.name);
    onUpdateSettings(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.settings} & Laboratory Profile
          </h2>
          <p className="text-xs text-slate-500">
            Configure laboratory branding, pathologist signatory block, and database backup
          </p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Laboratory settings and credentials updated successfully!</span>
        </div>
      )}

      {/* Lab Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: Lab Details */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-purple-900 uppercase tracking-wider flex items-center space-x-2 border-b border-purple-50 pb-2">
            <Building2 className="w-4 h-4 text-purple-700" />
            <span>1. Laboratory Identity & Address</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Laboratory Name *</label>
              <input
                type="text"
                required
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lab Tagline / Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Lab Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Helpline Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Registration Number</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Laboratory Signatory */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-purple-50 pb-2">
            <h3 className="font-bold text-sm text-purple-900 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>2. Laboratory Signatory & Report Configuration</span>
            </h3>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Reports show: "Lab Technician"
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pathologist Full Name *</label>
              <input
                type="text"
                required
                value={pathologistName}
                onChange={(e) => setPathologistName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualifications / Degree *</label>
              <input
                type="text"
                required
                value={pathologistQualification}
                onChange={(e) => setPathologistQualification(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medical Council Reg. No. *</label>
              <input
                type="text"
                required
                value={pathologistRegNumber}
                onChange={(e) => setPathologistRegNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Report Footer Disclaimer</label>
              <textarea
                value={reportDisclaimer}
                onChange={(e) => setReportDisclaimer(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Supabase PostgreSQL Database Credentials */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-purple-50 pb-2">
            <h3 className="font-bold text-sm text-purple-900 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-700" />
              <span>3. Supabase PostgreSQL Integration (Free Tier)</span>
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              PostgreSQL 15+ Compatible
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Path LIS includes built-in reactive offline local persistence and seamless connection to your cloud Supabase database. Enter your free Supabase credentials to sync in real time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://xyzabcdefg.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supabase Anon Public Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={connectionStatus.testing}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
              <span>Test Supabase Connection</span>
            </button>

            {connectionStatus.message && (
              <span className={`text-xs font-semibold ${connectionStatus.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {connectionStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* Section 4: Database Backup & Restore */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-purple-900 uppercase tracking-wider flex items-center space-x-2 border-b border-purple-50 pb-2">
            <Download className="w-4 h-4 text-purple-700" />
            <span>4. Database Backup & Disaster Recovery</span>
          </h3>

          <p className="text-xs text-slate-600">
            Download an independent, verified snapshot of all patient records, visits, tests, billing invoices, and audit logs to your mobile phone or computer.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportBackup} (JSON)</span>
            </button>

            <label className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold text-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{t.restoreBackup}</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save All Laboratory Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
