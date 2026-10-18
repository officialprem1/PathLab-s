import React, { useState } from 'react';
import { 
  X, CreditCard, IndianRupee, Printer, Download, 
  CheckCircle2, Plus, Clock, FileText, QrCode
} from 'lucide-react';
import { Visit, Bill, UserProfile, LabSettings } from '../types/models';
import { Language, getTranslation } from '../i18n';
import { storage } from '../services/storage';
import { generateBillReceiptPdf, downloadPdfFile, printPdfDocument } from '../services/pdfGenerator';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  settings: LabSettings;
  currentUser: UserProfile;
  currentLang: Language;
  onPaymentSuccess: (bill: Bill, visit: Visit) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  visit,
  settings,
  currentUser,
  currentLang,
  onPaymentSuccess
}) => {
  const t = getTranslation(currentLang);

  // Find existing bill or initialize
  const existingBills = storage.getBills();
  const currentBill = existingBills.find(b => b.visitId === visit.id);

  const subtotal = visit.totalAmount;
  const discount = visit.discountAmount;
  const netTotal = Math.max(0, subtotal - discount);
  const paidAmount = visit.paidAmount;
  const balanceDue = Math.max(0, netTotal - paidAmount);

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(balanceDue);
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card' | 'other'>('cash');
  const [refNumber, setRefNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!isOpen || !visit) return null;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Please enter a valid payment amount greater than zero.');
      return;
    }
    if (payAmount > balanceDue) {
      const confirmOver = window.confirm(`Entered amount ₹${payAmount} is greater than remaining balance ₹${balanceDue}. Proceed?`);
      if (!confirmOver) return;
    }

    const { bill, visit: updatedVisit } = storage.recordPayment(
      visit.id,
      payAmount,
      payMethod,
      refNumber.trim() || undefined,
      currentUser.id,
      currentUser.name
    );

    onPaymentSuccess(bill, updatedVisit);
  };

  const handlePrintReceipt = () => {
    const dummyBill: Bill = currentBill || {
      id: 'bill-' + Date.now(),
      billNumber: 'INV-TEMP',
      visitId: visit.id,
      patientId: visit.patientId,
      subtotal,
      discount,
      netTotal,
      paidAmount,
      balanceDue,
      status: balanceDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const doc = generateBillReceiptPdf(dummyBill, visit, settings);
    printPdfDocument(doc);
  };

  const handleDownloadReceipt = () => {
    const dummyBill: Bill = currentBill || {
      id: 'bill-' + Date.now(),
      billNumber: 'INV-TEMP',
      visitId: visit.id,
      patientId: visit.patientId,
      subtotal,
      discount,
      netTotal,
      paidAmount,
      balanceDue,
      status: balanceDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const doc = generateBillReceiptPdf(dummyBill, visit, settings);
    downloadPdfFile(doc, `Receipt_${dummyBill.billNumber}_${visit.visitNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{t.billing} & Cashier</h2>
              <p className="text-xs text-purple-200">
                {visit.patient.fullName} • Visit #{visit.visitNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Bill Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Subtotal</span>
              <span className="text-base font-bold text-slate-800">₹{subtotal}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">{t.discount}</span>
              <span className="text-base font-bold text-slate-800">- ₹{discount}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Paid</span>
              <span className="text-base font-bold text-emerald-600">₹{paidAmount}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">{t.balance}</span>
              <span className={`text-base font-bold ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                ₹{balanceDue}
              </span>
            </div>
          </div>

          {/* Test Breakdown */}
          <div className="border border-purple-100 rounded-xl overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 font-bold text-xs text-purple-900">
              Ordered Test Line Items
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {visit.tests.map((test) => (
                <div key={test.id} className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{test.testName}</span>
                    <span className="text-slate-400 ml-2">({test.department})</span>
                  </div>
                  <span className="font-bold text-slate-700">₹{test.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Record New Payment Form if balance due > 0 */}
          {balanceDue > 0 ? (
            <form onSubmit={handleRecordPayment} className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900">
                Collect Payment
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Amount to collect */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount to Collect (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold text-purple-900 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-600 outline-hidden"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.paymentMode} *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['cash', 'upi', 'card', 'other'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPayMethod(m)}
                        className={`py-2 text-[11px] font-bold uppercase rounded-lg border transition-all ${
                          payMethod === m
                            ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference Number for UPI / Card */}
                {(payMethod === 'upi' || payMethod === 'card') && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      UPI Ref / UTR / Card Auth Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/402918237192"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Bill Settled in Full</p>
                <p className="text-emerald-700">Zero outstanding balance on this laboratory visit.</p>
              </div>
            </div>
          )}

          {/* Payment History Log */}
          {currentBill && currentBill.payments.length > 0 && (
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Payment Transactions
              </h3>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {currentBill.payments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold uppercase text-purple-900">{p.paymentMethod}</span>
                        {p.referenceNumber && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            Ref: {p.referenceNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.timestamp).toLocaleString('en-IN')} • By: {p.collectedBy}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-emerald-600">+ ₹{p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Receipt Actions */}
        <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintReceipt}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.printReceipt}</span>
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Download PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
