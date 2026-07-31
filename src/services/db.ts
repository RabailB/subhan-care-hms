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
  UserRole,
  SystemSettings
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
    passwordHash: 'admin123',
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
    id: 1,
    name: 'Panadol 500mg',
    batch_number: 'B-PNDL-101',
    unit: 'Tablet',
    unit_cost: 2.5,
    quantity_in_stock: 250,
    reorder_threshold: 50,
    expiry_date: '2027-12-31',
    supplierId: 'sup-1',
    supplierName: 'Subhan Pharma Distributors',
    is_active: true
  },
  {
    id: 2,
    name: 'Amoxil 250mg Suspension',
    batch_number: 'B-AMX-204',
    unit: 'Other',
    unit_cost: 150.0,
    quantity_in_stock: 80,
    reorder_threshold: 20,
    expiry_date: '2026-11-30',
    supplierId: 'sup-1',
    supplierName: 'Subhan Pharma Distributors',
    is_active: true
  },
  {
    id: 3,
    name: 'Surbex-Z Tablets',
    batch_number: 'B-SRBX-902',
    unit: 'Tablet',
    unit_cost: 12.0,
    quantity_in_stock: 12,
    reorder_threshold: 15,
    expiry_date: '2026-08-15', // Near expiry
    supplierId: 'sup-2',
    supplierName: 'Ali Allied Supplies',
    is_active: true
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
    id: 1,
    patientId: 'SC-PAT-00001',
    patient_code: 'SC-PAT-00001',
    full_name: 'Muhammad Ali',
    date_of_birth: '1985-05-12',
    gender: 'Male',
    cnic: '42101-1234567-1',
    contact_number: '+92 300 7654321',
    address: 'Flat 12-B, Gulshan-e-Iqbal, Karachi',
    emergency_contact_name: 'Imran Ali',
    emergency_contact_phone: '+92 321 1122334',
    emergency_contact_relation: 'Brother',
    blood_group: 'B+',
    status: 'Active',
    is_active: true,
    registrationDate: '2026-06-01T10:00:00Z',
    allergies: [
      {
        allergen_name: 'Penicillin',
        allergy_type: 'Medication',
        severity: 'Severe'
      }
    ]
  },
  {
    id: 2,
    patientId: 'SC-PAT-00002',
    patient_code: 'SC-PAT-00002',
    full_name: 'Fatima Zahra',
    date_of_birth: '1992-09-24',
    gender: 'Female',
    cnic: '42201-9876543-2',
    contact_number: '+92 333 9988776',
    address: 'House 41, Defence Phase 5, Karachi',
    emergency_contact_name: 'Zahid Hussain',
    emergency_contact_phone: '+92 300 9988776',
    emergency_contact_relation: 'Husband',
    blood_group: 'O+',
    status: 'Active',
    is_active: true,
    registrationDate: '2026-06-15T11:30:00Z'
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
    writeTable<SystemSettings>('SystemSettings', [{
      hospital_name: 'Subhan Care Hospital',
      hospital_address: '123 Main Street, Healthcare District',
      hospital_phone: '+92 300 1234567',
      default_tax_rate: 5,
      default_consultation_fee: 1000
    }]);
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
    const cleanNum = (num: string) => num.replace(/[^0-9]/g, '');
    const cleanContactInput = cleanNum(contactNum);

    if (user.role === 'Admin') {
      contactValid = true; // Special mock exception for administrative reset
    } else if (user.role === 'Doctor') {
      const doctors = readTable<Doctor>('Doctor');
      const doc = doctors.find(d => d.doctorId === user.entityId);
      if (doc && (cleanNum(doc.contactInfo).includes(cleanContactInput) || cleanContactInput.includes(cleanNum(doc.contactInfo)))) contactValid = true;
    } else {
      const staff = readTable<Staff>('Staff');
      const st = staff.find(s => s.staffId === user.entityId);
      if (st && (cleanNum(st.contactInfo).includes(cleanContactInput) || cleanContactInput.includes(cleanNum(st.contactInfo)))) contactValid = true;
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
  getPatients: (): Patient[] => readTable<Patient>('Patient').filter(p => p.is_active),
  
  registerPatient: (patientData: Omit<Patient, 'id' | 'patientId' | 'patient_code' | 'registrationDate' | 'status' | 'is_active'>, operator: { userId: string; username: string; role: string }): { success: boolean; patient?: Patient; error?: string } => {
    const patients = readTable<Patient>('Patient');

    // FR-01.6 Prevent duplicate patient registration by validating CNIC
    const duplicate = patients.find(p => p.cnic === patientData.cnic && p.is_active);
    if (duplicate) {
      return { success: false, error: `Patient with CNIC ${patientData.cnic} is already registered (Patient ID: ${duplicate.patient_code}).` };
    }

    const count = patients.length + 1;
    const patientId = `SC-PAT-${String(count).padStart(5, '0')}`;
    
    const newPatient: Patient = {
      id: count,
      patientId,
      patient_code: patientId,
      full_name: patientData.full_name,
      date_of_birth: patientData.date_of_birth,
      gender: patientData.gender,
      cnic: patientData.cnic,
      contact_number: patientData.contact_number,
      address: patientData.address,
      blood_group: patientData.blood_group || 'Unknown',
      emergency_contact_name: patientData.emergency_contact_name,
      emergency_contact_phone: patientData.emergency_contact_phone,
      emergency_contact_relation: patientData.emergency_contact_relation,
      registrationDate: new Date().toISOString(),
      status: 'Active',
      is_active: true
    };

    patients.push(newPatient);
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Registered New Patient (${patientId})`, 'Patient', patientId);
    return { success: true, patient: newPatient };
  },

  updatePatient: (patientId: string, updatedData: Partial<Patient>, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const patients = readTable<Patient>('Patient');
    const index = patients.findIndex(p => p.patientId === patientId && p.is_active);

    if (index === -1) return { success: false, error: 'Patient not found.' };

    // Prevent cnic duplicates on update
    if (updatedData.cnic && updatedData.cnic !== patients[index].cnic) {
      const duplicate = patients.find(p => p.cnic === updatedData.cnic && p.patientId !== patientId && p.is_active);
      if (duplicate) {
        return { success: false, error: `CNIC ${updatedData.cnic} is already registered to another patient.` };
      }
    }

    patients[index] = { ...patients[index], ...updatedData };
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Updated Patient Details (${patientId})`, 'Patient', patientId);
    return { success: true };
  },

  deactivatePatient: (patientId: string, operator: { userId: string; username: string; role: string }): { success: boolean } => {
    const patients = readTable<Patient>('Patient');
    const index = patients.findIndex(p => p.patientId === patientId);

    if (index === -1) return { success: false };

    patients[index].is_active = false;
    patients[index].status = 'Inactive';
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Soft Deleted/Deactivated Patient (${patientId})`, 'Patient', patientId);
    return { success: true };
  },

  addPatientAllergy: (patientId: string, allergyData: { allergen_name: string; allergy_type: 'Medication' | 'Food' | 'Environmental'; severity: 'Mild' | 'Moderate' | 'Severe' }, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const patients = readTable<Patient>('Patient');
    const index = patients.findIndex(p => p.patientId === patientId && p.is_active);
    if (index === -1) return { success: false, error: 'Patient not found.' };

    const patient = patients[index];
    if (!patient.allergies) patient.allergies = [];

    // Check if allergen already exists
    const duplicate = patient.allergies.find(a => a.allergen_name.toLowerCase() === allergyData.allergen_name.toLowerCase());
    if (duplicate) {
      return { success: false, error: `Allergen '${allergyData.allergen_name}' is already recorded.` };
    }

    patient.allergies.push(allergyData);
    patients[index] = patient;
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Added Patient Allergy (${allergyData.allergen_name}) to ${patientId}`, 'Patient', patientId);
    return { success: true };
  },

  deletePatientAllergy: (patientId: string, allergenName: string, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const patients = readTable<Patient>('Patient');
    const index = patients.findIndex(p => p.patientId === patientId && p.is_active);
    if (index === -1) return { success: false, error: 'Patient not found.' };

    const patient = patients[index];
    if (!patient.allergies) return { success: false, error: 'Allergy not found.' };

    const initialLength = patient.allergies.length;
    patient.allergies = patient.allergies.filter(a => a.allergen_name.toLowerCase() !== allergenName.toLowerCase());

    if (patient.allergies.length === initialLength) {
      return { success: false, error: 'Allergy not found.' };
    }

    patients[index] = patient;
    writeTable<Patient>('Patient', patients);

    logActivity(operator.userId, operator.username, operator.role, `Deleted Patient Allergy (${allergenName}) from ${patientId}`, 'Patient', patientId);
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
  
  bookAppointment: (aptData: Omit<Appointment, 'id' | 'appointmentId' | 'status' | 'created_at'>, operator: { userId: string; username: string; role: string }): { success: boolean; appointment?: Appointment; error?: string } => {
    const appointments = readTable<Appointment>('Appointment');

    // IR-05: The system shall not allow the same doctor to be booked for two overlapping appointment slots
    const conflict = appointments.find(
      a => a.doctorId === aptData.doctorId &&
           a.appointment_date === aptData.appointment_date &&
           a.slot_start_time === aptData.slot_start_time &&
           a.status === 'Scheduled'
    );

    if (conflict) {
      return { success: false, error: 'Doctor has an overlapping appointment at this slot. Select another time.' };
    }

    const count = appointments.length + 1;
    const appointmentId = `SC-APT-${String(count).padStart(5, '0')}`;
    
    // Auto-calculate slot_end_time (add 30 minutes)
    const [hours, minutes] = aptData.slot_start_time.split(':').map(Number);
    let endMin = minutes + 30;
    let endHr = hours;
    if (endMin >= 60) {
      endMin -= 60;
      endHr += 1;
    }
    const slot_end_time = `${String(endHr).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const newApt: Appointment = {
      id: count,
      appointmentId,
      patientId: aptData.patientId,
      doctorId: aptData.doctorId,
      appointment_date: aptData.appointment_date,
      slot_start_time: aptData.slot_start_time,
      slot_end_time,
      status: 'Scheduled',
      booked_by: operator.userId,
      created_at: new Date().toISOString()
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
      appointments[index].cancellation_reason = reason as any;
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

    const count = consultations.length + 1;
    const consultationId = `SC-CNS-${String(count).padStart(5, '0')}`;
    const newConsultation: Consultation = {
      id: count,
      consultationId,
      appointmentId,
      patientId,
      doctorId,
      chief_complaint: '',
      diagnosis_description: '',
      clinical_notes: '',
      status: 'In Progress',
      is_finalized: false,
      version: 1,
      history: []
    };

    consultations.push(newConsultation);
    writeTable<Consultation>('Consultation', consultations);

    logActivity(operator.userId, operator.username, operator.role, `Started Clinical Consultation (${consultationId})`, 'Consultation', consultationId);
    return newConsultation;
  },

  saveConsultation: (
    consultationId: string, 
    data: { 
      chief_complaint?: string; 
      diagnosis_description?: string; 
      clinical_notes?: string; 
      blood_pressure?: string;
      temperature?: number;
      weight_kg?: number;
      is_finalized?: boolean;
    }, 
    operator: { userId: string; username: string; role: string }
  ): { success: boolean; consultation?: Consultation; error?: string } => {
    const consultations = readTable<Consultation>('Consultation');
    const index = consultations.findIndex(c => c.consultationId === consultationId);

    if (index === -1) return { success: false, error: 'Consultation record not found.' };

    const record = consultations[index];

    // FR-06.3: Support immutability on finalized consultation, corrections saved in version log
    if (record.is_finalized) {
      // Save current content to history log before writing update
      const historyItem = {
        diagnosis_description: record.diagnosis_description,
        clinical_notes: record.clinical_notes,
        updatedAt: new Date().toISOString()
      };
      
      record.history = record.history ? [...record.history, historyItem] : [historyItem];
      record.version += 1;
    }

    if (data.chief_complaint !== undefined) record.chief_complaint = data.chief_complaint;
    if (data.diagnosis_description !== undefined) record.diagnosis_description = data.diagnosis_description;
    if (data.clinical_notes !== undefined) record.clinical_notes = data.clinical_notes;
    if (data.blood_pressure !== undefined) record.blood_pressure = data.blood_pressure;
    if (data.temperature !== undefined) record.temperature = data.temperature;
    if (data.weight_kg !== undefined) record.weight_kg = data.weight_kg;

    if (data.is_finalized) {
      record.is_finalized = true;
      record.status = 'Completed';
      record.finalized_at = new Date().toISOString();
      
      // Auto-update appointment status to Completed
      const appointments = readTable<Appointment>('Appointment');
      const aptIndex = appointments.findIndex(a => a.appointmentId === record.appointmentId);
      if (aptIndex !== -1 && appointments[aptIndex].status !== 'Completed') {
        appointments[aptIndex].status = 'Completed';
        writeTable<Appointment>('Appointment', appointments);
      }
    }

    writeTable<Consultation>('Consultation', consultations);

    logActivity(operator.userId, operator.username, operator.role, `Saved Consultation Notes (${consultationId})`, 'Consultation', consultationId);
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
    if (operator.role !== 'Doctor') {
      return { success: false, error: 'Unauthorized. Only Doctors can write prescriptions.' };
    }

    const prescriptions = readTable<Prescription>('Prescription');
    const prescriptionId = `SC-RX-${prescriptions.length + 1}`;

    const newRx: Prescription = {
      ...prescriptionData,
      prescriptionId,
      is_dispensed: false,
      timestamp: new Date().toISOString()
    };

    prescriptions.push(newRx);
    writeTable<Prescription>('Prescription', prescriptions);

    logActivity(operator.userId, operator.username, operator.role, `Issued Medical Prescription (${prescriptionId})`, 'Prescription', prescriptionId);
    return { success: true, prescription: newRx };
  },

  markPrescriptionDispensed: (prescriptionId: string, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const prescriptions = readTable<Prescription>('Prescription');
    const index = prescriptions.findIndex(p => p.prescriptionId === prescriptionId);

    if (index === -1) return { success: false, error: 'Prescription not found.' };
    
    if (prescriptions[index].is_dispensed) {
      return { success: false, error: 'Prescription already dispensed.' };
    }

    prescriptions[index].is_dispensed = true;
    writeTable<Prescription>('Prescription', prescriptions);

    logActivity(operator.userId, operator.username, operator.role, `Dispensed Prescription (${prescriptionId})`, 'Prescription', prescriptionId);
    return { success: true };
  },

  // Inventory Management
  getInventory: (): InventoryItem[] => readTable<InventoryItem>('InventoryItem'),
  
  addOrUpdateStock: (itemData: Omit<InventoryItem, 'id'> & { id?: number }, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const inventory = readTable<InventoryItem>('InventoryItem');

    // IR-06: Prevent stock quantity from being reduced below zero
    if (itemData.quantity_in_stock < 0) {
      return { success: false, error: 'Stock levels cannot fall below zero.' };
    }

    if (itemData.id) {
      const index = inventory.findIndex(i => i.id === itemData.id);
      if (index === -1) return { success: false, error: 'Item not found.' };

      inventory[index] = { ...inventory[index], ...itemData } as InventoryItem;
      writeTable<InventoryItem>('InventoryItem', inventory);
      logActivity(operator.userId, operator.username, operator.role, `Updated Stock Item (${itemData.id})`, 'InventoryItem', String(itemData.id));
    } else {
      const id = inventory.length + 1;
      const newItem: InventoryItem = {
        ...itemData,
        id
      };
      inventory.push(newItem);
      writeTable<InventoryItem>('InventoryItem', inventory);
      logActivity(operator.userId, operator.username, operator.role, `Added New Inventory Stock Item (${id})`, 'InventoryItem', String(id));
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
      if (stock.quantity_in_stock < disp.quantity) {
        return { success: false, error: `Insufficient stock for '${disp.name}'. Available: ${stock.quantity_in_stock}, Requested: ${disp.quantity}` };
      }
    }

    // Deduct stock
    for (const disp of medicinesToDispense) {
      const index = inventory.findIndex(i => i.name.toLowerCase() === disp.name.toLowerCase());
      inventory[index].quantity_in_stock -= disp.quantity;
    }

    writeTable<InventoryItem>('InventoryItem', inventory);
    logActivity(operator.userId, operator.username, operator.role, `Dispensed medicines against prescription`, 'InventoryItem', 'multiple');
    return { success: true };
  },

  // Billing and Payments
  getInvoices: (): Invoice[] => readTable<Invoice>('Invoice'),
  
  generateInvoice: (patientId: string, items: InvoiceItem[], charges: { consultation_fee: number; medicine_charges: number; additional_charges: number }, operator: { userId: string; username: string; role: string }): Invoice => {
    const invoices = readTable<Invoice>('Invoice');
    const invoice_number = `SC-INV-${String(invoices.length + 1).padStart(5, '0')}`;
    
    const itemsTotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const total_amount = charges.consultation_fee + charges.medicine_charges + charges.additional_charges + itemsTotal;
    
    const newInvoice: Invoice = {
      id: invoices.length + 1,
      invoice_number,
      patientId,
      items,
      consultation_fee: charges.consultation_fee,
      medicine_charges: charges.medicine_charges,
      additional_charges: charges.additional_charges,
      total_amount,
      amount_paid: 0,
      outstanding_balance: total_amount,
      payment_method: '',
      payment_status: 'Unpaid',
      is_finalized: false,
      issued_by: operator.userId,
      timestamp: new Date().toISOString()
    };

    invoices.push(newInvoice);
    writeTable<Invoice>('Invoice', invoices);

    logActivity(operator.userId, operator.username, operator.role, `Generated Invoice (${invoice_number})`, 'Invoice', invoice_number);
    return newInvoice;
  },

  processPayment: (invoice_number: string, amount: number, method: Invoice['payment_method'], operator: { userId: string; username: string; role: string }): { success: boolean; invoice?: Invoice; error?: string } => {
    const invoices = readTable<Invoice>('Invoice');
    const index = invoices.findIndex(i => i.invoice_number === invoice_number);

    if (index === -1) return { success: false, error: 'Invoice not found.' };

    const invoice = invoices[index];
    const newAmountPaid = invoice.amount_paid + amount;

    if (newAmountPaid > invoice.total_amount) {
      return { success: false, error: `Excessive payment amount. Balance outstanding: ${invoice.total_amount - invoice.amount_paid}` };
    }

    invoice.amount_paid = newAmountPaid;
    invoice.outstanding_balance = invoice.total_amount - newAmountPaid;
    invoice.payment_method = method;
    invoice.payment_status = newAmountPaid === invoice.total_amount ? 'Paid' : (newAmountPaid > 0 ? 'Partially Paid' : 'Unpaid');
    
    invoices[index] = invoice;
    writeTable<Invoice>('Invoice', invoices);

    // If invoice is fully paid and contains medicine items, trigger automated stock deduction
    if (invoice.payment_status === 'Paid') {
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

    logActivity(operator.userId, operator.username, operator.role, `Processed Invoice Payment of ${amount} (${invoice_number})`, 'Invoice', invoice_number);
    return { success: true, invoice };
  },

  issueCreditNote: (invoice_number: string, reason: string, operator: { userId: string; username: string; role: string }): { success: boolean; error?: string } => {
    const invoices = readTable<Invoice>('Invoice');
    const index = invoices.findIndex(i => i.invoice_number === invoice_number);

    if (index === -1) return { success: false, error: 'Invoice not found.' };

    const invoice = invoices[index];
    invoice.payment_status = 'Unpaid';
    invoice.amount_paid = 0;
    invoice.outstanding_balance = invoice.total_amount;
    invoice.creditNoteReason = reason;

    invoices[index] = invoice;
    writeTable<Invoice>('Invoice', invoices);

    logActivity(operator.userId, operator.username, operator.role, `Issued Credit Note for Invoice Correction (${invoice_number})`, 'Invoice', invoice_number);
    return { success: true };
  },

  // Audit Logs
  getAuditLogs: (operatorRole: string): AuditLog[] => {
    if (operatorRole !== 'Admin') {
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
  },

  // System Settings
  getSystemSettings: (): SystemSettings => {
    const settings = readTable<SystemSettings>('SystemSettings');
    return settings[0] || {
      hospital_name: 'Subhan Care Hospital',
      hospital_address: '123 Main Street, Healthcare District',
      hospital_phone: '+92 300 1234567',
      default_tax_rate: 5,
      default_consultation_fee: 1000
    };
  },
  
  updateSystemSettings: (newSettings: SystemSettings, operator: { userId: string; username: string; role: string }): { success: boolean } => {
    writeTable<SystemSettings>('SystemSettings', [newSettings]);
    logActivity(operator.userId, operator.username, operator.role, 'Updated System Global Settings', 'SystemSettings', 'settings');
    return { success: true };
  }
};
