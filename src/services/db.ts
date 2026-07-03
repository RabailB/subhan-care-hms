import { 
  Patient, 
  Doctor, 
  Staff, 
  Appointment, 
  Consultation, 
  Prescription, 
  Invoice, 
  InventoryItem, 
  Supplier, 
  AuditLog, 
  UserAccount,
  UserRole
} from '../types';

// Constants
const DB_PREFIX = 'subhancare_';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Initial Seeds
const INITIAL_DOCTORS: Doctor[] = [
  {
    doctorId: 'doc-1',
    name: 'Dr. Subhan Ahmed',
    specialization: 'Cardiology',
    qualification: 'MBBS, FCPS',
    licenseNumber: 'PMDC-77889-P',
    contactInfo: '+92 300 1234567',
    consultationFee: 1500,
    schedule: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      timeSlots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00']
    },
    status: 'active'
  },
  {
    doctorId: 'doc-2',
    name: 'Dr. Ayesha Malik',
    specialization: 'Pediatrics',
    qualification: 'MBBS, MD',
    licenseNumber: 'PMDC-55662-P',
    contactInfo: '+92 321 9876543',
    consultationFee: 1200,
    schedule: {
      workingDays: ['Tuesday', 'Thursday', 'Friday'],
      timeSlots: ['10:00', '11:00', '12:00', '15:00', '16:00']
    },
    status: 'active'
  }
];

const INITIAL_STAFF: Staff[] = [
  {
    staffId: 'staff-1',
    name: 'Sara Khan',
    role: 'receptionist',
    contactInfo: '+92 333 4567890',
    shiftTiming: '08:00 - 16:00',
    status: 'active'
  },
  {
    staffId: 'staff-2',
    name: 'Waseem Ali',
    role: 'pharmacist',
    contactInfo: '+92 312 3456789',
    shiftTiming: '09:00 - 17:00',
    status: 'active'
  },
  {
    staffId: 'staff-3',
    name: 'Bilal Hassan',
    role: 'billing',
    contactInfo: '+92 345 6789012',
    shiftTiming: '09:00 - 17:00',
    status: 'active'
  }
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    userId: 'usr-admin',
    username: 'admin',
    email: 'admin@subhancare.pk',
    passwordHash: 'admin123', // In a real app this is bcrypt, we will do a simple match simulation
    role: 'Admin',
    entityType: 'Staff',
    entityId: 'admin',
    is_active: true,
    failedAttempts: 0
  },
  {
    id: 2,
    userId: 'usr-doctor-1',
    username: 'doctor',
    email: 'doctor@subhancare.pk',
    passwordHash: 'doctor123',
    role: 'Doctor',
    entityType: 'Doctor',
    entityId: 'doc-1',
    is_active: true,
    failedAttempts: 0
  },
  {
    id: 3,
    userId: 'usr-receptionist-1',
    username: 'receptionist',
    email: 'receptionist@subhancare.pk',
    passwordHash: 'recept123',
    role: 'Receptionist',
    entityType: 'Staff',
    entityId: 'staff-1',
    is_active: true,
    failedAttempts: 0
  },
  {
    id: 4,
    userId: 'usr-pharmacist-1',
    username: 'pharmacist',
    email: 'pharmacist@subhancare.pk',
    passwordHash: 'pharma123',
    role: 'Pharmacist',
    entityType: 'Staff',
    entityId: 'staff-2',
    is_active: true,
    failedAttempts: 0
  },
  {
    id: 5,
    userId: 'usr-billing-1',
    username: 'billing',
    email: 'billing@subhancare.pk',
    passwordHash: 'billing123',
    role: 'Billing Staff',
    entityType: 'Staff',
    entityId: 'staff-3',
    is_active: true,
    failedAttempts: 0
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    itemId: 'item-1',
    name: 'Panadol 500mg',
    batchNumber: 'B-PNDL-101',
    expiryDate: '2027-12-31',
    quantityInStock: 250,
    reorderThreshold: 50,
    supplierId: 'sup-1',
    supplierName: 'Subhan Pharma Distributors'
  },
  {
    itemId: 'item-2',
    name: 'Amoxil 250mg Suspension',
    batchNumber: 'B-AMX-204',
    expiryDate: '2026-11-30',
    quantityInStock: 80,
    reorderThreshold: 20,
    supplierId: 'sup-1',
    supplierName: 'Subhan Pharma Distributors'
  },
  {
    itemId: 'item-3',
    name: 'Surbex-Z Tablets',
    batchNumber: 'B-SRBX-902',
    expiryDate: '2026-08-15', // Near expiry
    quantityInStock: 12,
    reorderThreshold: 15,
    supplierId: 'sup-2',
    supplierName: 'Ali Allied Supplies'
  }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    supplierId: 'sup-1',
    name: 'Subhan Pharma Distributors',
    contactInfo: '021-3456789',
    supplierAddress: 'Office 402, Shahrah-e-Faisal, Karachi',
    supplierPhone: '0300-1234567',
    supplierEmail: 'info@subhanpharma.com',
    ntnNumber: '1234567-8',
    purchaseOrderHistory: []
  },
  {
    supplierId: 'sup-2',
    name: 'Ali Allied Supplies',
    contactInfo: '042-9988776',
    supplierAddress: 'Gaddafi Stadium Market, Lahore',
    supplierPhone: '0321-9876543',
    supplierEmail: 'contact@aliallied.com',
    ntnNumber: '9876543-2',
    purchaseOrderHistory: []
  }
];

