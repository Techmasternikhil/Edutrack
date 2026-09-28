import React, { useState } from 'react';
import { FeeRecord, User, AcademicClass } from '../../types';
import { formatINR, getFeeStatusBadgeClass } from '../../utils/academic';
import {
  Receipt,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Search,
  Filter,
  CreditCard,
  Building
} from 'lucide-react';

interface BillingAlertManagerProps {
  fees: FeeRecord[];
  students: User[];
  senderName: string;
  senderRole: 'ADMIN' | 'FACULTY';
  onSendReminder: (feeId: string, customMessage?: string) => void;
  onCreateInvoice?: (invoiceData: {
    studentId: string;
    title: string;
    amount: number;
    dueDate: string;
    category: FeeRecord['category'];
    description: string;
    semester: number;
  }) => void;
  academicClasses?: AcademicClass[];
}

export const BillingAlertManager: React.FC<BillingAlertManagerProps> = ({
  fees,
  students,
  senderName,
  senderRole,
  onSendReminder,
  onCreateInvoice,
  academicClasses = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_AND_OVERDUE');
  const [remindingFee, setRemindingFee] = useState<FeeRecord | null>(null);
  const [customMsg, setCustomMsg] = useState('');
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  // Invoice creation modal state (for Admin)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newStudentId, setNewStudentId] = useState(students[0]?.id || '');
  const [newTitle, setNewTitle] = useState('Semester Examination & Lab Fee');
  const [newAmount, setNewAmount] = useState(15000);
  const [newDueDate, setNewDueDate] = useState('2026-10-25');
  const [newCategory, setNewCategory] = useState<FeeRecord['category']>('LAB_EXAM');
  const [newDescription, setNewDescription] = useState('Comprehensive practical examination, evaluation and certificate processing.');
  const [newSemester, setNewSemester] = useState(4);

  // Filter fees
  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.studentRegNumber && f.studentRegNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING_AND_OVERDUE') return f.status === 'PENDING' || f.status === 'OVERDUE';
    return f.status === statusFilter;
  });

  const totalInvoiced = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalCollected = fees.filter((f) => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0);
  const totalPendingDues = fees.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE').reduce((sum, f) => sum + f.amount, 0);
  const overdueCount = fees.filter((f) => f.status === 'OVERDUE').length;

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remindingFee) return;

    onSendReminder(remindingFee.id, customMsg.trim() || undefined);
    setSentSuccessId(remindingFee.id);
    setTimeout(() => {
      setSentSuccessId(null);
      setRemindingFee(null);
      setCustomMsg('');
    }, 1200);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateInvoice || !newStudentId) return;

    onCreateInvoice({
      studentId: newStudentId,
      title: newTitle,
      amount: Number(newAmount),
      dueDate: newDueDate,
      category: newCategory,
      description: newDescription,
      semester: Number(newSemester)
    });

    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Metric summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{formatINR(totalInvoiced)}</div>
          <span className="text-[10px] text-slate-500">{fees.length} Total Issued Records</span>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-emerald-950/20 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Collections Verified</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{formatINR(totalCollected)}</div>
          <span className="text-[10px] text-emerald-500/80">Cleared into account</span>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-amber-950/20 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending Institutional Dues</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{formatINR(totalPendingDues)}</div>
          <span className="text-[10px] text-amber-500/80">Awaiting clearance</span>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-rose-950/20 border border-rose-500/20">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Overdue Defaulters</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{overdueCount} Invoices</div>
          <span className="text-[10px] text-rose-500/80">Require urgent billing alerts</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="p-6 rounded-2xl glass-panel space-y-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                {senderRole === 'ADMIN' ? 'University Institutional Billing & Dues Control' : 'Student Academic Fees & Dues Overview'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Send instant high-priority billing reminder alerts directly to students and their associated guardians.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {senderRole === 'ADMIN' && onCreateInvoice && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Issue New Fee Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name, roll no, or fee title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'PENDING_AND_OVERDUE', label: 'Unpaid Dues' },
              { id: 'OVERDUE', label: 'Overdue Only' },
              { id: 'PAID', label: 'Paid Invoices' },
              { id: 'ALL', label: 'All Records' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === st.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="space-y-3">
          {filteredFees.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No fee invoice records match your criteria.
            </div>
          ) : (
            filteredFees.map((fee) => (
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
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{fee.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getFeeStatusBadgeClass(fee.status)}`}
                    >
                      {fee.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {fee.category} • Sem {fee.semester}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Student: <strong className="text-white">{fee.studentName}</strong> {fee.studentRegNumber && `(${fee.studentRegNumber})`}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <div>
                      Due: <strong className={fee.status === 'OVERDUE' ? 'text-rose-400 font-bold' : 'text-slate-300'}>{fee.dueDate}</strong>
                    </div>
                    {fee.paidAt && (
                      <div className="text-emerald-400">
                        Cleared on {new Date(fee.paidAt).toLocaleDateString()} (#{fee.receiptNumber})
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-base font-black text-white">{formatINR(fee.amount)}</div>
                    <div className="text-[10px] text-slate-400">{fee.status === 'PAID' ? 'Amount Cleared' : 'Outstanding'}</div>
                  </div>

                  {fee.status !== 'PAID' && (
                    <button
                      type="button"
                      onClick={() => setRemindingFee(fee)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
                        fee.status === 'OVERDUE'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Dispatch Alert</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dispatch Reminder Modal */}
      {remindingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <Bell className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Send Fee Reminder Alert</h3>
              </div>
              <button
                type="button"
                onClick={() => setRemindingFee(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sentSuccessId === remindingFee.id ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Alert Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  Notification successfully delivered to {remindingFee.studentName} and all linked parent portals.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReminderSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">Recipient Student & Guardians:</div>
                  <div className="font-bold text-white">{remindingFee.studentName}</div>
                  <div className="text-[11px] text-amber-400">
                    Outstanding: ₹{remindingFee.amount.toLocaleString('en-IN')} • Due: {remindingFee.dueDate}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Reminder Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder={`Dear ${remindingFee.studentName}, kindly ensure payment of ₹${remindingFee.amount.toLocaleString('en-IN')} for ${remindingFee.title} before the due date.`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    Dispatches high-priority in-app notification alerts with 2FA/SSL audit trail.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRemindingFee(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder Now</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create New Invoice Modal (Admin) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <Receipt className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Generate Student Fee Invoice</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Enrolled Student *
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.regNumber || s.email}) • Sem {s.semester || 4}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fee Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TUITION">Tuition & Academics</option>
                    <option value="LAB_EXAM">Lab & Examination</option>
                    <option value="LIBRARY">Library & Journals</option>
                    <option value="HOSTEL">Hostel & Accommodation</option>
                    <option value="TRANSPORT">University Bus Transport</option>
                    <option value="SPORTS_ACTIVITY">Sports & Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Invoice Title / Heading *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Invoice Particulars & Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Generate Invoice & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
