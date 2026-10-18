import React, { useState } from 'react';
import { 
  Building2, Shield, Lock, Mail, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowRight, UserCheck, 
  Sparkles, Globe, KeyRound
} from 'lucide-react';
import { UserProfile, UserRole, LabSettings } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface LoginScreenProps {
  settings: LabSettings;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings,
  currentLang,
  onLanguageChange,
  onLoginSuccess
}) => {
  const t = getTranslation(currentLang);

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('admin@maapathlab.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // First-time admin setup modal
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provName, setProvName] = useState('Dr. Rajesh Sharma');
  const [provEmail, setProvEmail] = useState('admin@maapathlab.com');
  const [provPass, setProvPass] = useState('');
  const [provConfirm, setProvConfirm] = useState('');
  const [provSuccess, setProvSuccess] = useState(false);

  // Quick switch role buttons
  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'admin') {
      setIdentifier('admin@maapathlab.com');
      setPassword('admin123');
    } else if (role === 'staff') {
      setIdentifier('staff@maapathlab.com');
      setPassword('staff123');
    } else {
      setIdentifier('pathologist@maapathlab.com');
      setPassword('path123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = storage.login(identifier, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify your email and password.');
      }
    }, 200);
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provPass || provPass.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (provPass !== provConfirm) {
      alert('Passwords do not match.');
      return;
    }

    const admin = storage.provisionAdmin(provPass, provName, provEmail);
    setProvSuccess(true);
    setTimeout(() => {
      setProvSuccess(false);
      setShowProvisionModal(false);
      setSelectedRole('admin');
      setIdentifier(admin.email);
      setPassword(provPass);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 flex flex-col justify-between p-4 sm:p-6 antialiased">
      
      {/* Top Bar with Language Switcher */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 tracking-tight">{settings.labName}</span>
            <span className="text-[11px] text-slate-500 ml-2 hidden sm:inline">{settings.address}</span>
          </div>
        </div>

        <button
          onClick={() => onLanguageChange(currentLang === 'en' ? 'hi' : 'en')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          <span>{currentLang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentLang === 'hi' ? 'लैब पोर्टल लॉगिन' : 'Path LIS Staff Portal'}
            </h1>
            <p className="text-xs text-slate-500">
              {currentLang === 'hi' 
                ? 'अधिकृत लैब प्रशासक, स्टाफ एवं पैथोलॉजिस्ट लॉगिन'
                : 'Secure authentication for Admin, Lab Staff & Pathologist'}
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              {currentLang === 'hi' ? 'रोल चुनें' : 'Select Access Role'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              
              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  selectedRole === 'admin'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <span>Admin</span>
                <span className="text-[9px] font-normal opacity-80">Director</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRoleTab('staff')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  selectedRole === 'staff'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <span>Lab Staff</span>
                <span className="text-[9px] font-normal opacity-80">Technician</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRoleTab('pathologist')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  selectedRole === 'pathologist'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <span>Pathologist</span>
                <span className="text-[9px] font-normal opacity-80">Doctor</span>
              </button>

            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {currentLang === 'hi' ? 'ईमेल या यूज़रनेम' : 'Email or Username'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@maapathlab.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-hidden"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {currentLang === 'hi' ? 'पासवर्ड' : 'Password'} *
                </label>
                {selectedRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setShowProvisionModal(true)}
                    className="text-[11px] font-semibold text-purple-700 hover:underline"
                  >
                    Setup Admin Key
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Authenticating...' : currentLang === 'hi' ? 'लॉगिन करें' : 'Sign In to Laboratory'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Credentials Helper for Testers */}
          <div className="pt-2 border-t border-purple-50">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center mb-2">
              Instant One-Tap Demo Access
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center text-[10px] text-purple-900 font-semibold transition-colors"
              >
                👑 <strong>Admin</strong>
                <span className="block text-[9px] text-purple-600 font-mono">admin123</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoleTab('staff')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center text-[10px] text-purple-900 font-semibold transition-colors"
              >
                🔬 <strong>Staff</strong>
                <span className="block text-[9px] text-purple-600 font-mono">staff123</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoleTab('pathologist')}
                className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center text-[10px] text-purple-900 font-semibold transition-colors"
              >
                🩺 <strong>Doctor</strong>
                <span className="block text-[9px] text-purple-600 font-mono">path123</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-[11px] text-slate-400 py-3">
        {settings.labName} • At Gopalganj, Seoni MP • Path LIS v1.0
      </footer>

      {/* First-Admin Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-purple-100 overflow-hidden">
            <div className="px-5 py-4 bg-purple-800 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-purple-200" />
                <span className="font-bold text-sm">Provision Master Admin Account</span>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="p-5 space-y-3 text-xs">
              <p className="text-slate-600 text-[11px]">
                Create or reset the primary Laboratory Director Administrator account with a custom master password.
              </p>

              {provSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Admin password provisioned successfully! Loading credentials...</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Director Full Name</label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Director Email</label>
                <input
                  type="email"
                  required
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Master Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={provPass}
                  onChange={(e) => setProvPass(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Master Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={provConfirm}
                  onChange={(e) => setProvConfirm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-3 py-1.5 border rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 text-white font-bold rounded-xl"
                >
                  Provision Master Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