const INITIAL_PATIENTS: Patient[] = [
  {
    patientId: 'SC-PAT-00001',
    name: 'Muhammad Ali',
    dob: '1985-05-12',
    gender: 'Male',
    cnic: '42101-1234567-1',
    contact: '+92 300 7654321',
    address: 'Flat 12-B, Gulshan-e-Iqbal, Karachi',
    emergencyContact: '+92 321 1122334',
    emergencyContactRelationship: 'Brother',
    bloodGroup: 'B+',
    allergies: 'Penicillin',
    maritalStatus: 'Married',
    occupation: 'Software Engineer',
    registrationDate: '2026-06-01T10:00:00Z',
    status: 'active'
  },
  {
    patientId: 'SC-PAT-00002',
    name: 'Fatima Zahra',
    dob: '1992-09-24',
    gender: 'Female',
    cnic: '42201-9876543-2',
    contact: '+92 333 9988776',
    address: 'House 41, Defence Phase 5, Karachi',
    emergencyContact: '+92 300 9988776',
    emergencyContactRelationship: 'Husband',
    bloodGroup: 'O+',
    allergies: 'None',
    maritalStatus: 'Married',
    occupation: 'Teacher',
    registrationDate: '2026-06-15T11:30:00Z',
    status: 'active'
  }
];

