import React, { useState } from 'react';
import { ProfileChangeRequest, User } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowRight,
  Filter,
  Check,
  Building,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';

interface AdminFacultyProfileApprovalQueueProps {
  currentAdmin: User;
  requests: ProfileChangeRequest[];
  onApproveRequest: (requestId: string) => Promise<void>;
  onRejectRequest: (requestId: string, reason: string) => Promise<void>;
}

export const AdminFacultyProfileApprovalQueue: React.FC<AdminFacultyProfileApprovalQueueProps> = ({
  currentAdmin,
  requests,
  onApproveRequest,
  onRejectRequest
}) => {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'RESOLVED' | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<ProfileChangeRequest | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Faculty requests assigned to admin
  const facultyRequests = requests.filter((r) => r.approvalLevel === 'ADMIN' && r.userRole === 'FACULTY');

  const filtered = facultyRequests.filter((req) => {
    if (statusFilter === 'PENDING' && req.status !== 'PENDING') return false;
    if (statusFilter === 'RESOLVED' && req.status === 'PENDING') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return req.userName.toLowerCase().includes(q) || req.userEmail.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = facultyRequests.filter((r) => r.status === 'PENDING').length;

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await onApproveRequest(selectedRequest.id);
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err?.message || 'Error approving faculty profile request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      await onRejectRequest(selectedRequest.id, rejectionReason.trim());
      setSelectedRequest(null);
      setIsRejecting(false);
      setRejectionReason('');
    } catch (err: any) {
      alert(err?.message || 'Error declining faculty profile request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Faculty & Staff Profile Change Requests</h3>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review institutional changes submitted by University Faculty and Academic Staff members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'PENDING' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'RESOLVED' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by faculty name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Requests Ledger */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
          No faculty profile change requests currently matching your filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Requested Updates</th>
                <th className="p-4">Date Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.pendingAvatarUrl || req.currentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={req.userName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-white">{req.userName}</div>
                        <div className="text-[11px] text-slate-400">{req.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {req.proposedChanges.map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-300 border border-slate-800">
                          {c.fieldLabel}
                        </span>
                      ))}
                      {req.pendingAvatarUrl && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] text-amber-300 border border-amber-500/20">
                          New Photo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(req.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsRejecting(false);
                        setRejectionReason('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Review Faculty Profile Update</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applicant: <strong className="text-slate-200">{selectedRequest.userName}</strong> ({selectedRequest.userEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Profile Photo Comparison */}
            {selectedRequest.pendingAvatarUrl && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-white block">Faculty Photograph Verification</span>
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <img
                      src={selectedRequest.currentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Current"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-700 mx-auto"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">Current Active Photo</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-rose-400" />
                  <div className="text-center">
                    <img
                      src={selectedRequest.pendingAvatarUrl}
                      alt="Proposed"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500 mx-auto"
                    />
                    <span className="text-[11px] text-emerald-400 font-semibold block mt-1">Proposed Photo</span>
                  </div>
                </div>
              </div>
            )}

            {/* Proposed Fields Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="pb-2">Field</th>
                    <th className="pb-2">Current Active Value</th>
                    <th className="pb-2">Proposed New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {selectedRequest.proposedChanges.map((change, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-white">{change.fieldLabel}</td>
                      <td className="py-2.5 text-slate-400 font-mono">{change.oldValue || '—'}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold font-mono">{change.newValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rejection Mode */}
            {isRejecting ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <label className="text-xs font-semibold text-rose-300 block">
                  Mandatory Rejection Reason:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please clarify designation change with Dean of Academics."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-medium cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                  >
                    {actionLoading ? 'Declining...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            ) : (
              selectedRequest.status === 'PENDING' && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline Request</span>
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading ? 'Endorsing...' : 'Approve & Activate Profile'}</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
