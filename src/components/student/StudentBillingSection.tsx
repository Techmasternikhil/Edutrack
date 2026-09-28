import React, { useState } from 'react';
import { FeeRecord, PaymentMethod } from '../../types';
import { formatINR, getFeeStatusBadgeClass } from '../../utils/academic';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Building,
  QrCode,
  Smartphone,
  Info
} from 'lucide-react';

interface StudentBillingSectionProps {
  studentId: string;
  studentName: string;
  fees: FeeRecord[];
  onPayFee: (feeId: string, paymentMethod: PaymentMethod, transactionRef: string) => void;
  isParentView?: boolean;
}

export const StudentBillingSection: React.FC<StudentBillingSectionProps> = ({
  studentId,
  studentName,
  fees,
  onPayFee,
  isParentView = false
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [mockUpiId, setMockUpiId] = useState('student@oksbi');
  const [mockCardNumber, setMockCardNumber] = useState('4532 •••• •••• 8821');
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<FeeRecord | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FeeRecord | null>(null);

  // Student specific fee list
  const studentFees = fees.filter((f) => f.studentId === studentId);

  const filteredFees = filterCategory === 'ALL'
    ? studentFees
    : studentFees.filter((f) => f.category === filterCategory);

  // Financial aggregates
  const totalInvoiced = studentFees.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = studentFees
    .filter((f) => f.status === 'PAID')
    .reduce((acc, f) => acc + (f.paidAmount || f.amount), 0);
  const totalPending = studentFees
    .filter((f) => f.status === 'PENDING')
    .reduce((acc, f) => acc + f.amount, 0);
  const totalOverdue = studentFees
    .filter((f) => f.status === 'OVERDUE')
    .reduce((acc, f) => acc + f.amount, 0);

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;

    const ref = paymentMethod === 'UPI'
      ? `UPI/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`
      : `TXN-CARD-${Date.now().toString().slice(-8)}`;

    onPayFee(payingFee.id, paymentMethod, ref);
    
    // Show success view
    setPaymentSuccessReceipt({
      ...payingFee,
      status: 'PAID',
      paidAt: new Date().toISOString(),
      paidAmount: payingFee.amount,
      paymentMethod,
      transactionRef: ref,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}-${payingFee.category.slice(0, 3)}`
    });
    setPayingFee(null);
  };

  const getStatusBadge = (status: FeeRecord['status']) => {
    const badgeClass = getFeeStatusBadgeClass(status);
    switch (status) {
      case 'PAID':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
            <CheckCircle2 className="w-3 h-3" /> PAID
          </span>
        );
      case 'OVERDUE':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border animate-pulse ${badgeClass}`}>
            <AlertTriangle className="w-3 h-3" /> OVERDUE
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {formatINR(totalInvoiced)}
          </div>
          <span className="text-[10px] text-slate-500">All semester billings</span>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-emerald-950/20 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Dues Cleared</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {formatINR(totalPaid)}
          </div>
          <span className="text-[10px] text-emerald-500/80">Paid & verified</span>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-amber-950/20 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending Dues</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {formatINR(totalPending)}
          </div>
          <span className="text-[10px] text-amber-500/80">Upcoming clearance</span>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-rose-950/20 border border-rose-500/20">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Overdue Dues</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
            {formatINR(totalOverdue)}
          </div>
          <span className="text-[10px] text-rose-500/80">Action required immediately</span>
        </div>
      </div>

      {/* Main Invoices Section */}
      <div className="p-6 rounded-2xl glass-panel space-y-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                {isParentView ? `Fee Account Statement for ${studentName}` : 'Student Fee & Billing Invoices'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Online semester fee clearance with instant automated e-receipts and payment records.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'TUITION', 'LAB_EXAM', 'LIBRARY', 'HOSTEL', 'TRANSPORT'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Item List */}
        {filteredFees.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No fee invoices found matching the selected filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFees.map((fee) => (
              <div
                key={fee.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  fee.status === 'OVERDUE'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : fee.status === 'PAID'
                    ? 'bg-slate-900/40 border-slate-800/80'
                    : 'bg-slate-800/30 border-slate-700/60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-white">{fee.title}</span>
                    {getStatusBadge(fee.status)}
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                      Sem {fee.semester} • {fee.academicYear}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {fee.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <div>
                      Due Date: <strong className={fee.status === 'OVERDUE' ? 'text-rose-400' : 'text-slate-200'}>{fee.dueDate}</strong>
                    </div>
                    {fee.paidAt && (
                      <div className="text-emerald-400">
                        Paid on {new Date(fee.paidAt).toLocaleDateString()} via {fee.paymentMethod}
                      </div>
                    )}
                    {fee.receiptNumber && (
                      <div className="font-mono text-indigo-300">
                        Receipt: #{fee.receiptNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-lg font-black text-white">
                      ₹{fee.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">Net Payable</div>
                  </div>

                  {fee.status === 'PAID' ? (
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(fee)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPayingFee(fee)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isParentView ? 'Pay for Ward' : 'Pay Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Online Payment Modal */}
      {payingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">EduTrack FastPay Gateway</h3>
              </div>
              <button
                type="button"
                onClick={() => setPayingFee(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Invoice:</div>
              <div className="text-sm font-bold text-white">{payingFee.title}</div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300">Total Payable Amount:</span>
                <span className="text-lg font-black text-emerald-400">₹{payingFee.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'NET_BANKING', 'DEBIT_CREDIT_CARD'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === m
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m === 'UPI' && <Smartphone className="w-4 h-4" />}
                      {m === 'NET_BANKING' && <Building className="w-4 h-4" />}
                      {m === 'DEBIT_CREDIT_CARD' && <CreditCard className="w-4 h-4" />}
                      <span>{m === 'DEBIT_CREDIT_CARD' ? 'Card' : m.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'UPI' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={mockUpiId}
                    onChange={(e) => setMockUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Supported: Google Pay, PhonePe, Paytm, BHIM UPI.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={mockCardNumber}
                    onChange={(e) => setMockCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40 text-[10px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-bit encrypted transaction through University Finance Portal.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingFee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Authorize ₹{payingFee.amount.toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Success or View Receipt Modal */}
      {(paymentSuccessReceipt || viewingReceipt) && (
        (() => {
          const rec = paymentSuccessReceipt || viewingReceipt!;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative text-slate-200">
                <div className="text-center space-y-1 pb-3 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Official University Fee Receipt</h3>
                  <p className="text-[11px] text-slate-400">EduTrack Financial Accounting Department</p>
                </div>

                <div className="space-y-2.5 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receipt No:</span>
                    <span className="font-bold text-white">{rec.receiptNumber || 'REC-2026-001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Name:</span>
                    <span className="text-white">{rec.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Particulars:</span>
                    <span className="text-white text-right max-w-[200px] truncate">{rec.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-bold text-emerald-400">₹{rec.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="text-white">{rec.paymentMethod || 'UPI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-slate-300 text-[10px]">{rec.transactionRef || 'TXN-CONFIRMED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-300 text-[10px]">{new Date(rec.paidAt || Date.now()).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSuccessReceipt(null);
                      setViewingReceipt(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
