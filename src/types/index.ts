export type UserRole = 'Admin' | 'Doctor' | 'Receptionist' | 'Pharmacist' | 'Billing Staff';

export interface UserAccount {
  id: number;
  userId: string; // Map to username or id
  username: string;
  email: string;
  passwordHash: string; // Simulated bcrypt hash
  role: UserRole;
  entityType?: 'Doctor' | 'Staff' | '';
  entityId?: string; // Link to doctor ID or staff ID
  is_active: boolean;
  failedAttempts: number;
  lockoutUntil?: string; // ISO date string
  password_reset_token?: string;
  password_reset_expires_at?: string;
  lastLogin?: string;
}

export interface PatientAllergy {
  allergen_name: string;
  allergy_type: 'Medication' | 'Food' | 'Environmental';
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface Patient {
  id: number;
  patientId: string; // SC-PAT-##### (mapped to patient_code)
  patient_code: string; // SC-PAT-#####
  full_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  cnic: string; // Unique
  contact_number: string;
  address: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  status: 'Active' | 'Inactive' | 'Admitted' | 'Discharged' | 'Deceased';
  is_active: boolean;
  registrationDate: string; // created_at equivalent
  allergies?: PatientAllergy[];
}

export interface Doctor {
  doctorId: string;
  name: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  contactInfo: string;
  consultationFee: number;
  schedule: {
    workingDays: string[]; // e.g., ['Monday', 'Wednesday']
    timeSlots: string[];  // e.g., ['09:00', '10:00', '11:00']
  };
  status: 'active' | 'inactive';
}

export interface Staff {
  staffId: string;
  name: string;
  role: string; // mapped to UserRole
  contactInfo: string;
  shiftTiming: string; // e.g., '09:00 - 17:00'
  status: 'active' | 'inactive';
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';

export interface Appointment {
  id: number;
  appointmentId: string; // SC-APT-#####
  patientId: string;
  doctorId: string;
  appointment_date: string; // YYYY-MM-DD
  slot_start_time: string; // HH:MM
  slot_end_time: string; // HH:MM
  status: AppointmentStatus;
  cancellation_reason?: 'Patient Request' | 'Doctor Unavailable' | 'Clinical Reason' | 'Other' | '';
  booked_by: string; // User ID
  created_at: string;
}

export interface Consultation {
  id: number;
  consultationId: string; // SC-CNS-#####
  appointmentId: string;
  patientId: string;
  doctorId: string;
  blood_pressure?: string;
  temperature?: number; // Decimal (4,1)
  pulse_rate?: number;
  weight_kg?: number;
  height_cm?: number;
  chief_complaint: string;
  clinical_notes?: string;
  diagnosis_description: string;
  diagnosis_code?: string; // ICD-10 code
  status: 'In Progress' | 'Completed';
  is_finalized: boolean;
  finalized_at?: string;
  version: number;
  history?: {
    diagnosis_description: string;
    clinical_notes?: string;
    updatedAt: string;
  }[];
}

export interface PrescriptionMedicine {
  medicineId: string;
  name: string;
  dosage: string; // e.g., '1-0-1'
  frequency: string; // e.g., 'Before Meal'
  duration: string; // e.g., '5 Days'
}

export interface Prescription {
  id: number;
  prescriptionId: string; // SC-RX-#####
  consultationId: string;
  patientId: string;
  doctorId: string;
  medicines: PrescriptionMedicine[];
  timestamp: string;
}

export type InvoiceStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  type: 'consultation' | 'medicine' | 'service';
  itemId?: string; // Linked reference if medicine
}

export interface Invoice {
  id: number;
  invoice_number: string; // SC-INV-######
  patientId: string;
  items: InvoiceItem[];
  consultation_fee: number;
  medicine_charges: number;
  additional_charges: number;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number; // read-only property
  payment_method?: 'Cash' | 'Card' | 'Bank Transfer' | '';
  payment_status: InvoiceStatus;
  is_finalized: boolean;
  issued_by: string; // UserAccount username/id
  timestamp: string;
  creditNoteReason?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  batch_number: string;
  category?: string;
  unit: 'Tablet' | 'Capsule' | 'Vial' | 'Box' | 'Other';
  unit_cost: number;
  quantity_in_stock: number;
  reorder_threshold: number;
  expiry_date: string; // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  is_active: boolean;
}

export interface Supplier {
  supplierId: string;
  name: string;
  contactInfo: string;
  supplierAddress: string;
  supplierPhone: string;
  supplierEmail: string;
  ntnNumber: string;
  purchaseOrderHistory: string[]; // Order IDs
}

export interface AuditLog {
  id: number;
  logId: string;
  userId: string;
  username: string;
  role: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAIL' | 'LOCKOUT' | 'PASSWORD_RESET' | 'ACCESS_DENIED';
  table_affected?: string; // model/table name
  record_id?: number; // PK of affected row
  action: string; // descriptive log message
  timestamp: string;
}
