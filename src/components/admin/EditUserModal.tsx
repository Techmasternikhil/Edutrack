import React, { useState } from 'react';
import { User, AcademicClass } from '../../types';
import { X, UserCheck, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: User) => void;
  academicClasses?: AcademicClass[];
  allStudents?: User[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  academicClasses = [],
  allStudents = []
}) => {
  if (!isOpen || !user) return null;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [department, setDepartment] = useState(user.department || '');
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status || 'APPROVED');
  const [accountStatus, setAccountStatus] = useState(user.accountStatus || 'ACTIVE');

  // Student specific
  const [regNumber, setRegNumber] = useState(user.regNumber || '');
  const [classId, setClassId] = useState(user.classId || (academicClasses[0]?.id || ''));
  const [semester, setSemester] = useState(user.semester || 1);
  const [gpa, setGpa] = useState(user.gpa || 3.5);

  // Faculty specific
  const [isClassTeacher, setIsClassTeacher] = useState(Boolean(user.isClassTeacher));
  const [assignedClassId, setAssignedClassId] = useState(user.assignedClassId || '');

  // Parent specific
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>(user.childStudentIds || []);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChildToggle = (studentId: string) => {
    if (selectedChildIds.includes(studentId)) {
      setSelectedChildIds(selectedChildIds.filter((id) => id !== studentId));
    } else {
      setSelectedChildIds([...selectedChildIds, studentId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }

    // Resolve class names
    let resolvedClassName = user.className;
    if (classId) {
      const cls = academicClasses.find((c) => c.id === classId);
      if (cls) {
        resolvedClassName = `${cls.className || cls.name} (${cls.section})`;
      }
    }

    let resolvedAssignedClassName = user.assignedClassName;
    if (isClassTeacher && assignedClassId) {
      const cls = academicClasses.find((c) => c.id === assignedClassId);
      if (cls) {
        resolvedAssignedClassName = `${cls.className || cls.name} (${cls.section})`;
      }
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
      role,
      status,
      accountStatus,
      // Student details
      ...(role === 'STUDENT'
        ? {
            regNumber: regNumber.trim() || undefined,
            classId: classId || undefined,
            className: resolvedClassName,
            semester: Number(semester) || 1,
            gpa: Number(gpa) || undefined
          }
        : {}),
      // Faculty details
      ...(role === 'FACULTY'
        ? {
            isClassTeacher,
            assignedClassId: isClassTeacher ? assignedClassId : undefined,
            assignedClassName: isClassTeacher ? resolvedAssignedClassName : undefined
          }
        : {}),
      // Parent details
      ...(role === 'PARENT'
        ? {
            childStudentIds: selectedChildIds
          }
        : {})
    };

    onSave(updatedUser);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Edit Registered User Profile</h2>
            <p className="text-xs text-slate-400">
              Update institutional credentials, academic classifications, and assigned affiliations.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account records updated and synced successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Basic Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department / Discipline
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* System Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institutional Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="FACULTY">FACULTY (Staff)</option>
                <option value="PARENT">PARENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verification Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Status
              </label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === 'STUDENT' && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Student Enrollment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registration / Roll Number
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. 2026-CSE-101"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Class & Section
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Academic Class --</option>
                    {academicClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className || c.name} ({c.section}) • Sem {c.semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    value={gpa}
                    onChange={(e) => setGpa(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Faculty / Staff Specific Fields */}
          {role === 'FACULTY' && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Faculty & Class Teacher Appointment
              </h4>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isClassTeacherCheckbox"
                  checked={isClassTeacher}
                  onChange={(e) => setIsClassTeacher(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isClassTeacherCheckbox" className="text-xs text-slate-200 cursor-pointer font-medium">
                  Appoint as Class Teacher (Receives student & parent registrations)
                </label>
              </div>

              {isClassTeacher && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Class & Section
                  </label>
                  <select
                    value={assignedClassId}
                    onChange={(e) => setAssignedClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select Class to Assign --</option>
                    {academicClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className || c.name} ({c.section}) • Sem {c.semester}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Parent Specific Fields */}
          {role === 'PARENT' && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Associated Wards / Children
                </h4>
                <span className="text-[11px] text-purple-300 font-medium">
                  {selectedChildIds.length} Child(ren) Linked
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Select the students whose academic reports, grades, and attendance this parent can monitor:
              </p>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/60">
                {allStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No students registered in the system yet.</p>
                ) : (
                  allStudents.map((s) => {
                    const isChecked = selectedChildIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? 'bg-purple-900/30 border border-purple-500/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleChildToggle(s.id)}
                            className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="font-semibold text-slate-200">{s.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">{s.regNumber || s.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{s.className || 'General'}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
