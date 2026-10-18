import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Check, X, Edit3, 
  Key, Lock, CheckCircle2, AlertCircle, Phone, Mail
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface StaffManagementProps {
  users: UserProfile[];
  currentUser: UserProfile;
  currentLang: Language;
  onUpdateUsers: (users: UserProfile[]) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  users,
  currentUser,
  currentLang,
  onUpdateUsers
}) => {
  const t = getTranslation(currentLang);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('staff');
    setDesignation('Medical Lab Technician');
    setPhone('');
    setPassword('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDesignation(user.designation || '');
    setPhone(user.phone || '');
    setPassword(user.password || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      alert('You cannot deactivate your own active session.');
      return;
    }
    const updatedStatus = !user.active;
    storage.updateStaffAccount(user.id, { active: updatedStatus }, currentUser);
    onUpdateUsers(storage.getUsers());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (editingUser) {
      const updates: Partial<UserProfile> = {
        name,
        role,
        designation,
        phone
      };
      if (password.trim()) {
        updates.password = password.trim();
      }
      storage.updateStaffAccount(editingUser.id, updates, currentUser);
      onUpdateUsers(storage.getUsers());
      setIsModalOpen(false);
    } else {
      if (!password || password.length < 5) {
        setErrorMsg('Password must be at least 5 characters long.');
        return;
      }
      const res = storage.createStaffAccount({
        name,
        email,
        role,
        designation,
        phone,
        password
      }, currentUser);

      if (res.success) {
        onUpdateUsers(storage.getUsers());
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.message || 'Failed to create user account.');
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Staff & Pathologist Accounts (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Administrator security control for laboratory personnel, roles, and access permissions
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-purple-200 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Role Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-1">
          <span className="font-bold text-xs text-purple-900 block flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Administrator</span>
          </span>
          <p className="text-[11px] text-purple-800">
            Full system control: lab configuration, personnel accounts, test pricing, database backups, and compliance audits.
          </p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-1">
          <span className="font-bold text-xs text-blue-900 block flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Lab Staff (Technicians)</span>
          </span>
          <p className="text-[11px] text-blue-800">
            Front-desk reception, patient registration, drawing samples, preliminary result entry, cashiering, and receipts.
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1">
          <span className="font-bold text-xs text-emerald-900 block flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pathologist (Doctor)</span>
          </span>
          <p className="text-[11px] text-emerald-800">
            Reviewing results, formula checks, clinical verification, digital report release, and controlled amendments.
          </p>
        </div>

      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold tracking-wider border-b border-purple-50">
              <tr>
                <th className="px-4 py-3">Staff Name & Designation</th>
                <th className="px-4 py-3">Contact Email / Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Sign-in</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                    
                    {/* Name & Designation */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[9px] font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{u.designation}</div>
                    </td>

                    {/* Email / Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-slate-800 font-mono text-[11px]">{u.email}</div>
                      {u.phone && <div className="text-[11px] text-slate-400">{u.phone}</div>}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'pathologist'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Active Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={isCurrent}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.active 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-emerald-50 hover:text-emerald-700'
                        } transition-colors`}
                        title={isCurrent ? 'Current active user' : 'Click to toggle active status'}
                      >
                        {u.active ? '● Active' : '○ Deactivated'}
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      }) : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="px-5 py-4 bg-purple-800 text-white flex justify-between items-center">
              <span className="font-bold text-sm">
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New Personnel Account'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Soni"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@maapathlab.com"
                  className="w-full px-3 py-2 border rounded-xl disabled:bg-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
                >
                  <option value="staff">Lab Staff (Technician / Receptionist)</option>
                  <option value="pathologist">Consultant Pathologist (Doctor)</option>
                  <option value="admin">Administrator (Lab Director)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation / Speciality</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior DMLT Technician"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94250 00000"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Change Password (leave blank to keep current)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800"
                >
                  Save Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