// Helper methods to access local storage
function readTable<T>(tableName: string): T[] {
  const data = localStorage.getItem(DB_PREFIX + tableName);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTable<T>(tableName: string, data: T[]): void {
  localStorage.setItem(DB_PREFIX + tableName, JSON.stringify(data));
}

// Database Engine initialization
export const initializeDatabase = (force = false): void => {
  const versionKey = DB_PREFIX + 'db_version_v3'; // Version upgrade key to force reseed
  const needsReseed = !localStorage.getItem(versionKey);

  if (force || !localStorage.getItem(DB_PREFIX + 'UserAccount') || needsReseed) {
    writeTable<UserAccount>('UserAccount', INITIAL_USERS);
    writeTable<Doctor>('Doctor', INITIAL_DOCTORS);
    writeTable<Staff>('Staff', INITIAL_STAFF);
    writeTable<Patient>('Patient', INITIAL_PATIENTS);
    writeTable<InventoryItem>('InventoryItem', INITIAL_INVENTORY);
    writeTable<Supplier>('Supplier', INITIAL_SUPPLIERS);
    writeTable<Appointment>('Appointment', []);
    writeTable<Consultation>('Consultation', []);
    writeTable<Prescription>('Prescription', []);
    writeTable<Invoice>('Invoice', []);
    writeTable<AuditLog>('AuditLog', [
      {
        logId: 'log-init',
        userId: 'usr-admin',
        username: 'admin',
        role: 'Admin',
        action: 'System Initialized and Seed Data Inserted',
        affectedTable: 'System',
        affectedRecordId: 'all',
        timestamp: new Date().toISOString()
      }
    ]);
    localStorage.setItem(versionKey, 'true');
  }
};

// Logger Helper
export const logActivity = (
  userId: string,
  username: string,
  role: string,
  action: string,
  affectedTable: string,
  affectedRecordId: string
): void => {
  const logs = readTable<AuditLog>('AuditLog');
  const newLog: AuditLog = {
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    username,
    role,
    action,
    affectedTable,
    affectedRecordId,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog); // Put new log at the start
  writeTable<AuditLog>('AuditLog', logs);
};

// Database APIs
export const db = {
  // Authentication
  login: (username: string, passwordPlain: string): { success: boolean; user?: UserAccount; error?: string } => {
    const users = readTable<UserAccount>('UserAccount');
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

    if (userIndex === -1) {
      return { success: false, error: 'User does not exist.' };
    }

    const user = users[userIndex];

    // Check account status
    if (user.status === 'inactive') {
      return { success: false, error: 'Account is deactivated. Contact Admin.' };
    }

    // Check lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockoutUntil).getTime() - new Date().getTime()) / 60000);
      return { success: false, error: `Account locked. Try again in ${remainingMin} minutes.` };
    }

    // Check password (simulating secure match)
    if (user.passwordHash === passwordPlain) {
      // Reset failed attempts
      user.failedAttempts = 0;
      user.lockoutUntil = undefined;
      user.lastLogin = new Date().toISOString();
      users[userIndex] = user;
      writeTable<UserAccount>('UserAccount', users);

      logActivity(user.userId, user.username, user.role, 'User Login Successful', 'UserAccount', user.userId);
      return { success: true, user };
    } else {
      // Increment failed attempts
      user.failedAttempts += 1;
      let errorMsg = 'Invalid password.';
      
      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + LOCKOUT_MINUTES);
        user.lockoutUntil = lockoutTime.toISOString();
        errorMsg = `Too many failed login attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`;
        logActivity('system', 'system', 'system', `Account Locked: ${username}`, 'UserAccount', user.userId);
      } else {
        errorMsg += ` Attempt ${user.failedAttempts} of ${MAX_FAILED_ATTEMPTS}.`;
      }

      users[userIndex] = user;
      writeTable<UserAccount>('UserAccount', users);
      
      logActivity(user.userId, user.username, user.role, `Failed Login Attempt (${user.failedAttempts}/${MAX_FAILED_ATTEMPTS})`, 'UserAccount', user.userId);
      return { success: false, error: errorMsg };
    }
  },

  resetPassword: (username: string, contactNum: string, newPasswordPlain: string): { success: boolean; error?: string } => {
    const users = readTable<UserAccount>('UserAccount');
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

    if (userIndex === -1) {
      return { success: false, error: 'User does not exist.' };
    }

    const user = users[userIndex];
    // Check if linked entity contact matches
    let contactValid = false;

    if (user.role === 'admin') {
      contactValid = true; // Special mock exception for administrative reset
    } else if (user.role === 'doctor') {
      const doctors = readTable<Doctor>('Doctor');
      const doc = doctors.find(d => d.doctorId === user.linkedEntityId);
      if (doc && doc.contactInfo.includes(contactNum)) contactValid = true;
    } else {
      const staff = readTable<Staff>('Staff');
      const st = staff.find(s => s.staffId === user.linkedEntityId);
      if (st && st.contactInfo.includes(contactNum)) contactValid = true;
    }

    if (!contactValid) {
      return { success: false, error: 'Contact number verification failed.' };
    }

    user.passwordHash = newPasswordPlain;
    user.failedAttempts = 0;
    user.lockoutUntil = undefined;
    users[userIndex] = user;
    writeTable<UserAccount>('UserAccount', users);

    logActivity(user.userId, user.username, user.role, 'Password Reset Successful via Verification', 'UserAccount', user.userId);
    return { success: true };
  },

  // Patients
  getPatients: (): Patient[] => readTable<Patient>('Patient').filter(p => p.status === 'active'),
  
  registerPatient: (patientData: Omit<Patient, 'patientId' | 'registrationDate' | 'status'>, operator: { userId: string; username: string; role: string }): { success: boolean; patient?: Patient; error?: string } => {
    const patients = readTable<Patient>('Patient');

    // FR-01.6 Prevent duplicate patient registration by validating CNIC
    const duplicate = patients.find(p => p.cnic === patientData.cnic && p.status === 'active');
    if (duplicate) {
      return { success: false, error: `Patient with CNIC ${patientData.cnic} is already registered (Patient ID: ${duplicate.patientId}).` };
    }

    const count = patients.length + 1;
    const patientId = `SC-PAT-${String(count).padStart(5, '0')}`;
    
    const newPatient: Patient = {
      ...patientData,
      patientId,
      registrationDate: new Date().toISOString(),
      status: 'active'
    };

    patients.push(newPatient);
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Registered New Patient (${patientId})`, 'Patient', patientId);
    return { success: true, patient: newPatient };
  },

  updatePatient: (patientId: string, updatedData: Partial<Patient>, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const patients = readTable<Patient>('Patient');
    const index = patients.findIndex(p => p.patientId === patientId && p.status === 'active');

    if (index === -1) return { success: false, error: 'Patient not found.' };

    // Prevent cnic duplicates on update
    if (updatedData.cnic && updatedData.cnic !== patients[index].cnic) {
      const duplicate = patients.find(p => p.cnic === updatedData.cnic && p.patientId !== patientId && p.status === 'active');
      if (duplicate) {
        return { success: false, error: `CNIC ${updatedData.cnic} is already registered to another patient.` };
      }
    }

    patients[index] = { ...patients[index], ...updatedData };
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Updated Patient Details (${patientId})`, 'Patient', patientId);
    return { success: true };
  },

  deactivatePatient: (patientId: string, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const patients = readTable<Patient>('Patient');
    const index = patients.findIndex(p => p.patientId === patientId);

    if (index === -1) return { success: false, error: 'Patient not found.' };

    patients[index].status = 'inactive';
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Soft Deleted/Deactivated Patient (${patientId})`, 'Patient', patientId);
    return { success: true };
  },

  // Doctors
  getDoctors: (): Doctor[] => readTable<Doctor>('Doctor').filter(d => d.status === 'active'),
  
  createDoctor: (doctorData: Omit<Doctor, 'doctorId' | 'status'>, operator: { userId: string; username: string; role: string }): { success: boolean; doctor?: Doctor } => {
    const doctors = readTable<Doctor>('Doctor');
    const doctorId = `doc-${doctors.length + 1}`;
    
    const newDoc: Doctor = {
      ...doctorData,
      doctorId,
      status: 'active'
    };

    doctors.push(newDoc);
    writeTable<Doctor>('Doctor', doctors);

    // Create user account for doctor
    const users = readTable<UserAccount>('UserAccount');
    const doctorUsername = doctorData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const newDocUser: UserAccount = {
      id: users.length + 1,
      userId: `usr-${doctorId}`,
      username: doctorUsername,
      email: `${doctorUsername}@subhancare.pk`,
      passwordHash: 'doctor123', // Default password
      role: 'Doctor',
      entityType: 'Doctor',
      entityId: doctorId,
      is_active: true,
      failedAttempts: 0
    };
    users.push(newDocUser);
    writeTable<UserAccount>('UserAccount', users);

    logActivity(operator.userId, operator.username, operator.role, `Created Doctor Profile & Account (${doctorId})`, 'Doctor', doctorId);
    return { success: true, doctor: newDoc };
  },

  updateDoctorSchedule: (doctorId: string, schedule: Doctor['schedule'], operator: { userId: string; username: string; role: string }): { success: boolean } => {
    const doctors = readTable<Doctor>('Doctor');
    const index = doctors.findIndex(d => d.doctorId === doctorId);
    if (index === -1) return { success: false };

    doctors[index].schedule = schedule;
    writeTable<Doctor>('Doctor', doctors);

    logActivity(operator.userId, operator.username, operator.role, `Updated Doctor Schedule (${doctorId})`, 'Doctor', doctorId);
    return { success: true };
  },

  deactivateDoctor: (doctorId: string, operator: { userId: string; username: string; role: string }): { success: boolean } => {
    const doctors = readTable<Doctor>('Doctor');
    const index = doctors.findIndex(d => d.doctorId === doctorId);
    if (index === -1) return { success: false };

    doctors[index].status = 'inactive';
    writeTable<Doctor>('Doctor', doctors);

    // Lock corresponding user account
    const users = readTable<UserAccount>('UserAccount');
    const uIndex = users.findIndex(u => u.entityId === doctorId && u.role === 'Doctor');
    if (uIndex !== -1) {
      users[uIndex].is_active = false;
      writeTable<UserAccount>('UserAccount', users);
    }

    logActivity(operator.userId, operator.username, operator.role, `Deactivated Doctor Profile & Linked Login (${doctorId})`, 'Doctor', doctorId);
    return { success: true };
  },

  // Staff Management
  getStaff: (): Staff[] => readTable<Staff>('Staff').filter(s => s.status === 'active'),
  
  createStaff: (staffData: Omit<Staff, 'staffId' | 'status'>, operator: { userId: string; username: string; role: string }): { success: boolean; staff?: Staff } => {
    const staff = readTable<Staff>('Staff');
    const staffId = `staff-${staff.length + 1}`;
    
    const newStaff: Staff = {
      ...staffData,
      staffId,
      status: 'active'
    };

    staff.push(newStaff);
    writeTable<Staff>('Staff', staff);

    // Create account for staff
    const users = readTable<UserAccount>('UserAccount');
    const staffUsername = staffData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const roleMapping: Record<string, UserRole> = {
      receptionist: 'Receptionist',
      pharmacist: 'Pharmacist',
      billing: 'Billing Staff',
      Receptionist: 'Receptionist',
      Pharmacist: 'Pharmacist',
      'Billing Staff': 'Billing Staff'
    };
    const userRole = roleMapping[staffData.role] || 'Receptionist';

    const newStaffUser: UserAccount = {
      id: users.length + 1,
      userId: `usr-${staffId}`,
      username: staffUsername,
      email: `${staffUsername}@subhancare.pk`,
      passwordHash: `${staffUsername}123`,
      role: userRole,
      entityType: 'Staff',
      entityId: staffId,
      is_active: true,
      failedAttempts: 0
    };
    users.push(newStaffUser);
    writeTable<UserAccount>('UserAccount', users);

    logActivity(operator.userId, operator.username, operator.role, `Created Staff Profile & Account (${staffId})`, 'Staff', staffId);
    return { success: true, staff: newStaff };
  },

  deactivateStaff: (staffId: string, operator: { userId: string; username: string; role: string }): { success: boolean } => {
    const staff = readTable<Staff>('Staff');
    const index = staff.findIndex(s => s.staffId === staffId);
    if (index === -1) return { success: false };

    staff[index].status = 'inactive';
    writeTable<Staff>('Staff', staff);

    const users = readTable<UserAccount>('UserAccount');
    const uIndex = users.findIndex(u => u.entityId === staffId);
    if (uIndex !== -1) {
      users[uIndex].is_active = false;
      writeTable<UserAccount>('UserAccount', users);
    }

    logActivity(operator.userId, operator.username, operator.role, `Deactivated Staff Account (${staffId})`, 'Staff', staffId);
    return { success: true };
  },

  // Appointments
  getAppointments: (): Appointment[] => readTable<Appointment>('Appointment'),
  
  bookAppointment: (aptData: Omit<Appointment, 'appointmentId' | 'status'>, operator: { userId: string; username: string; role: string }): { success: boolean; appointment?: Appointment; error?: string } => {
    const appointments = readTable<Appointment>('Appointment');

    // IR-05: The system shall not allow the same doctor to be booked for two overlapping appointment slots
    const conflict = appointments.find(
      a => a.doctorId === aptData.doctorId &&
           a.date === aptData.date &&
           a.timeSlot === aptData.timeSlot &&
           a.status !== 'Cancelled'
    );

    if (conflict) {
      return { success: false, error: 'Doctor has an overlapping appointment at this slot. Select another time.' };
    }

    const appointmentId = `SC-APT-${appointments.length + 1}`;
    const newApt: Appointment = {
      ...aptData,
      appointmentId,
      status: 'Scheduled'
    };

    appointments.push(newApt);
    writeTable<Appointment>('Appointment', appointments);

    logActivity(operator.userId, operator.username, operator.role, `Booked Appointment (${appointmentId})`, 'Appointment', appointmentId);
    return { success: true, appointment: newApt };
  },

  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, reason = '', operator: { userId: string; username: string; role: string }): { success: boolean } => {
    const appointments = readTable<Appointment>('Appointment');
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    if (index === -1) return { success: false };

    appointments[index].status = status;
    if (status === 'Cancelled') {
      appointments[index].cancellationReason = reason;
    }
    writeTable<Appointment>('Appointment', appointments);

    logActivity(operator.userId, operator.username, operator.role, `Updated Appointment Status to ${status} (${appointmentId})`, 'Appointment', appointmentId);
    return { success: true };
  },

  // Clinical Consultations
  getConsultations: (): Consultation[] => readTable<Consultation>('Consultation'),
  
  startConsultation: (appointmentId: string, patientId: string, doctorId: string, operator: { userId: string; username: string; role: string }): Consultation => {
    const consultations = readTable<Consultation>('Consultation');
    
    // Check if one already exists for this appointment
    const existing = consultations.find(c => c.appointmentId === appointmentId);
    if (existing) return existing;

    const consultationId = `SC-CNS-${consultations.length + 1}`;
    const newConsultation: Consultation = {
      consultationId,
      appointmentId,
      patientId,
      doctorId,
      consultationDate: new Date().toISOString(),
      diagnosis: '',
      notes: '',
      status: 'draft',
      version: 1,
      history: []
    };

    consultations.push(newConsultation);
    writeTable<Consultation>('Consultation', consultations);

    logActivity(operator.userId, operator.username, operator.role, `Started Clinical Consultation (${consultationId})`, 'Consultation', consultationId);
    return newConsultation;
  },

  saveConsultation: (consultationId: string, diagnosis: string, notes: string, followUpDate?: string, operator: { userId: string; username: string; role: string }): { success: boolean; consultation?: Consultation; error?: string } => {
    const consultations = readTable<Consultation>('Consultation');
    const index = consultations.findIndex(c => c.consultationId === consultationId);

    if (index === -1) return { success: false, error: 'Consultation record not found.' };

    const record = consultations[index];

    // FR-06.3: Support immutability on finalized consultation, corrections saved in version log
    if (record.status === 'completed') {
      // Save current content to history log before writing update
      const historyItem = {
        diagnosis: record.diagnosis,
        notes: record.notes,
        followUpDate: record.followUpDate,
        updatedAt: new Date().toISOString()
      };
      
      record.history = record.history ? [...record.history, historyItem] : [historyItem];
      record.version += 1;
    }

    record.diagnosis = diagnosis;
    record.notes = notes;
    record.followUpDate = followUpDate || undefined;
    
    consultations[index] = record;
    writeTable<Consultation>('Consultation', consultations);

    logActivity(operator.userId, operator.username, operator.role, `Saved Consultation Data v${record.version} (${consultationId})`, 'Consultation', consultationId);
    return { success: true, consultation: record };
  },

  finalizeConsultation: (consultationId: string, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const consultations = readTable<Consultation>('Consultation');
    const index = consultations.findIndex(c => c.consultationId === consultationId);

    if (index === -1) return { success: false, error: 'Consultation not found.' };

    consultations[index].status = 'completed';
    writeTable<Consultation>('Consultation', consultations);

    // Update appointment status to completed
    const appointmentId = consultations[index].appointmentId;
    const appointments = readTable<Appointment>('Appointment');
    const aptIndex = appointments.findIndex(a => a.appointmentId === appointmentId);
    if (aptIndex !== -1) {
      appointments[aptIndex].status = 'Completed';
      writeTable<Appointment>('Appointment', appointments);
    }

    logActivity(operator.userId, operator.username, operator.role, `Finalized Patient Consultation (${consultationId})`, 'Consultation', consultationId);
    return { success: true };
  },

  // Prescriptions
  getPrescriptions: (): Prescription[] => readTable<Prescription>('Prescription'),
  
  createPrescription: (prescriptionData: Omit<Prescription, 'prescriptionId' | 'timestamp'>, operator: { userId: string; username: string; role: string }): { success: boolean; prescription?: Prescription; error?: string } => {
    if (operator.role !== 'doctor') {
      return { success: false, error: 'Unauthorized. Only Doctors can write prescriptions.' };
    }

    const prescriptions = readTable<Prescription>('Prescription');
    const prescriptionId = `SC-RX-${prescriptions.length + 1}`;

    const newRx: Prescription = {
      ...prescriptionData,
      prescriptionId,
      timestamp: new Date().toISOString()
    };

    prescriptions.push(newRx);
    writeTable<Prescription>('Prescription', prescriptions);

    logActivity(operator.userId, operator.username, operator.role, `Issued Medical Prescription (${prescriptionId})`, 'Prescription', prescriptionId);
    return { success: true, prescription: newRx };
  },

  // Inventory Management
  getInventory: (): InventoryItem[] => readTable<InventoryItem>('InventoryItem'),
  
  addOrUpdateStock: (itemData: Omit<InventoryItem, 'itemId'> & { itemId?: string }, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const inventory = readTable<InventoryItem>('InventoryItem');

    // IR-06: Prevent stock quantity from being reduced below zero
    if (itemData.quantityInStock < 0) {
      return { success: false, error: 'Stock levels cannot fall below zero.' };
    }

    if (itemData.itemId) {
      const index = inventory.findIndex(i => i.itemId === itemData.itemId);
      if (index === -1) return { success: false, error: 'Item not found.' };

      inventory[index] = { ...inventory[index], ...itemData } as InventoryItem;
      writeTable<InventoryItem>('InventoryItem', inventory);
      logActivity(operator.userId, operator.username, operator.role, `Updated Stock Item (${itemData.itemId})`, 'InventoryItem', itemData.itemId);
    } else {
      const itemId = `item-${inventory.length + 1}`;
      const newItem: InventoryItem = {
        ...itemData,
        itemId
      };
      inventory.push(newItem);
      writeTable<InventoryItem>('InventoryItem', inventory);
      logActivity(operator.userId, operator.username, operator.role, `Added New Inventory Stock Item (${itemId})`, 'InventoryItem', itemId);
    }

    return { success: true };
  },

  dispenseMedicines: (medicinesToDispense: { name: string; quantity: number }[], operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const inventory = readTable<InventoryItem>('InventoryItem');
    
    // Validate stock levels before transaction (atomic write safety simulation)
    for (const disp of medicinesToDispense) {
      const stock = inventory.find(i => i.name.toLowerCase() === disp.name.toLowerCase());
      if (!stock) {
        return { success: false, error: `Medicine '${disp.name}' not found in inventory.` };
      }
      if (stock.quantityInStock < disp.quantity) {
        return { success: false, error: `Insufficient stock for '${disp.name}'. Available: ${stock.quantityInStock}, Requested: ${disp.quantity}` };
      }
    }

    // Deduct stock
    for (const disp of medicinesToDispense) {
      const index = inventory.findIndex(i => i.name.toLowerCase() === disp.name.toLowerCase());
      inventory[index].quantityInStock -= disp.quantity;
    }

    writeTable<InventoryItem>('InventoryItem', inventory);
    logActivity(operator.userId, operator.username, operator.role, `Dispensed medicines against prescription`, 'InventoryItem', 'multiple');
    return { success: true };
  },

  // Billing and Payments
  getInvoices: (): Invoice[] => readTable<Invoice>('Invoice'),
  
  generateInvoice: (patientId: string, items: InvoiceItem[], operator: { userId: string; username: string; role: string }): Invoice => {
    const invoices = readTable<Invoice>('Invoice');
    const invoiceId = `SC-INV-${String(invoices.length + 1).padStart(5, '0')}`;
    
    const totalAmount = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    
    const newInvoice: Invoice = {
      invoiceId,
      patientId,
      items,
      totalAmount,
      amountPaid: 0,
      paymentMethod: '',
      status: 'Unpaid',
      issuedBy: operator.userId,
      timestamp: new Date().toISOString()
    };

    invoices.push(newInvoice);
    writeTable<Invoice>('Invoice', invoices);

    logActivity(operator.userId, operator.username, operator.role, `Generated Invoice (${invoiceId})`, 'Invoice', invoiceId);
    return newInvoice;
  },

  processPayment: (invoiceId: string, amount: number, method: Invoice['paymentMethod'], operator: { userId: string; username: string; role: string }): { success: boolean; invoice?: Invoice; error?: string } => {
    const invoices = readTable<Invoice>('Invoice');
    const index = invoices.findIndex(i => i.invoiceId === invoiceId);

    if (index === -1) return { success: false, error: 'Invoice not found.' };

    const invoice = invoices[index];
    const newAmountPaid = invoice.amountPaid + amount;

    if (newAmountPaid > invoice.totalAmount) {
      return { success: false, error: `Excessive payment amount. Balance outstanding: ${invoice.totalAmount - invoice.amountPaid}` };
    }

    invoice.amountPaid = newAmountPaid;
    invoice.paymentMethod = method;
    invoice.status = newAmountPaid === invoice.totalAmount ? 'Paid' : 'Partially Paid';
    
    invoices[index] = invoice;
    writeTable<Invoice>('Invoice', invoices);

    // If invoice is fully paid and contains medicine items, trigger automated stock deduction
    if (invoice.status === 'Paid') {
      const medicinesToDispense = invoice.items
        .filter(item => item.type === 'medicine' && item.itemId)
        .map(item => ({
          name: item.description.replace(' (Prescribed)', ''),
          quantity: item.quantity
        }));

      if (medicinesToDispense.length > 0) {
        db.dispenseMedicines(medicinesToDispense, operator);
      }
    }

    logActivity(operator.userId, operator.username, operator.role, `Processed Invoice Payment of ${amount} (${invoiceId})`, 'Invoice', invoiceId);
    return { success: true, invoice };
  },

  issueCreditNote: (invoiceId: string, reason: string, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const invoices = readTable<Invoice>('Invoice');
    const index = invoices.findIndex(i => i.invoiceId === invoiceId);

    if (index === -1) return { success: false, error: 'Invoice not found.' };

    const invoice = invoices[index];
    invoice.status = 'Unpaid';
    invoice.amountPaid = 0;
    invoice.creditNoteReason = reason;

    invoices[index] = invoice;
    writeTable<Invoice>('Invoice', invoices);

    logActivity(operator.userId, operator.username, operator.role, `Issued Credit Note for Invoice Correction (${invoiceId})`, 'Invoice', invoiceId);
    return { success: true };
  },

  // Audit Logs
  getAuditLogs: (operatorRole: string): AuditLog[] => {
    if (operatorRole !== 'admin') {
      return []; // Secure restricted access
    }
    return readTable<AuditLog>('AuditLog');
  },

  // Suppliers
  getSuppliers: (): Supplier[] => readTable<Supplier>('Supplier'),
  
  createSupplier: (supData: Omit<Supplier, 'supplierId' | 'purchaseOrderHistory'>, operator: { userId: string; username: string; role: string }): Supplier => {
    const suppliers = readTable<Supplier>('Supplier');
    const supplierId = `sup-${suppliers.length + 1}`;
    
    const newSup: Supplier = {
      ...supData,
      supplierId,
      purchaseOrderHistory: []
    };

    suppliers.push(newSup);
    writeTable<Supplier>('Supplier', suppliers);

    logActivity(operator.userId, operator.username, operator.role, `Added Supplier Partner (${supplierId})`, 'Supplier', supplierId);
    return newSup;
  }
};
