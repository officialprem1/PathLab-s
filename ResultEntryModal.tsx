import React, { useState, useEffect } from 'react';
import { 
  X, Calculator, AlertTriangle, Check, Save, 
  FlaskConical, CheckCircle2, Info, ArrowRight
} from 'lucide-react';
import { Visit, LabTest, UserProfile, ParameterResult, TestParameter } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { calculateDerivedParameters, evaluateResultFlag } from '../services/formulas';
import { storage } from '../services/storage';

interface ResultEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  catalogTests: LabTest[];
  currentUser: UserProfile;
  currentLang: Language;
  onSave: (updatedVisit: Visit) => void;
}

export const ResultEntryModal: React.FC<ResultEntryModalProps> = ({
  isOpen,
  onClose,
  visit,
  catalogTests,
  currentUser,
  currentLang,
  onSave
}) => {
  const t = getTranslation(currentLang);

  // Results state: mapping parameterId -> { value, notes }
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [paramNotes, setParamNotes] = useState<Record<string, string>>({});
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  // Initialize values from current visit orders
  useEffect(() => {
    if (!visit) return;
    const initialValues: Record<string, string> = {};
    const initialNotes: Record<string, string> = {};

    visit.tests.forEach(order => {
      if (order.results) {
        Object.entries(order.results).forEach(([pId, res]) => {
          initialValues[pId] = res.value || '';
          if (res.notes) initialNotes[pId] = res.notes;
        });
      }
    });

    setParamValues(initialValues);
    setParamNotes(initialNotes);
  }, [visit]);

  if (!isOpen || !visit) return null;

  const currentOrder = visit.tests[activeTestIndex] || visit.tests[0];
  const catalogTest = catalogTests.find(t => t.id === currentOrder.testId) || {
    id: currentOrder.testId,
    name: currentOrder.testName,
    code: currentOrder.testCode,
    department: currentOrder.department,
    parameters: []
  } as Partial<LabTest>;

  const parameters = catalogTest.parameters || [];

  // Helper to get parameter by ID
  const getParamById = (id: string): TestParameter | undefined => {
    for (const test of catalogTests) {
      const match = test.parameters?.find(p => p.id === id);
      if (match) return match;
    }
    return undefined;
  };

  // Run auto-calculation on demand
  const handleAutoCalculate = () => {
    // Build code-to-value map
    const codeMap: Record<string, string> = {};
    parameters.forEach(p => {
      const val = paramValues[p.id];
      if (val !== undefined) {
        codeMap[p.code] = val;
      }
    });

    const derived = calculateDerivedParameters(codeMap, visit.patient);

    const updated = { ...paramValues };
    const notesUpdate = { ...paramNotes };

    parameters.forEach(p => {
      if (derived[p.code] && derived[p.code].calculated) {
        updated[p.id] = derived[p.code].value;
        if (derived[p.code].notes) {
          notesUpdate[p.id] = derived[p.code].notes!;
        }
      }
    });

    setParamValues(updated);
    setParamNotes(notesUpdate);
  };

  const handleInputChange = (parameterId: string, val: string) => {
    setParamValues(prev => ({ ...prev, [parameterId]: val }));
  };

  const handleSaveResults = (readyForVerification: boolean) => {
    // 1. Compile results for current order
    const updatedTests = visit.tests.map((order, idx) => {
      if (idx !== activeTestIndex) return order;

      const orderResults: Record<string, ParameterResult> = {};

      parameters.forEach(param => {
        const rawVal = (paramValues[param.id] ?? '').trim();
        if (rawVal === '') return;

        const evalFlag = evaluateResultFlag(rawVal, param, visit.patient);
        const numVal = parseFloat(rawVal);

        orderResults[param.id] = {
          parameterId: param.id,
          parameterCode: param.code,
          parameterName: param.name,
          value: rawVal,
          numericValue: isNaN(numVal) ? undefined : numVal,
          unit: param.unit,
          flag: evalFlag.flag,
          referenceRangeText: evalFlag.rangeText,
          method: param.method,
          notes: paramNotes[param.id]
        };

        // If CRITICAL panic value, trigger Critical Alert
        if (evalFlag.flag === 'CRITICAL_LOW' || evalFlag.flag === 'CRITICAL_HIGH') {
          storage.addCriticalAlert({
            visitId: visit.id,
            visitNumber: visit.visitNumber,
            patientName: visit.patient.fullName,
            patientPhone: visit.patient.phone,
            testName: order.testName,
            parameterName: param.name,
            value: rawVal,
            unit: param.unit,
            flag: evalFlag.flag
          });
        }
      });

      return {
        ...order,
        results: orderResults,
        status: readyForVerification ? ('pending_verification' as const) : ('results_entered' as const),
        resultsEnteredAt: new Date().toISOString(),
        resultsEnteredBy: currentUser.name
      };
    });

    // 2. Check if all tests in the visit have results entered
    const allEntered = updatedTests.every(o => Object.keys(o.results || {}).length > 0);
    const newStatus = readyForVerification
      ? (allEntered ? 'pending_verification' : 'processing')
      : 'results_entered';

    const updatedVisit: Visit = {
      ...visit,
      tests: updatedTests,
      status: newStatus
    };

    storage.saveVisit(updatedVisit, currentUser.id, currentUser.name, `Saved clinical results for ${currentOrder.testName}`);
    onSave(updatedVisit);

    // If more tests exist in this visit, move to next, otherwise close
    if (activeTestIndex < visit.tests.length - 1) {
      setActiveTestIndex(activeTestIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                {visit.visitNumber}
              </span>
              <span className="text-xs text-purple-200">
                {visit.patient.fullName} ({visit.patient.age} {visit.patient.ageUnit || 'Y'} / {visit.patient.gender.toUpperCase()})
              </span>
            </div>
            <h2 className="font-bold text-lg leading-tight mt-1">
              {t.enterResults} — {currentOrder.testName}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Tabs if visit has multiple tests */}
        {visit.tests.length > 1 && (
          <div className="bg-purple-50/60 px-6 py-2 border-b border-purple-100 flex items-center space-x-2 overflow-x-auto">
            {visit.tests.map((order, idx) => (
              <button
                key={order.id}
                onClick={() => setActiveTestIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTestIndex === idx
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-purple-100 hover:bg-purple-100'
                }`}
              >
                {order.testCode || order.testName}
                {Object.keys(order.results || {}).length > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-80">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Warning Banner & Formula Button */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.clinicalDisclaimerNotice}</span>
          </div>

          <button
            type="button"
            onClick={handleAutoCalculate}
            className="flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-lg font-semibold text-xs transition-colors shadow-2xs"
          >
            <Calculator className="w-3.5 h-3.5 text-purple-600" />
            <span>{t.autoCalculate}</span>
          </button>
        </div>

        {/* Result Form Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {parameters.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No parameters configured for this test in the catalog.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {parameters.map((param) => {
                const val = paramValues[param.id] || '';
                const flagEval = evaluateResultFlag(val, param, visit.patient);

                let flagBadge = null;
                if (val.trim() !== '') {
                  if (flagEval.flag === 'CRITICAL_LOW' || flagEval.flag === 'CRITICAL_HIGH') {
                    flagBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                        CRITICAL {flagEval.flag === 'CRITICAL_LOW' ? 'LOW' : 'HIGH'}
                      </span>
                    );
                  } else if (flagEval.flag === 'HIGH') {
                    flagBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        ▲ HIGH
                      </span>
                    );
                  } else if (flagEval.flag === 'LOW') {
                    flagBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        ▼ LOW
                      </span>
                    );
                  } else if (flagEval.flag === 'ABNORMAL') {
                    flagBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        ABNORMAL
                      </span>
                    );
                  } else {
                    flagBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        NORMAL
                      </span>
                    );
                  }
                }

                return (
                  <div key={param.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    
                    {/* Left: Param details & Ref Range */}
                    <div className="sm:w-1/2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{param.name}</span>
                        {param.type === 'calculated' && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[9px] font-semibold">
                            Formula
                          </span>
                        )}
                        {flagBadge}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Ref Interval: <span className="font-semibold text-slate-700">{flagEval.rangeText}</span>
                        {param.method && ` • Method: ${param.method}`}
                      </div>
                    </div>

                    {/* Right: Input value & Unit */}
                    <div className="sm:w-1/2 flex items-center space-x-2 justify-end">
                      {param.type === 'dropdown' && param.options ? (
                        <select
                          value={val}
                          onChange={(e) => handleInputChange(param.id, e.target.value)}
                          className="w-48 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-600 outline-hidden"
                        >
                          <option value="">-- Select --</option>
                          {param.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative w-44">
                          <input
                            type={param.type === 'numeric' || param.type === 'calculated' ? 'number' : 'text'}
                            step="any"
                            placeholder="Enter value"
                            value={val}
                            onChange={(e) => handleInputChange(param.id, e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs font-semibold border rounded-xl outline-hidden focus:ring-2 focus:ring-purple-600 ${
                              flagEval.flag === 'CRITICAL_LOW' || flagEval.flag === 'CRITICAL_HIGH'
                                ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold'
                                : flagEval.flag === 'HIGH' || flagEval.flag === 'LOW'
                                ? 'border-amber-400 bg-amber-50/40'
                                : 'border-slate-300 bg-white text-slate-900'
                            }`}
                          />
                        </div>
                      )}

                      <span className="text-xs text-slate-500 font-semibold w-16 truncate">
                        {param.unit}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Entered by: <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.role})</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => handleSaveResults(false)}
              className="px-4 py-2 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveResults(true)}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Save & Mark for Verification
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
