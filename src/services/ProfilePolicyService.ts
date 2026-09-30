import { User, UserRole, ProfileApprovalLevel } from '../types';

export interface EditableFieldConfig {
  name: string;
  label: string;
  type: 'TEXT' | 'PHONE' | 'EMAIL' | 'IMAGE' | 'DATE';
  description?: string;
  placeholder?: string;
  required?: boolean;
}

export class ProfilePolicyService {
  /**
   * Protected institutional fields that must NEVER be modified via self-service profile edits.
   */
  private static readonly PROTECTED_FIELDS_BY_ROLE: Record<UserRole, string[]> = {
    STUDENT: [
      'id',
      'role',
      'regNumber',
      'classId',
      'className',
      'department',
      'semester',
      'gpa',
      'cgpa',
      'status',
      'accountStatus',
      'createdAt'
    ],
    PARENT: [
      'id',
      'role',
      'childStudentIds',
      'status',
      'accountStatus',
      'createdAt'
    ],
    FACULTY: [
      'id',
      'role',
      'department',
      'isClassTeacher',
      'assignedClassId',
      'assignedClassName',
      'isFacultyAdvisor',
      'academicYear',
      'status',
      'accountStatus',
      'createdAt'
    ],
    ADMIN: [
      'id',
      'role',
      'status',
      'accountStatus',
      'createdAt'
    ]
  };

  /**
   * Allowed editable fields by role.
   */
  private static readonly EDITABLE_FIELDS_BY_ROLE: Record<UserRole, EditableFieldConfig[]> = {
    STUDENT: [
      { name: 'name', label: 'Full Name', type: 'TEXT', placeholder: 'Your official name', required: true },
      { name: 'email', label: 'Institutional Email', type: 'EMAIL', placeholder: 'student@student.edutrack.edu', required: true },
      { name: 'phone', label: 'Mobile Number', type: 'PHONE', placeholder: '+91 98765 43210', required: true },
      { name: 'address', label: 'Residential Address', type: 'TEXT', placeholder: 'Permanent / Current residence' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'DATE', placeholder: 'YYYY-MM-DD' },
      { name: 'emergencyContact', label: 'Emergency Contact Person & Phone', type: 'TEXT', placeholder: 'Name & Phone number' }
    ],
    PARENT: [
      { name: 'name', label: 'Guardian / Parent Name', type: 'TEXT', placeholder: 'Full Name', required: true },
      { name: 'email', label: 'Email Address', type: 'EMAIL', placeholder: 'parent@domain.com', required: true },
      { name: 'phone', label: 'Primary Contact Number', type: 'PHONE', placeholder: '+91 98401 23456', required: true },
      { name: 'address', label: 'Permanent Family Address', type: 'TEXT', placeholder: 'Residential address' },
      { name: 'emergencyContact', label: 'Secondary Emergency Contact', type: 'TEXT', placeholder: 'Alternate relative contact' }
    ],
    FACULTY: [
      { name: 'name', label: 'Faculty Name', type: 'TEXT', placeholder: 'Prof. / Dr. Full Name', required: true },
      { name: 'email', label: 'Official University Email', type: 'EMAIL', placeholder: 'faculty@edutrack.edu', required: true },
      { name: 'phone', label: 'Faculty Mobile Number', type: 'PHONE', placeholder: '+91 94440 12345', required: true },
      { name: 'designation', label: 'Academic Designation', type: 'TEXT', placeholder: 'e.g. Associate Professor' },
      { name: 'address', label: 'Communication Address', type: 'TEXT', placeholder: 'Campus quarters or residential address' }
    ],
    ADMIN: [
      { name: 'name', label: 'Administrator Name', type: 'TEXT', placeholder: 'Full Name', required: true },
      { name: 'email', label: 'Official Admin Email', type: 'EMAIL', placeholder: 'admin@edutrack.edu', required: true },
      { name: 'phone', label: 'Contact Phone', type: 'PHONE', placeholder: '+91 98400 00000', required: true }
    ]
  };

  /**
   * Determine if a user can request an edit on a specific field.
   */
  public static canEditField(userRole: UserRole, fieldName: string): boolean {
    const protectedFields = this.PROTECTED_FIELDS_BY_ROLE[userRole] || [];
    if (protectedFields.includes(fieldName)) {
      return false;
    }
    const allowed = this.EDITABLE_FIELDS_BY_ROLE[userRole] || [];
    return allowed.some((f) => f.name === fieldName) || fieldName === 'avatarUrl';
  }

  /**
   * Retrieve the list of permitted editable fields for a given role.
   */
  public static getEditableFields(userRole: UserRole): EditableFieldConfig[] {
    return this.EDITABLE_FIELDS_BY_ROLE[userRole] || [];
  }

  /**
   * Determine the approval authority required for a user's role.
   * STUDENT -> CLASS_TEACHER
   * PARENT  -> CLASS_TEACHER (resolved via child's class)
   * FACULTY -> ADMIN
   * ADMIN   -> DIRECT (or institutional policy)
   */
  public static getApprovalAuthority(userRole: UserRole): ProfileApprovalLevel {
    if (userRole === 'STUDENT' || userRole === 'PARENT') {
      return 'CLASS_TEACHER';
    }
    return 'ADMIN';
  }

  /**
   * Does a requested profile change require an approval workflow?
   * Admin can perform direct updates; all others require approval.
   */
  public static requiresApproval(userRole: UserRole): boolean {
    return userRole !== 'ADMIN';
  }

  /**
   * Validate image mime type, file extension, and base64/buffer size.
   */
  public static validateImage(file: { name: string; type: string; size: number; base64?: string }): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { valid: false, error: `Invalid image extension (${ext}). Only JPG, PNG, and WEBP are permitted.` };
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { valid: false, error: `Invalid MIME type (${file.type}). Allowed: JPG, PNG, WEBP.` };
    }

    // Maximum 5MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds maximum institutional limit of 5MB.' };
    }

    // Check for script tags or dangerous SVG payloads if base64 provided
    if (file.base64) {
      const lower = file.base64.toLowerCase();
      if (lower.includes('<script') || lower.includes('javascript:') || lower.includes('<?php')) {
        return { valid: false, error: 'Malicious payload detected in image data.' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate proposed field changes against institutional rules.
   */
  public static validateProfileChange(
    userRole: UserRole,
    changes: Record<string, any>
  ): { valid: boolean; error?: string } {
    for (const [key, value] of Object.entries(changes)) {
      if (!this.canEditField(userRole, key)) {
        return {
          valid: false,
          error: `Field '${key}' is protected by institutional policy and cannot be altered via self-service profile requests.`
        };
      }

      if (key === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, error: 'Invalid email address format.' };
        }
      }

      if (key === 'phone' && value) {
        const phoneClean = String(value).replace(/[\s\-\(\)\+]/g, '');
        if (phoneClean.length < 10 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
          return { valid: false, error: 'Mobile number must contain 10 to 15 digits.' };
        }
      }

      if (key === 'name' && value) {
        if (String(value).trim().length < 2) {
          return { valid: false, error: 'Name must be at least 2 characters long.' };
        }
      }
    }

    return { valid: true };
  }
}
