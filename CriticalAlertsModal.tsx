import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Phone, Clock, ShieldAlert } from 'lucide-react';
import { CriticalAlert, UserProfile } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';

interface CriticalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CriticalAlert[];
  currentUser: UserProfile;
  currentLang: Language;
  onAcknowledge: () => void;
}

export const CriticalAlertsModal: React.FC<CriticalAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentUser,
  currentLang,
  onAcknowledge
}) => {
  const t = getTranslation(currentLang);
  const [ackNotes, setAckNotes] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAck = (alertId: string) => {
    const notes = ackNotes[alertId] || 'Attending physician notified immediately via phone';
    storage.acknowledgeCriticalAlert(alertId, currentUser.id, currentUser.name, notes);
    onAcknowledge();
  };

  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const acknowledged = alerts.filter(a => a.acknowledged);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-rose-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-800 to-red-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{t.criticalAlert}</h2>
              <p className="text-xs text-rose-200">
                Panic Laboratory Threshold Values Requiring Immediate Clinical Action
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Active Panic Values */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2 flex items-center space-x-1.5">
              <span>Unacknowledged Alerts ({unacknowledged.length})</span>
            </h3>

            {unacknowledged.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All critical laboratory panic values have been clinically acknowledged.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {unacknowledged.map((alert) => (
                  <div key={alert.id} className="p-4 bg-rose-50/80 border-2 border-rose-300 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{alert.patientName}</span>
                          <span className="font-semibold text-xs text-purple-700">({alert.visitNumber})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                            {alert.flag}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Test: <span className="font-semibold">{alert.testName}</span> • Parameter: <span className="font-bold text-rose-800">{alert.parameterName}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-rose-700">
                          {alert.value} {alert.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1 text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{alert.patientPhone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                    {/* Acknowledgment action */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Action taken / Doctor notified remarks..."
                        value={ackNotes[alert.id] || ''}
                        onChange={(e) => setAckNotes({ ...ackNotes, [alert.id]: e.target.value })}
                        className="w-full text-xs px-3 py-1.5 border border-rose-300 rounded-lg bg-white"
                      />
                      <button
                        onClick={() => handleAck(alert.id)}
                        className="w-full sm:w-auto px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs whitespace-nowrap shadow-xs"
                      >
                        {t.acknowledge}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Acknowledged Alerts */}
          {acknowledged.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Recently Acknowledged Alerts
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {acknowledged.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{alert.patientName}</span> - {alert.parameterName}: {alert.value} {alert.unit}
                      <p className="text-[10px] text-slate-400">
                        Ack by {alert.acknowledgedBy} at {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString('en-IN') : ''}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Acknowledged
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
