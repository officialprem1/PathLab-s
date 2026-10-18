import React, { useState } from 'react';
import { 
  FlaskConical, Plus, Search, Edit3, Trash2, Check, 
  AlertTriangle, Filter, ChevronDown, ChevronRight, Layers, Sliders
} from 'lucide-react';
import { LabTest, TestParameter, DepartmentType, UserProfile, ReferenceRange } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface TestCatalogProps {
  tests: LabTest[];
  currentUser: UserProfile;
  currentLang: Language;
  onUpdateTests: (tests: LabTest[]) => void;
}

export const TestCatalog: React.FC<TestCatalogProps> = ({
  tests,
  currentUser,
  currentLang,
  onUpdateTests
}) => {
  const t = getTranslation(currentLang);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // New / Edit Test Modal State
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const departments: DepartmentType[] = [
    'Hematology',
    'Clinical Pathology',
    'Biochemistry',
    'Serology/Immunology',
    'Microbiology',
    'Endocrinology',
    'Coagulation',
    'Other'
  ];

  const filteredTests = tests.filter(test => {
    const matchSearch = 
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'all' || test.department === selectedDept;
    return matchSearch && matchDept;
  });

  const handleOpenNewTest = () => {
    const newTest: LabTest = {
      id: 'test-' + Date.now(),
      department: 'Biochemistry',
      code: 'NEW_TEST',
      name: 'New Custom Laboratory Test',
      description: 'Custom test profile',
      price: 250,
      sampleType: 'Serum (2 ml)',
      turnaroundHours: 3,
      isPanel: false,
      active: true,
      parameters: [
        {
          id: 'p-' + Date.now(),
          testId: 'test-' + Date.now(),
          name: 'Primary Parameter',
          code: 'PARAM_1',
          unit: 'mg/dL',
          type: 'numeric',
          decimalPrecision: 1,
          displayOrder: 1,
          ranges: [
            {
              id: 'r-' + Date.now(),
              parameterId: 'p-' + Date.now(),
              gender: 'all',
              normalMin: 10,
              normalMax: 50,
              criticalLow: 5,
              criticalHigh: 100
            }
          ]
        }
      ]
    };
    setEditingTest(newTest);
    setIsModalOpen(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    const existingIndex = tests.findIndex(t => t.id === editingTest.id);
    let updated: LabTest[];
    if (existingIndex >= 0) {
      updated = [...tests];
      updated[existingIndex] = editingTest;
    } else {
      updated = [editingTest, ...tests];
    }

    storage.saveTests(updated, currentUser.id, currentUser.name);
    onUpdateTests(updated);
    setIsModalOpen(false);
    setEditingTest(null);
  };

  const handleDeleteTest = (testId: string) => {
    if (!isAdmin) {
      alert('Only administrators can remove tests from the catalog.');
      return;
    }
    const confirmDelete = window.confirm('Are you sure you want to deactivate/delete this test from the laboratory catalogue?');
    if (!confirmDelete) return;

    const updated = tests.filter(t => t.id !== testId);
    storage.saveTests(updated, currentUser.id, currentUser.name);
    onUpdateTests(updated);
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Disclaimer */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.catalog}
          </h2>
          <p className="text-xs text-slate-500">
            Configure investigation parameters, specimen types, clinical reference intervals, and prices
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenNewTest}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Test / Panel</span>
          </button>
        )}
      </div>

      {/* Starter Data Notice Warning */}
      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start space-x-2.5 text-xs text-purple-900">
        <AlertTriangle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Starter Catalog Notice:</span> {t.starterDataNotice}
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search test name, code, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
              selectedDept === 'all'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
            }`}
          >
            All Departments ({tests.length})
          </button>
          {departments.map((dept) => {
            const count = tests.filter(t => t.department === dept).length;
            if (count === 0 && selectedDept !== dept) return null;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                  selectedDept === dept
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tests Catalog Cards List */}
      <div className="space-y-3">
        {filteredTests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No tests found matching the selected filters.
          </div>
        ) : (
          filteredTests.map((test) => {
            const isExpanded = expandedTestId === test.id;
            return (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-purple-100 shadow-2xs overflow-hidden transition-all hover:border-purple-200"
              >
                {/* Header Row */}
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-lg mt-0.5">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{test.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {test.code}
                        </span>
                        {test.isPanel && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Panel ({test.parameters?.length || 0} params)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-purple-900">{test.department}</span> • Sample: {test.sampleType} • Turnaround: {test.turnaroundHours}h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">₹{test.price}</span>
                      <span className="text-[10px] text-slate-400 block">Retail Price</span>
                    </div>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingTest(test);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit test configuration"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete test"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Parameter & Reference Range Table */}
                {isExpanded && (
                  <div className="border-t border-purple-50 bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Configured Parameters & Reference Intervals
                    </h4>

                    {test.parameters && test.parameters.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2">Parameter</th>
                              <th className="px-3 py-2">Code</th>
                              <th className="px-3 py-2">Unit</th>
                              <th className="px-3 py-2">Type</th>
                              <th className="px-3 py-2">Normal Range</th>
                              <th className="px-3 py-2">Critical Limits</th>
                              <th className="px-3 py-2">Method</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {test.parameters.map((param) => {
                              const range = param.ranges[0];
                              const normalText = range?.normalMin !== undefined && range?.normalMax !== undefined
                                ? `${range.normalMin} - ${range.normalMax}`
                                : range?.textInterpretation || '-';
                              const criticalText = (range?.criticalLow !== undefined || range?.criticalHigh !== undefined)
                                ? `Low < ${range?.criticalLow ?? '-'}, High > ${range?.criticalHigh ?? '-'}`
                                : 'None';

                              return (
                                <tr key={param.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-semibold text-slate-900">{param.name}</td>
                                  <td className="px-3 py-2 font-mono text-[10px] text-purple-700">{param.code}</td>
                                  <td className="px-3 py-2">{param.unit || '-'}</td>
                                  <td className="px-3 py-2 capitalize text-slate-500">{param.type}</td>
                                  <td className="px-3 py-2 font-medium text-emerald-700">{normalText}</td>
                                  <td className="px-3 py-2 text-rose-600 font-semibold">{criticalText}</td>
                                  <td className="px-3 py-2 text-slate-400">{param.method || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No parameters configured.</p>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Edit / New Test Modal */}
      {isModalOpen && editingTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-purple-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingTest.name ? `Edit: ${editingTest.name}` : 'Create New Investigation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Test Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTest.name}
                    onChange={(e) => setEditingTest({ ...editingTest, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={editingTest.department}
                    onChange={(e) => setEditingTest({ ...editingTest, department: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Code *</label>
                  <input
                    type="text"
                    required
                    value={editingTest.code}
                    onChange={(e) => setEditingTest({ ...editingTest, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retail Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingTest.price}
                    onChange={(e) => setEditingTest({ ...editingTest, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specimen / Sample Type</label>
                  <input
                    type="text"
                    value={editingTest.sampleType}
                    onChange={(e) => setEditingTest({ ...editingTest, sampleType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800"
                >
                  Save Test Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
