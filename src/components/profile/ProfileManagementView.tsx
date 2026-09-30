import React, { useState } from 'react';
import { User, ProfileChangeRequest } from '../../types';
import { ProfilePolicyService } from '../../services/ProfilePolicyService';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  Upload,
  ArrowRight,
  Shield,
  FileCheck2,
  Info
} from 'lucide-react';

interface ProfileManagementViewProps {
  currentUser: User;
  pendingRequest: ProfileChangeRequest | null;
  requestHistory: ProfileChangeRequest[];
  onSubmitRequest: (payload: { changes: Record<string, any>; pendingAvatarUrl?: string; requestType?: string }) => Promise<void>;
  onCancelRequest: (requestId: string) => Promise<void>;
}

export const ProfileManagementView: React.FC<ProfileManagementViewProps> = ({
  currentUser,
  pendingRequest,
  requestHistory,
  onSubmitRequest,
  onCancelRequest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form field state
  const editableFields = ProfilePolicyService.getEditableFields(currentUser.role);
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    editableFields.forEach((f) => {
      initial[f.name] = (currentUser as any)[f.name] ? String((currentUser as any)[f.name]) : '';
    });
    return initial;
  });

  // Avatar state
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const approvalAuthority = ProfilePolicyService.getApprovalAuthority(currentUser.role);
  const approverLabel = approvalAuthority === 'CLASS_TEACHER' ? 'Assigned Class Teacher' : 'University Administration';

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = ProfilePolicyService.validateImage({
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setNewAvatarUrl(base64);
      setAvatarPreview(base64);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  // Compute altered fields
  const changedFields = editableFields.filter((f) => {
    const currentVal = (currentUser as any)[f.name] ? String((currentUser as any)[f.name]) : '';
    const proposedVal = formValues[f.name] ? formValues[f.name].trim() : '';
    return currentVal !== proposedVal;
  });

  const hasAvatarChanged = Boolean(avatarPreview && avatarPreview !== currentUser.avatarUrl);
  const totalChangesCount = changedFields.length + (hasAvatarChanged ? 1 : 0);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (totalChangesCount === 0) {
      setValidationError('No profile modifications were made. Please adjust at least one field or photo.');
      return;
    }

    // Server-side mirror validation
    const changesObject: Record<string, any> = {};
    changedFields.forEach((f) => {
      changesObject[f.name] = formValues[f.name];
    });

    const validation = ProfilePolicyService.validateProfileChange(currentUser.role, changesObject);
    if (!validation.valid) {
      setValidationError(validation.error || 'Please correct the highlighted errors.');
      return;
    }

    setIsReviewing(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setValidationError(null);
    try {
      const changesObject: Record<string, any> = {};
      changedFields.forEach((f) => {
        changesObject[f.name] = formValues[f.name];
      });

      await onSubmitRequest({
        changes: changesObject,
        pendingAvatarUrl: hasAvatarChanged ? (newAvatarUrl || undefined) : undefined
      });

      setIsEditing(false);
      setIsReviewing(false);
      setAvatarPreview(null);
      setNewAvatarUrl('');
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to submit profile request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPending = async (reqId: string) => {
    if (!window.confirm('Are you sure you want to cancel this pending profile change request?')) return;
    setCancelling(true);
    try {
      await onCancelRequest(reqId);
    } catch (err: any) {
      alert(err?.message || 'Could not cancel request.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
            />
            {pendingRequest?.pendingAvatarUrl && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center gap-0.5 shadow">
                <Clock className="w-2.5 h-2.5" /> Pending
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.department || 'University Member'} {currentUser.className ? `• ${currentUser.className}` : ''}
            </p>
          </div>
        </div>

        <div>
          {!isEditing && !pendingRequest && (
            <button
              onClick={() => {
                setIsEditing(true);
                setIsReviewing(false);
                setValidationError(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}

          {pendingRequest && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span>Pending Endorsement</span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Request Alert Callout */}
      {pendingRequest && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Profile Update Request Under Review</h4>
                <p className="text-xs text-amber-200/90 mt-1">
                  You submitted changes on <strong className="text-white">{new Date(pendingRequest.submittedAt).toLocaleDateString()}</strong>. 
                  Your current profile remains active until <strong className="text-white">{approverLabel}</strong> approves your submission.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCancelPending(pendingRequest.id)}
              disabled={cancelling}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          </div>

          {/* Pending Changes Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-amber-500/20 bg-slate-950/60 p-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-amber-500/20 text-[11px] text-amber-300/80">
                  <th className="pb-2">Field</th>
                  <th className="pb-2">Active Official Value</th>
                  <th className="pb-2">Requested Value</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 text-slate-200">
                {pendingRequest.proposedChanges.map((change, idx) => (
                  <tr key={idx} className="hover:bg-amber-500/5">
                    <td className="py-2 font-medium text-white">{change.fieldLabel}</td>
                    <td className="py-2 text-slate-400 font-mono">{change.oldValue || '—'}</td>
                    <td className="py-2 text-emerald-400 font-semibold font-mono">{change.newValue}</td>
                    <td className="py-2 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
                {pendingRequest.pendingAvatarUrl && (
                  <tr className="hover:bg-amber-500/5">
                    <td className="py-2 font-medium text-white">Profile Photo</td>
                    <td className="py-2">
                      <img src={currentUser.avatarUrl} alt="Active" className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700" />
                    </td>
                    <td className="py-2">
                      <img src={pendingRequest.pendingAvatarUrl} alt="Pending" className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500" />
                    </td>
                    <td className="py-2 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editing Mode */}
      {isEditing && !isReviewing && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Request Profile Changes</h3>
              <p className="text-xs text-slate-400">
                Submissions are validated by institutional policy and require {approverLabel} endorsement before activation.
              </p>
            </div>
            <button
              onClick={() => {
                setIsEditing(false);
                setAvatarPreview(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleProceedToReview} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Profile Photo (JPEG, PNG, WEBP max 5MB)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Current"
                      className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-700 mx-auto"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Current Active</span>
                  </div>

                  {avatarPreview && (
                    <>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <div className="text-center">
                        <img
                          src={avatarPreview}
                          alt="Proposed"
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 mx-auto"
                        />
                        <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Proposed</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="file"
                    id="profile-photo-upload"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-photo-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/50 hover:bg-slate-800/40 text-xs text-slate-300 hover:text-white cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>{avatarPreview ? 'Choose Different Image' : 'Upload New Profile Photo'}</span>
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPreview(null);
                        setNewAvatarUrl('');
                      }}
                      className="mt-1 text-[11px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Revert to current photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editableFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>{field.label}</span>
                    {field.required && <span className="text-[10px] text-rose-400">*required</span>}
                  </label>
                  <input
                    type={field.type === 'EMAIL' ? 'email' : field.type === 'DATE' ? 'date' : 'text'}
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Non-Editable Protected Fields Notice */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Institutional credentials such as Role, Registration/Employee Code, Academic Class, and Department can only be modified by University Administration.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarPreview(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={totalChangesCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Review Proposed Changes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Screen Before Submission */}
      {isReviewing && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Review Profile Change Request</h3>
              <p className="text-xs text-slate-400">
                Please verify your proposed adjustments before forwarding to {approverLabel}.
              </p>
            </div>
            <button
              onClick={() => setIsReviewing(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Edit
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="pb-2">Field</th>
                  <th className="pb-2">Current Active Value</th>
                  <th className="pb-2">New Proposed Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {changedFields.map((f) => (
                  <tr key={f.name}>
                    <td className="py-2.5 font-medium text-white">{f.label}</td>
                    <td className="py-2.5 text-slate-400 font-mono">{(currentUser as any)[f.name] || '—'}</td>
                    <td className="py-2.5 text-emerald-400 font-semibold font-mono">{formValues[f.name]}</td>
                  </tr>
                ))}
                {hasAvatarChanged && (
                  <tr>
                    <td className="py-2.5 font-medium text-white">Profile Photo</td>
                    <td className="py-2.5">
                      <img src={currentUser.avatarUrl} alt="Current" className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700" />
                    </td>
                    <td className="py-2.5">
                      <img src={avatarPreview!} alt="Proposed" className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Approval Destination: <strong className="text-white">{approverLabel}</strong> (Expected Status: PENDING)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Active values preserved until approval</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsReviewing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Modify Fields
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Profile Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identity & Account Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Institutional Identity</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Official Name</span>
              <span className="text-white font-medium">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Role</span>
              <span className="text-indigo-400 font-semibold">{currentUser.role}</span>
            </div>
            {currentUser.department && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department</span>
                <span className="text-white">{currentUser.department}</span>
              </div>
            )}
            {currentUser.regNumber && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registration Number</span>
                <span className="font-mono text-slate-200">{currentUser.regNumber}</span>
              </div>
            )}
            {currentUser.className && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Class & Section</span>
                <span className="text-slate-200">{currentUser.className}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Personal Details Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Communication & Contact</span>
            <span className="text-[10px] text-slate-400">Self-Service Editable</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email
              </span>
              <span className="text-white font-mono">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Mobile
              </span>
              <span className="text-white font-mono">{currentUser.phone || '+91 Not Registered'}</span>
            </div>
            {currentUser.address && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Address
                </span>
                <span className="text-white text-right max-w-[200px] truncate">{currentUser.address}</span>
              </div>
            )}
            {currentUser.dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date of Birth
                </span>
                <span className="text-white font-mono">{currentUser.dateOfBirth}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Profile Requests Ledger */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Profile Change Audit History</h4>

        {requestHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No historical profile change requests on record.</p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {requestHistory.map((req) => (
              <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {req.requestType === 'PROFILE_IMAGE' ? 'Profile Photo Update' : 'Information & Profile Update'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : req.status === 'CANCELLED'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submitted: {new Date(req.submittedAt).toLocaleDateString()} • Approver: {req.approvalLevel === 'CLASS_TEACHER' ? 'Class Teacher' : 'Admin'}
                  </p>
                  {req.rejectionReason && (
                    <p className="text-[11px] text-rose-300 italic mt-1">
                      Reason: "{req.rejectionReason}"
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 text-right">
                  {req.reviewedBy && (
                    <div>Reviewed by: <strong className="text-slate-300">{req.reviewedBy}</strong></div>
                  )}
                  {req.reviewedAt && (
                    <div>{new Date(req.reviewedAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
