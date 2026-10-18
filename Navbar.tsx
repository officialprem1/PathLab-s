import React from 'react';
import { 
  Building2, Globe, Shield, User, AlertTriangle, 
  Download, Database, Menu, CheckCircle2, LogOut
} from 'lucide-react';
import { UserProfile, UserRole, LabSettings, CriticalAlert } from '../types/models';
import { Language, getTranslation } from '../i18n';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  settings: LabSettings;
  criticalAlerts: CriticalAlert[];
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
  onOpenZipModal: () => void;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  currentUser,
  allUsers,
  onSwitchUser,
  settings,
  criticalAlerts,
  onOpenAlerts,
  onOpenSettings,
  onOpenZipModal,
  onToggleMobileMenu,
  onLogout
}) => {
  const t = getTranslation(currentLang);
  const unacknowledgedAlerts = criticalAlerts.filter(a => !a.acknowledged);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger & Lab Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onOpenSettings}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    {settings.labName}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded-full">
                    Path LIS
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[190px] sm:max-w-xs">
                  {settings.address}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions, Alerts, Language, Role switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Critical Alerts Pulsator Button */}
            {unacknowledgedAlerts.length > 0 && (
              <button
                onClick={onOpenAlerts}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold animate-pulse hover:bg-rose-100 transition-colors"
                title={`${unacknowledgedAlerts.length} Unacknowledged Critical Panic Alerts`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Critical Alerts:</span>
                <span className="bg-rose-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                  {unacknowledgedAlerts.length}
                </span>
              </button>
            )}

            {/* Download Project ZIP Button */}
            <button
              onClick={onOpenZipModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold transition-all shadow-xs"
              title="Download Full Project ZIP for Mobile / Vercel Deployment"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.downloadZip}</span>
              <span className="md:hidden">ZIP</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(currentLang === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-semibold">{currentLang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Role Switcher Dropdown for Testing & Multi-user */}
            <div className="relative group">
              <div className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-xl bg-purple-50/70 border border-purple-100 hover:border-purple-200 transition-all cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {currentUser.role[0]}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <p className="font-semibold text-slate-800 truncate max-w-[110px]">{currentUser.name}</p>
                  <p className="text-[10px] text-purple-700 font-medium capitalize">{currentUser.role}</p>
                </div>
                
                {/* Switch selector */}
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = allUsers.find(x => x.id === e.target.value);
                    if (u) onSwitchUser(u);
                  }}
                  className="bg-transparent text-xs text-purple-900 font-semibold cursor-pointer outline-hidden py-1"
                  aria-label="Switch logged-in role"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.role.toUpperCase()}: {u.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dedicated Sign Out Button */}
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors"
              title={t.logout}
              aria-label={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
