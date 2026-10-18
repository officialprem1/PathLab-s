import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VisitsList } from './components/VisitsList';
import { TestCatalog } from './components/TestCatalog';
import { DoctorManagement } from './components/DoctorManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { LabSettingsModal } from './components/LabSettingsModal';
import { AuditLogViewer } from './components/AuditLogViewer';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { ResultEntryModal } from './components/ResultEntryModal';
import { ReportViewModal } from './components/ReportViewModal';
import { BillingModal } from './components/BillingModal';
import { CriticalAlertsModal } from './components/CriticalAlertsModal';
import { ProjectZipModal } from './components/ProjectZipModal';
import { LoginScreen } from './components/LoginScreen';
import { StaffManagement } from './components/StaffManagement';

import { storage } from './services/storage';
import { Language } from './i18n';
import { 
  Visit, LabTest, ReferringDoctor, LabSettings, 
  UserProfile, CriticalAlert, AuditLog, Bill 
} from './types/models';

export default function App() {
  // App-wide state
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data state
  const [settings, setSettings] = useState<LabSettings>(storage.getSettings());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(storage.getUsers());
  const [tests, setTests] = useState<LabTest[]>(storage.getTests());
  const [doctors, setDoctors] = useState<ReferringDoctor[]>(storage.getDoctors());
  const [visits, setVisits] = useState<Visit[]>(storage.getVisits());
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>(storage.getCriticalAlerts());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storage.getAuditLogs());

  // Modals state
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isResultEntryModalOpen, setIsResultEntryModalOpen] = useState(false);
  const [isReportViewModalOpen, setIsReportViewModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);

  // Active selected visit for modals
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  // Initial Seed for preview if empty
  useEffect(() => {
    const existingVisits = storage.getVisits();
    if (existingVisits.length === 0) {
      seedInitialStarterVisits();
    }
  }, []);

  const seedInitialStarterVisits = () => {
    const cbcTest = tests.find(t => t.code === 'CBC') || tests[0];
    const lipidTest = tests.find(t => t.code === 'LIPID') || tests[1];
    const thyroidTest = tests.find(t => t.code === 'THYROID') || tests[2];

    const starterPatient1 = storage.savePatient({
      id: 'pat-seed-1',
      patientId: 'PID-2026-0001',
      fullName: 'Smt. Meena Devi',
      age: 48,
      ageUnit: 'years',
      gender: 'female',
      phone: '9425178123',
      address: 'Barghat Road, Seoni MP',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date().toISOString()
    }, 'user-admin', 'Lab Admin');

    const starterPatient2 = storage.savePatient({
      id: 'pat-seed-2',
      patientId: 'PID-2026-0002',
      fullName: 'Shri Rajesh Patel',
      age: 54,
      ageUnit: 'years',
      gender: 'male',
      phone: '9826045678',
      address: 'Gopalganj, Seoni MP',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    }, 'user-admin', 'Lab Admin');

    const starterVisit1: Visit = {
      id: 'vis-seed-1',
      visitNumber: 'VIS-2026-0001',
      patientId: starterPatient1.id,
      patient: starterPatient1,
      referringDoctorId: 'doc-1',
      referringDoctorName: 'Dr. R. K. Soni, MS (Gen. Surg.)',
      status: 'verified',
      tests: [
        {
          id: 'ord-seed-1',
          visitId: 'vis-seed-1',
          testId: cbcTest.id,
          testName: cbcTest.name,
          testCode: cbcTest.code,
          department: cbcTest.department,
          price: cbcTest.price,
          status: 'verified',
          results: {
            'p-hb': {
              parameterId: 'p-hb',
              parameterCode: 'HB',
              parameterName: 'Hemoglobin (Hb)',
              value: '13.2',
              numericValue: 13.2,
              unit: 'g/dL',
              flag: 'NORMAL',
              referenceRangeText: '12.0 - 15.5 g/dL'
            },
            'p-tlc': {
              parameterId: 'p-tlc',
              parameterCode: 'TLC',
              parameterName: 'Total Leukocyte Count (TLC / WBC)',
              value: '8400',
              numericValue: 8400,
              unit: '/uL',
              flag: 'NORMAL',
              referenceRangeText: '4000 - 11000 /uL'
            },
            'p-plt': {
              parameterId: 'p-plt',
              parameterCode: 'PLT',
              parameterName: 'Platelet Count',
              value: '2.6',
              numericValue: 2.6,
              unit: 'lakhs/uL',
              flag: 'NORMAL',
              referenceRangeText: '1.5 - 4.5 lakhs/uL'
            }
          }
        }
      ],
      totalAmount: cbcTest.price,
      discountAmount: 0,
      paidAmount: cbcTest.price,
      paymentStatus: 'paid',
      registrationDate: new Date(Date.now() - 3600000 * 3).toISOString(),
      version: 1
    };

    const starterVisit2: Visit = {
      id: 'vis-seed-2',
      visitNumber: 'VIS-2026-0002',
      patientId: starterPatient2.id,
      patient: starterPatient2,
      referringDoctorId: 'doc-2',
      referringDoctorName: 'Dr. Neha Agrawal, MD (Med.)',
      status: 'results_entered',
      tests: [
        {
          id: 'ord-seed-2',
          visitId: 'vis-seed-2',
          testId: lipidTest.id,
          testName: lipidTest.name,
          testCode: lipidTest.code,
          department: lipidTest.department,
          price: lipidTest.price,
          status: 'results_entered',
          results: {
            'p-chol': {
              parameterId: 'p-chol',
              parameterCode: 'CHOL',
              parameterName: 'Total Cholesterol',
              value: '240',
              numericValue: 240,
              unit: 'mg/dL',
              flag: 'HIGH',
              referenceRangeText: '125 - 200 mg/dL'
            },
            'p-tg': {
              parameterId: 'p-tg',
              parameterCode: 'TG',
              parameterName: 'Triglycerides',
              value: '190',
              numericValue: 190,
              unit: 'mg/dL',
              flag: 'HIGH',
              referenceRangeText: '50 - 150 mg/dL'
            },
            'p-hdl': {
              parameterId: 'p-hdl',
              parameterCode: 'HDL',
              parameterName: 'HDL Cholesterol (Good Cholesterol)',
              value: '38',
              numericValue: 38,
              unit: 'mg/dL',
              flag: 'LOW',
              referenceRangeText: '40 - 60 mg/dL'
            },
            'p-ldl': {
              parameterId: 'p-ldl',
              parameterCode: 'LDL',
              parameterName: 'LDL Cholesterol (Calculated)',
              value: '164.0',
              numericValue: 164.0,
              unit: 'mg/dL',
              flag: 'HIGH',
              referenceRangeText: '60 - 100 mg/dL'
            },
            'p-vldl': {
              parameterId: 'p-vldl',
              parameterCode: 'VLDL',
              parameterName: 'VLDL Cholesterol (Calculated)',
              value: '38.0',
              numericValue: 38.0,
              unit: 'mg/dL',
              flag: 'HIGH',
              referenceRangeText: '10 - 30 mg/dL'
            }
          }
        }
      ],
      totalAmount: lipidTest.price,
      discountAmount: 50,
      paidAmount: 300,
      paymentStatus: 'partial',
      registrationDate: new Date(Date.now() - 3600000).toISOString(),
      version: 1
    };

    storage.saveVisit(starterVisit1, 'user-admin', 'Lab Admin', 'Initial starter visit');
    storage.saveVisit(starterVisit2, 'user-admin', 'Lab Admin', 'Initial starter visit');
    
    // Add starter bill payments
    storage.recordPayment(starterVisit1.id, starterVisit1.totalAmount, 'cash', undefined, 'user-staff', 'Pooja Verma');
    storage.recordPayment(starterVisit2.id, 300, 'upi', 'UPI/489102847', 'user-staff', 'Pooja Verma');

    refreshAllData();
  };

  const refreshAllData = () => {
    setSettings(storage.getSettings());
    setCurrentUser(storage.getCurrentUser());
    setAllUsers(storage.getUsers());
    setTests(storage.getTests());
    setDoctors(storage.getDoctors());
    setVisits(storage.getVisits());
    setCriticalAlerts(storage.getCriticalAlerts());
    setAuditLogs(storage.getAuditLogs());
  };

  const handleSwitchUser = (user: UserProfile) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleOpenResultEntry = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsResultEntryModalOpen(true);
  };

  const handleOpenReportView = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsReportViewModalOpen(true);
  };

  const handleOpenBilling = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsBillingModalOpen(true);
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
  };

  // If no user is logged in, show dedicated Login Portal
  if (!currentUser) {
    return (
      <LoginScreen
        settings={settings}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          refreshAllData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased selection:bg-purple-200 selection:text-purple-900">
      
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        settings={settings}
        criticalAlerts={criticalAlerts}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenZipModal={() => setIsZipModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentLang={currentLang}
          userRole={currentUser.role}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
          onOpenZipModal={() => setIsZipModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto min-w-0">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              visits={visits}
              criticalAlerts={criticalAlerts}
              currentLang={currentLang}
              userRole={currentUser.role}
              onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
              onOpenVisits={() => setActiveTab('visits')}
              onSelectVisit={(v) => {
                setSelectedVisit(v);
                setIsReportViewModalOpen(true);
              }}
              onOpenAlerts={() => setIsAlertsModalOpen(true)}
            />
          )}

          {activeTab === 'visits' && (
            <VisitsList
              visits={visits}
              currentUser={currentUser}
              currentLang={currentLang}
              onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
              onOpenResultEntry={handleOpenResultEntry}
              onOpenReportView={handleOpenReportView}
              onOpenBilling={handleOpenBilling}
              onUpdateVisit={(updated) => {
                refreshAllData();
              }}
            />
          )}

          {activeTab === 'catalog' && (
            <TestCatalog
              tests={tests}
              currentUser={currentUser}
              currentLang={currentLang}
              onUpdateTests={(updated) => {
                setTests(updated);
                refreshAllData();
              }}
            />
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <VisitsList
                visits={visits}
                currentUser={currentUser}
                currentLang={currentLang}
                onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
                onOpenResultEntry={handleOpenResultEntry}
                onOpenReportView={handleOpenReportView}
                onOpenBilling={handleOpenBilling}
                onUpdateVisit={refreshAllData}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <ReportsAnalytics
              visits={visits}
              currentUser={currentUser}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorManagement
              doctors={doctors}
              visits={visits}
              currentUser={currentUser}
              currentLang={currentLang}
              onUpdateDoctors={(updated) => {
                setDoctors(updated);
                refreshAllData();
              }}
            />
          )}

          {activeTab === 'staff' && (
            <StaffManagement
              users={allUsers}
              currentUser={currentUser}
              currentLang={currentLang}
              onUpdateUsers={(updated) => {
                setAllUsers(updated);
                refreshAllData();
              }}
            />
          )}

          {activeTab === 'settings' && (
            <LabSettingsModal
              settings={settings}
              currentUser={currentUser}
              currentLang={currentLang}
              onUpdateSettings={(updated) => {
                setSettings(updated);
                refreshAllData();
              }}
              onRefreshData={refreshAllData}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer
              logs={auditLogs}
              currentUser={currentUser}
              currentLang={currentLang}
            />
          )}

        </main>
      </div>

      {/* --- ALL INTERACTIVE MODALS --- */}

      {/* 1. Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        currentLang={currentLang}
        currentUser={currentUser}
        tests={tests}
        doctors={doctors}
        onSuccess={(newVisit) => {
          refreshAllData();
          setSelectedVisit(newVisit);
          setIsBillingModalOpen(true);
        }}
      />

      {/* 2. Result Entry Modal */}
      {selectedVisit && (
        <ResultEntryModal
          isOpen={isResultEntryModalOpen}
          onClose={() => setIsResultEntryModalOpen(false)}
          visit={selectedVisit}
          catalogTests={tests}
          currentUser={currentUser}
          currentLang={currentLang}
          onSave={(updated) => {
            setSelectedVisit(updated);
            refreshAllData();
          }}
        />
      )}

      {/* 3. Diagnostic Report View & Release Modal */}
      {selectedVisit && (
        <ReportViewModal
          isOpen={isReportViewModalOpen}
          onClose={() => setIsReportViewModalOpen(false)}
          visit={selectedVisit}
          settings={settings}
          currentUser={currentUser}
          currentLang={currentLang}
          onStatusChange={(updated) => {
            setSelectedVisit(updated);
            refreshAllData();
          }}
          onOpenResultEntry={() => {
            setIsReportViewModalOpen(false);
            setIsResultEntryModalOpen(true);
          }}
        />
      )}

      {/* 4. Billing & Cashiering Modal */}
      {selectedVisit && (
        <BillingModal
          isOpen={isBillingModalOpen}
          onClose={() => setIsBillingModalOpen(false)}
          visit={selectedVisit}
          settings={settings}
          currentUser={currentUser}
          currentLang={currentLang}
          onPaymentSuccess={(bill, updatedVisit) => {
            setSelectedVisit(updatedVisit);
            refreshAllData();
          }}
        />
      )}

      {/* 5. Critical Panic Values Modal */}
      <CriticalAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={criticalAlerts}
        currentUser={currentUser}
        currentLang={currentLang}
        onAcknowledge={refreshAllData}
      />

      {/* 6. Standalone Project ZIP Export Modal */}
      <ProjectZipModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />

    </div>
  );
}
