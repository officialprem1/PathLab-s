import React from 'react';
import { 
  LayoutDashboard, UserPlus, FileSpreadsheet, FlaskConical, 
  CreditCard, BarChart3, Stethoscope, Settings, 
  History, Download, X, ShieldAlert, Users, LogOut
} from 'lucide-react';
import { Language, getTranslation } from '../i18n';
import { UserRole } from '../types/models';

export type ActiveTab = 
  | 'dashboard'
  | 'visits'
  | 'catalog'
  | 'billing'
  | 'analytics'
  | 'doctors'
  | 'staff'
  | 'settings'
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentLang: Language;
  userRole: UserRole;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewPatientModal: () => void;
  onOpenZipModal: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  userRole,
  mobileOpen,
  onCloseMobile,
  onOpenNewPatientModal,
  onOpenZipModal,
  onLogout
}) => {
  const t = getTranslation(currentLang);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: t.dashboard, icon: LayoutDashboard },
    { id: 'visits' as ActiveTab, label: t.visits, icon: FileSpreadsheet },
    { id: 'catalog' as ActiveTab, label: t.catalog, icon: FlaskConical },
    { id: 'billing' as ActiveTab, label: t.billing, icon: CreditCard },
    { id: 'analytics' as ActiveTab, label: t.analytics, icon: BarChart3 },
    { id: 'doctors' as ActiveTab, label: t.doctors, icon: Stethoscope },
    ...(userRole === 'admin' ? [{ id: 'staff' as ActiveTab, label: t.staffAccounts, icon: Users }] : []),
    { id: 'settings' as ActiveTab, label: t.settings, icon: Settings },
    { id: 'audit' as ActiveTab, label: t.auditLogs, icon: History },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-purple-100">
      
      {/* Quick Action Button for Registration */}
      <div className="p-4 border-b border-purple-50">
        <button
          onClick={() => {
            onOpenNewPatientModal();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.registerPatient}</span>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-semibold shadow-xs border-l-4 border-purple-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-purple-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom ZIP & Info section */}
      <div className="p-3 border-t border-purple-100 bg-purple-50/40">
        <button
          onClick={() => {
            onOpenZipModal();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-purple-600" />
          <span>{t.downloadZip}</span>
        </button>

        <button
          onClick={() => {
            onCloseMobile();
            onLogout();
          }}
          className="mt-2 w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
          title="Sign out of current session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logout}</span>
        </button>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          Path LIS v1.0 • Seoni MP
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-purple-100">
              <span className="font-bold text-purple-900">Path LIS Navigation</span>
              <button 
                onClick={onCloseMobile} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
