import React, { useState } from 'react';
import { Stethoscope, Plus, Search, Phone, Building2, UserCheck, Edit3 } from 'lucide-react';
import { ReferringDoctor, UserProfile, Visit } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface DoctorManagementProps {
  doctors: ReferringDoctor[];
  visits: Visit[];
  currentUser: UserProfile;
  currentLang: Language;
  onUpdateDoctors: (doctors: ReferringDoctor[]) => void;
}

export const DoctorManagement: React.FC<DoctorManagementProps> = ({
  doctors,
  visits,
  currentUser,
  currentLang,
  onUpdateDoctors
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<ReferringDoctor | null>(null);

  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setName('');
    setDegree('MBBS, MD');
    setHospital('Seoni MP');
    setPhone('');
    setEmail('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: ReferringDoctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setDegree(doc.degree || '');
    setHospital(doc.hospital || '');
    setPhone(doc.phone || '');
    setEmail(doc.email || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated: ReferringDoctor[];
    if (editingDoctor) {
      updated = doctors.map(d => d.id === editingDoctor.id ? {
        ...d,
        name,
        degree,
        hospital,
        phone,
        email
      } : d);
    } else {
      const newDoc: ReferringDoctor = {
        id: 'doc-' + Date.now(),
        name,
        degree,
        hospital,
        phone,
        email,
        active: true
      };
      updated = [...doctors, newDoc];
    }

    storage.saveDoctors(updated);
    onUpdateDoctors(updated);
    setIsModalOpen(false);
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.hospital && d.hospital.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.doctors}
          </h2>
          <p className="text-xs text-slate-500">
            Consultant physician directory and patient referral tracking
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-purple-200 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Referring Doctor</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search doctors, hospital or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doc) => {
          const referralVisits = visits.filter(v => v.referringDoctorId === doc.id || (doc.id === 'doc-self' && !v.referringDoctorId));
          const totalRevenue = referralVisits.reduce((sum, v) => sum + (v.totalAmount - v.discountAmount), 0);

          return (
            <div key={doc.id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:border-purple-200 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{doc.name}</h3>
                    {doc.degree && <p className="text-[11px] text-purple-700 font-semibold">{doc.degree}</p>}
                    {doc.hospital && (
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </p>
                    )}
                    {doc.phone && (
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="p-1 text-slate-400 hover:text-purple-700"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Referred Patients</span>
                  <span className="font-bold text-slate-800">{referralVisits.length} visits</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase">Lab Billing</span>
                  <span className="font-bold text-purple-800">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-purple-100 overflow-hidden">
            <div className="px-5 py-4 bg-purple-800 text-white flex justify-between items-center">
              <span className="font-bold text-sm">
                {editingDoctor ? 'Edit Doctor Details' : 'Add Referring Consultant'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. S. K. Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications / Speciality</label>
                <input
                  type="text"
                  placeholder="MBBS, MD (Medicine)"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic / Hospital Name</label>
                <input
                  type="text"
                  placeholder="City Hospital, Seoni"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 94250 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 text-white font-bold rounded-xl"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
