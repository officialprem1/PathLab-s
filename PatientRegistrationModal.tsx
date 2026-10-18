import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, MapPin, Calendar, HeartPulse, Stethoscope, 
  FlaskConical, AlertTriangle, Check, Plus, Search, CheckCircle2
} from 'lucide-react';
import { Patient, Visit, LabTest, ReferringDoctor, TestOrder, UserProfile } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  currentUser: UserProfile;
  tests: LabTest[];
  doctors: ReferringDoctor[];
  onSuccess: (visit: Visit) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  currentUser,
  tests,
  doctors,
  onSuccess
}) => {
  const t = getTranslation(currentLang);

  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [ageUnit, setAgeUnit] = useState<'years' | 'months' | 'days'>('years');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Seoni MP');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number>(12);
  const [doctorId, setDoctorId] = useState<string>(doctors[0]?.id || 'doc-self');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Duplicate Warning State
  const [duplicateMatch, setDuplicateMatch] = useState<Patient | null>(null);

  // Test search in selector
  const [testSearch, setTestSearch] = useState('');

  // Check duplicate patient when name or phone changes
  useEffect(() => {
    if (phone.length >= 7 || fullName.trim().length >= 4) {
      const match = storage.checkDuplicatePatient(fullName, phone);
      setDuplicateMatch(match);
    } else {
      setDuplicateMatch(null);
    }
  }, [fullName, phone]);

  if (!isOpen) return null;

  // Selected tests details & calculation
  const selectedTests = tests.filter(t => selectedTestIds.includes(t.id));
  const subtotal = selectedTests.reduce((sum, t) => sum + t.price, 0);
  const netTotal = Math.max(0, subtotal - discountAmount);

  const toggleTest = (id: string) => {
    if (selectedTestIds.includes(id)) {
      setSelectedTestIds(selectedTestIds.filter(x => x !== id));
    } else {
      setSelectedTestIds([...selectedTestIds, id]);
    }
  };

  const handleUseExistingPatient = (existing: Patient) => {
    setFullName(existing.fullName);
    setAge(existing.age);
    setAgeUnit(existing.ageUnit);
    setGender(existing.gender);
    setPhone(existing.phone);
    setAddress(existing.address);
    setIsPregnant(!!existing.isPregnant);
    if (existing.pregnancyWeeks) setPregnancyWeeks(existing.pregnancyWeeks);
    setDuplicateMatch(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Patient full name and contact phone are required.');
      return;
    }
    if (selectedTestIds.length === 0) {
      alert('Please select at least one lab test for this visit.');
      return;
    }

    // 1. Get or create Patient record
    let patient: Patient;
    const existing = duplicateMatch && duplicateMatch.phone === phone ? duplicateMatch : null;
    
    if (existing) {
      patient = storage.savePatient({
        ...existing,
        fullName,
        age,
        ageUnit,
        gender,
        phone,
        address,
        isPregnant: gender === 'female' ? isPregnant : false,
        pregnancyWeeks: gender === 'female' && isPregnant ? pregnancyWeeks : undefined,
        clinicalHistory: clinicalHistory || existing.clinicalHistory
      }, currentUser.id, currentUser.name);
    } else {
      const newPatientId = storage.generatePatientId();
      patient = storage.savePatient({
        id: 'pat-' + Date.now(),
        patientId: newPatientId,
        fullName,
        age,
        ageUnit,
        gender,
        phone,
        address,
        isPregnant: gender === 'female' ? isPregnant : false,
        pregnancyWeeks: gender === 'female' && isPregnant ? pregnancyWeeks : undefined,
        clinicalHistory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, currentUser.id, currentUser.name);
    }

    // 2. Create Test Orders
    const testOrders: TestOrder[] = selectedTests.map(t => ({
      id: 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      visitId: '',
      testId: t.id,
      testName: t.name,
      testCode: t.code,
      department: t.department,
      price: t.price,
      results: {},
      status: 'registered'
    }));

    // 3. Create Visit
    const visitNumber = storage.generateVisitNumber();
    const doctor = doctors.find(d => d.id === doctorId);

    const visit: Visit = {
      id: 'vis-' + Date.now(),
      visitNumber,
      patientId: patient.id,
      patient,
      referringDoctorId: doctorId,
      referringDoctorName: doctor?.name,
      status: 'registered',
      tests: testOrders,
      totalAmount: subtotal,
      discountAmount,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      registrationDate: new Date().toISOString(),
      version: 1,
      clinicalNotes: clinicalHistory
    };

    // Update orders with the visitId
    visit.tests.forEach(o => o.visitId = visit.id);

    storage.saveVisit(visit, currentUser.id, currentUser.name);
    onSuccess(visit);
    onClose();
  };

  const filteredTests = tests.filter(t => 
    t.name.toLowerCase().includes(testSearch.toLowerCase()) || 
    t.code.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.department.toLowerCase().includes(testSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{t.registerPatient}</h2>
              <p className="text-xs text-purple-200">New Diagnostic Accession & Multi-test Booking</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Duplicate Patient Alert */}
          {duplicateMatch && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between text-xs text-amber-900">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{t.duplicateWarning}</p>
                  <p className="mt-0.5">
                    Match found: <span className="font-semibold">{duplicateMatch.fullName}</span> ({duplicateMatch.patientId}) - Phone: {duplicateMatch.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUseExistingPatient(duplicateMatch)}
                className="ml-3 px-2.5 py-1 bg-amber-700 text-white rounded-md font-semibold hover:bg-amber-800 whitespace-nowrap"
              >
                Use Existing
              </button>
            </div>
          )}

          {/* Section 1: Patient Demographics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-3 flex items-center space-x-1.5">
              <span>1. Patient Demographics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.patientName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar Sahu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-hidden"
                />
              </div>

              {/* Age & Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.age} *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="130"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-1/2 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                  />
                  <select
                    value={ageUnit}
                    onChange={(e) => setAgeUnit(e.target.value as any)}
                    className="w-1/2 px-2.5 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="years">{t.years}</option>
                    <option value="months">{t.months}</option>
                    <option value="days">{t.days}</option>
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.gender} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        gender === g
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                      }`}
                    >
                      {g === 'male' ? t.male : g === 'female' ? t.female : t.other}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phone} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="94251 78901"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  placeholder="At Gopalganj, Seoni MP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                />
              </div>

              {/* Pregnancy Option for Females */}
              {gender === 'female' && (
                <div className="sm:col-span-2 p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPregnant"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="w-4 h-4 text-purple-700 rounded-sm focus:ring-purple-600"
                    />
                    <label htmlFor="isPregnant" className="text-xs font-semibold text-purple-900 cursor-pointer">
                      {t.isPregnant} (Applies trimester-specific reference ranges)
                    </label>
                  </div>
                  {isPregnant && (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-purple-800 font-medium">Weeks:</span>
                      <input
                        type="number"
                        min="1"
                        max="42"
                        value={pregnancyWeeks}
                        onChange={(e) => setPregnancyWeeks(parseInt(e.target.value) || 12)}
                        className="w-16 px-2 py-1 text-xs border border-purple-300 rounded-lg bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Referring Doctor */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.referringDoctor}
                </label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-600 outline-hidden"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.hospital ? `(${d.hospital})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinical Remarks */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clinicalHistory}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fasting sample, fever 3 days, diabetic checkup..."
                  value={clinicalHistory}
                  onChange={(e) => setClinicalHistory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Tests & Panels Selection */}
          <div className="border-t border-purple-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                2. {t.selectTests} ({selectedTestIds.length} selected)
              </h3>
              
              {/* Search test */}
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter tests..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {filteredTests.map((test) => {
                const isSelected = selectedTestIds.includes(test.id);
                return (
                  <div
                    key={test.id}
                    onClick={() => toggleTest(test.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-500 ring-1 ring-purple-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border ${
                        isSelected ? 'bg-purple-700 border-purple-700 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{test.name}</p>
                        <p className="text-[10px] text-slate-500">{test.department} • {test.sampleType}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-800 ml-2 whitespace-nowrap">
                      ₹{test.price}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary Strip */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-slate-500">Subtotal:</span>{' '}
                  <span className="font-bold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">{t.discount}: ₹</span>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Math.min(subtotal, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 px-2 py-0.5 border border-slate-300 rounded-md bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="text-sm font-bold text-purple-900">
                Net Bill Amount: <span className="text-base text-purple-700">₹{netTotal}</span>
              </div>
            </div>

          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Confirm & Generate Accession
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
