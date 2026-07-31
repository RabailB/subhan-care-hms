import { 
  Patient, Doctor, Staff, Appointment, Consultation, Prescription, Invoice, InventoryItem, Supplier, AuditLog, UserAccount, UserRole, SystemSettings
} from '../types';
import { db as firestoreDb } from './firebase';
import { 
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc, runTransaction 
} from 'firebase/firestore';

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
  { id: 1, userId: 'usr-admin', username: 'admin', email: 'admin@subhancare.pk', passwordHash: 'admin123', role: 'Admin', entityType: 'Staff', entityId: 'admin', is_active: true, failedAttempts: 0 },
  { id: 2, userId: 'usr-doctor-1', username: 'doctor', email: 'doctor@subhancare.pk', passwordHash: 'doctor123', role: 'Doctor', entityType: 'Doctor', entityId: 'doc-1', is_active: true, failedAttempts: 0 },
  { id: 3, userId: 'usr-receptionist-1', username: 'receptionist', email: 'receptionist@subhancare.pk', passwordHash: 'recept123', role: 'Receptionist', entityType: 'Staff', entityId: 'staff-1', is_active: true, failedAttempts: 0 },
  { id: 4, userId: 'usr-pharmacist-1', username: 'pharmacist', email: 'pharmacist@subhancare.pk', passwordHash: 'pharma123', role: 'Pharmacist', entityType: 'Staff', entityId: 'staff-2', is_active: true, failedAttempts: 0 },
  { id: 5, userId: 'usr-billing-1', username: 'billing', email: 'billing@subhancare.pk', passwordHash: 'billing123', role: 'Billing Staff', entityType: 'Staff', entityId: 'staff-3', is_active: true, failedAttempts: 0 }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Panadol 500mg', batch_number: 'B-PNDL-101', unit: 'Tablet', unit_cost: 2.5, quantity_in_stock: 250, reorder_threshold: 50, expiry_date: '2027-12-31', supplierId: 'sup-1', supplierName: 'Subhan Pharma Distributors', is_active: true },
  { id: 2, name: 'Amoxil 250mg Suspension', batch_number: 'B-AMX-204', unit: 'Other', unit_cost: 150.0, quantity_in_stock: 80, reorder_threshold: 20, expiry_date: '2026-11-30', supplierId: 'sup-1', supplierName: 'Subhan Pharma Distributors', is_active: true },
  { id: 3, name: 'Surbex-Z Tablets', batch_number: 'B-SRBX-902', unit: 'Tablet', unit_cost: 12.0, quantity_in_stock: 12, reorder_threshold: 15, expiry_date: '2026-08-15', supplierId: 'sup-2', supplierName: 'Ali Allied Supplies', is_active: true }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { supplierId: 'sup-1', name: 'Subhan Pharma Distributors', contactInfo: '021-3456789', supplierAddress: 'Office 402, Shahrah-e-Faisal, Karachi', supplierPhone: '0300-1234567', supplierEmail: 'info@subhanpharma.com', ntnNumber: '1234567-8', purchaseOrderHistory: [] },
  { supplierId: 'sup-2', name: 'Ali Allied Supplies', contactInfo: '042-9988776', supplierAddress: 'Gaddafi Stadium Market, Lahore', supplierPhone: '0321-9876543', supplierEmail: 'contact@aliallied.com', ntnNumber: '9876543-2', purchaseOrderHistory: [] }
];

const INITIAL_PATIENTS: Patient[] = [
  { id: 1, patientId: 'SC-PAT-00001', patient_code: 'SC-PAT-00001', full_name: 'Muhammad Ali', date_of_birth: '1985-05-12', gender: 'Male', cnic: '42101-1234567-1', contact_number: '+92 300 7654321', address: 'Flat 12-B, Gulshan-e-Iqbal, Karachi', emergency_contact_name: 'Imran Ali', emergency_contact_phone: '+92 321 1122334', emergency_contact_relation: 'Brother', blood_group: 'B+', status: 'Active', is_active: true, registrationDate: '2026-06-01T10:00:00Z', allergies: [{ allergen_name: 'Penicillin', allergy_type: 'Medication', severity: 'Severe' }] },
  { id: 2, patientId: 'SC-PAT-00002', patient_code: 'SC-PAT-00002', full_name: 'Fatima Zahra', date_of_birth: '1992-09-24', gender: 'Female', cnic: '42201-9876543-2', contact_number: '+92 333 9988776', address: 'House 41, Defence Phase 5, Karachi', emergency_contact_name: 'Zahid Hussain', emergency_contact_phone: '+92 300 9988776', emergency_contact_relation: 'Husband', blood_group: 'O+', status: 'Active', is_active: true, registrationDate: '2026-06-15T11:30:00Z' }
];

const INITIAL_SETTINGS: SystemSettings = {
  hospital_name: 'Subhan Care Hospital',
  hospital_address: '123 Main Street, Healthcare District',
  hospital_phone: '+92 300 1234567',
  default_tax_rate: 5,
  default_consultation_fee: 1000
};

// Database Engine initialization
export const initializeDatabase = async (force = false): Promise<void> => {
  try {
    const settingsDoc = await getDoc(doc(firestoreDb, 'SystemSettings', 'settings'));
    if (!settingsDoc.exists() || force) {
      console.log('Seeding initial data to Firestore...');
      
      const seedData = async (collectionName: string, data: any[], idKey: string) => {
        for (const item of data) {
          const id = String(item[idKey] || item.id);
          await setDoc(doc(firestoreDb, collectionName, id), item);
        }
      };
      
      await seedData('UserAccount', INITIAL_USERS, 'userId');
      await seedData('Doctor', INITIAL_DOCTORS, 'doctorId');
      await seedData('Staff', INITIAL_STAFF, 'staffId');
      await seedData('Patient', INITIAL_PATIENTS, 'patientId');
      await seedData('InventoryItem', INITIAL_INVENTORY, 'id');
      await seedData('Supplier', INITIAL_SUPPLIERS, 'supplierId');
      await setDoc(doc(firestoreDb, 'SystemSettings', 'settings'), INITIAL_SETTINGS);
      
      await setDoc(doc(firestoreDb, 'AuditLog', 'log-init'), {
        logId: 'log-init', userId: 'usr-admin', username: 'admin', role: 'Admin', action: 'System Initialized and Seed Data Inserted', affectedTable: 'System', affectedRecordId: 'all', timestamp: new Date().toISOString()
      });
      console.log('Seeding complete.');
    }
  } catch (err) {
    console.error('Error initializing database', err);
  }
};

// Logger Helper
export const logActivity = async (userId: string, username: string, role: string, action: string, affectedTable: string, affectedRecordId: string): Promise<void> => {
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newLog: AuditLog = {
    logId, userId, username, role, action, affectedTable, affectedRecordId, timestamp: new Date().toISOString()
  };
  await setDoc(doc(firestoreDb, 'AuditLog', logId), newLog);
};
// Database APIs
export const db = {
  // Authentication
  login: async (username: string, passwordPlain: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    const q = query(collection(firestoreDb, 'UserAccount'), where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { success: false, error: 'User does not exist.' };
    
    let userDoc = snapshot.docs[0];
    let user = userDoc.data() as UserAccount;

    if (user.status === 'inactive') return { success: false, error: 'Account is deactivated. Contact Admin.' };
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockoutUntil).getTime() - new Date().getTime()) / 60000);
      return { success: false, error: `Account locked. Try again in ${remainingMin} minutes.` };
    }

    if (user.passwordHash === passwordPlain) {
      user.failedAttempts = 0;
      user.lockoutUntil = undefined;
      user.lastLogin = new Date().toISOString();
      await updateDoc(userDoc.ref, { failedAttempts: 0, lockoutUntil: null, lastLogin: user.lastLogin });
      await logActivity(user.userId, user.username, user.role, 'User Login Successful', 'UserAccount', user.userId);
      return { success: true, user };
    } else {
      user.failedAttempts += 1;
      let errorMsg = 'Invalid password.';
      const MAX_FAILED_ATTEMPTS = 5;
      const LOCKOUT_MINUTES = 15;
      
      let updates: any = { failedAttempts: user.failedAttempts };
      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + LOCKOUT_MINUTES);
        updates.lockoutUntil = lockoutTime.toISOString();
        errorMsg = `Too many failed login attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`;
        await logActivity('system', 'system', 'system', `Account Locked: ${username}`, 'UserAccount', user.userId);
      } else {
        errorMsg += ` Attempt ${user.failedAttempts} of ${MAX_FAILED_ATTEMPTS}.`;
      }

      await updateDoc(userDoc.ref, updates);
      await logActivity(user.userId, user.username, user.role, `Failed Login Attempt (${user.failedAttempts}/${MAX_FAILED_ATTEMPTS})`, 'UserAccount', user.userId);
      return { success: false, error: errorMsg };
    }
  },

  resetPassword: async (username: string, contactNum: string, newPasswordPlain: string): Promise<{ success: boolean; error?: string }> => {
    const q = query(collection(firestoreDb, 'UserAccount'), where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { success: false, error: 'User does not exist.' };
    
    let userDoc = snapshot.docs[0];
    let user = userDoc.data() as UserAccount;
    
    let contactValid = false;
    const cleanNum = (num: string) => num.replace(/[^0-9]/g, '');
    const cleanContactInput = cleanNum(contactNum);

    if (user.role === 'Admin') {
      contactValid = true;
    } else if (user.role === 'Doctor') {
      const docSnap = await getDoc(doc(firestoreDb, 'Doctor', user.entityId));
      if (docSnap.exists()) {
        const docData = docSnap.data() as Doctor;
        if (cleanNum(docData.contactInfo).includes(cleanContactInput) || cleanContactInput.includes(cleanNum(docData.contactInfo))) contactValid = true;
      }
    } else {
      const staffSnap = await getDoc(doc(firestoreDb, 'Staff', user.entityId));
      if (staffSnap.exists()) {
        const st = staffSnap.data() as Staff;
        if (cleanNum(st.contactInfo).includes(cleanContactInput) || cleanContactInput.includes(cleanNum(st.contactInfo))) contactValid = true;
      }
    }

    if (!contactValid) return { success: false, error: 'Contact number verification failed.' };

    await updateDoc(userDoc.ref, { passwordHash: newPasswordPlain, failedAttempts: 0, lockoutUntil: null });
    await logActivity(user.userId, user.username, user.role, 'Password Reset Successful via Verification', 'UserAccount', user.userId);
    return { success: true };
  },

  // Patients
  getPatients: async (): Promise<Patient[]> => {
    const snapshot = await getDocs(query(collection(firestoreDb, 'Patient'), where('is_active', '==', true)));
    return snapshot.docs.map(d => d.data() as Patient);
  },
  
  registerPatient: async (patientData: Omit<Patient, 'id' | 'patientId' | 'patient_code' | 'registrationDate' | 'status' | 'is_active'>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; patient?: Patient; error?: string }> => {
    const cnicQ = query(collection(firestoreDb, 'Patient'), where('cnic', '==', patientData.cnic), where('is_active', '==', true));
    const dupSnap = await getDocs(cnicQ);
    if (!dupSnap.empty) {
      return { success: false, error: `Patient with CNIC ${patientData.cnic} is already registered.` };
    }

    const allPats = await getDocs(collection(firestoreDb, 'Patient'));
    const count = allPats.size + 1;
    const patientId = `SC-PAT-${String(count).padStart(5, '0')}`;
    
    const newPatient: Patient = {
      id: count, patientId, patient_code: patientId, full_name: patientData.full_name, date_of_birth: patientData.date_of_birth,
      gender: patientData.gender, cnic: patientData.cnic, contact_number: patientData.contact_number, address: patientData.address,
      blood_group: patientData.blood_group || 'Unknown', emergency_contact_name: patientData.emergency_contact_name,
      emergency_contact_phone: patientData.emergency_contact_phone, emergency_contact_relation: patientData.emergency_contact_relation,
      registrationDate: new Date().toISOString(), status: 'Active', is_active: true
    };

    await setDoc(doc(firestoreDb, 'Patient', patientId), newPatient);
    await logActivity(operator.userId, operator.username, operator.role, `Registered New Patient (${patientId})`, 'Patient', patientId);
    return { success: true, patient: newPatient };
  },

  updatePatient: async (patientId: string, updatedData: Partial<Patient>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; error?: string }> => {
    const pRef = doc(firestoreDb, 'Patient', patientId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists() || !pSnap.data().is_active) return { success: false, error: 'Patient not found.' };

    if (updatedData.cnic && updatedData.cnic !== pSnap.data().cnic) {
      const dupSnap = await getDocs(query(collection(firestoreDb, 'Patient'), where('cnic', '==', updatedData.cnic), where('is_active', '==', true)));
      if (!dupSnap.empty) return { success: false, error: `CNIC ${updatedData.cnic} is already registered to another patient.` };
    }

    await updateDoc(pRef, updatedData);
    await logActivity(operator.userId, operator.username, operator.role, `Updated Patient Details (${patientId})`, 'Patient', patientId);
    return { success: true };
  },

  deactivatePatient: async (patientId: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    const pRef = doc(firestoreDb, 'Patient', patientId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists()) return { success: false };

    await updateDoc(pRef, { is_active: false, status: 'Inactive' });
    await logActivity(operator.userId, operator.username, operator.role, `Soft Deleted/Deactivated Patient (${patientId})`, 'Patient', patientId);
    return { success: true };
  },

  addPatientAllergy: async (patientId: string, allergyData: { allergen_name: string; allergy_type: 'Medication' | 'Food' | 'Environmental'; severity: 'Mild' | 'Moderate' | 'Severe' }, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; error?: string }> => {
    const pRef = doc(firestoreDb, 'Patient', patientId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists() || !pSnap.data().is_active) return { success: false, error: 'Patient not found.' };

    const patient = pSnap.data() as Patient;
    const allergies = patient.allergies || [];
    if (allergies.find(a => a.allergen_name.toLowerCase() === allergyData.allergen_name.toLowerCase())) {
      return { success: false, error: `Allergen '${allergyData.allergen_name}' is already recorded.` };
    }

    allergies.push(allergyData);
    await updateDoc(pRef, { allergies });
    await logActivity(operator.userId, operator.username, operator.role, `Added Patient Allergy (${allergyData.allergen_name}) to ${patientId}`, 'Patient', patientId);
    return { success: true };
  },

  deletePatientAllergy: async (patientId: string, allergenName: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; error?: string }> => {
    const pRef = doc(firestoreDb, 'Patient', patientId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists() || !pSnap.data().is_active) return { success: false, error: 'Patient not found.' };

    const patient = pSnap.data() as Patient;
    if (!patient.allergies) return { success: false, error: 'Allergy not found.' };

    const filtered = patient.allergies.filter(a => a.allergen_name.toLowerCase() !== allergenName.toLowerCase());
    if (filtered.length === patient.allergies.length) return { success: false, error: 'Allergy not found.' };

    await updateDoc(pRef, { allergies: filtered });
    await logActivity(operator.userId, operator.username, operator.role, `Deleted Patient Allergy (${allergenName}) from ${patientId}`, 'Patient', patientId);
    return { success: true };
  },
  // Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    const snapshot = await getDocs(query(collection(firestoreDb, 'Doctor'), where('status', '==', 'active')));
    return snapshot.docs.map(d => d.data() as Doctor);
  },

  createDoctor: async (docData: Omit<Doctor, 'doctorId' | 'status'>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; doctorId?: string }> => {
    if (operator.role !== 'Admin') return { success: false };
    
    const allDocs = await getDocs(collection(firestoreDb, 'Doctor'));
    const docId = `doc-${allDocs.size + 1}`;
    const newDoc: Doctor = { ...docData, doctorId: docId, status: 'active' };
    await setDoc(doc(firestoreDb, 'Doctor', docId), newDoc);

    const allUsers = await getDocs(collection(firestoreDb, 'UserAccount'));
    const uId = allUsers.size + 1;
    const usrName = `doctor${uId}`;
    const newUser: UserAccount = {
      id: uId, userId: `usr-${docId}`, username: usrName, email: `${usrName}@subhancare.pk`, passwordHash: 'doctor123',
      role: 'Doctor', entityType: 'Doctor', entityId: docId, is_active: true, failedAttempts: 0
    };
    await setDoc(doc(firestoreDb, 'UserAccount', newUser.userId), newUser);
    await logActivity(operator.userId, operator.username, operator.role, `Created Doctor (${docId})`, 'Doctor', docId);
    return { success: true, doctorId: docId };
  },

  updateDoctorSchedule: async (doctorId: string, schedule: Doctor['schedule'], operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    if (operator.role !== 'Admin' && operator.role !== 'Doctor') return { success: false };
    const docRef = doc(firestoreDb, 'Doctor', doctorId);
    await updateDoc(docRef, { schedule });
    await logActivity(operator.userId, operator.username, operator.role, `Updated Schedule for Doctor (${doctorId})`, 'Doctor', doctorId);
    return { success: true };
  },

  deactivateDoctor: async (doctorId: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    if (operator.role !== 'Admin') return { success: false };
    const docRef = doc(firestoreDb, 'Doctor', doctorId);
    await updateDoc(docRef, { status: 'inactive' });
    
    const users = await getDocs(query(collection(firestoreDb, 'UserAccount'), where('entityId', '==', doctorId)));
    for (const u of users.docs) {
      await updateDoc(u.ref, { is_active: false, status: 'inactive' });
    }
    
    await logActivity(operator.userId, operator.username, operator.role, `Deactivated Doctor (${doctorId})`, 'Doctor', doctorId);
    return { success: true };
  },

  // Staff
  getStaff: async (): Promise<Staff[]> => {
    const snapshot = await getDocs(query(collection(firestoreDb, 'Staff'), where('status', '==', 'active')));
    return snapshot.docs.map(d => d.data() as Staff);
  },

  createStaff: async (staffData: Omit<Staff, 'staffId' | 'status'>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; staffId?: string }> => {
    if (operator.role !== 'Admin') return { success: false };
    const all = await getDocs(collection(firestoreDb, 'Staff'));
    const staffId = `staff-${all.size + 1}`;
    const newStaff: Staff = { ...staffData, staffId, status: 'active' };
    await setDoc(doc(firestoreDb, 'Staff', staffId), newStaff);

    const allUsers = await getDocs(collection(firestoreDb, 'UserAccount'));
    const uId = allUsers.size + 1;
    const usrName = `${staffData.role}${uId}`;
    let roleStr: UserRole = 'Receptionist';
    if (staffData.role === 'pharmacist') roleStr = 'Pharmacist';
    else if (staffData.role === 'billing') roleStr = 'Billing Staff';

    const newUser: UserAccount = {
      id: uId, userId: `usr-${staffId}`, username: usrName, email: `${usrName}@subhancare.pk`, passwordHash: 'staff123',
      role: roleStr, entityType: 'Staff', entityId: staffId, is_active: true, failedAttempts: 0
    };
    await setDoc(doc(firestoreDb, 'UserAccount', newUser.userId), newUser);
    await logActivity(operator.userId, operator.username, operator.role, `Created Staff (${staffId})`, 'Staff', staffId);
    return { success: true, staffId };
  },

  deactivateStaff: async (staffId: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    if (operator.role !== 'Admin') return { success: false };
    await updateDoc(doc(firestoreDb, 'Staff', staffId), { status: 'inactive' });
    const users = await getDocs(query(collection(firestoreDb, 'UserAccount'), where('entityId', '==', staffId)));
    for (const u of users.docs) await updateDoc(u.ref, { is_active: false, status: 'inactive' });
    await logActivity(operator.userId, operator.username, operator.role, `Deactivated Staff (${staffId})`, 'Staff', staffId);
    return { success: true };
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const snap = await getDocs(collection(firestoreDb, 'Appointment'));
    return snap.docs.map(d => d.data() as Appointment);
  },

  bookAppointment: async (patientId: string, doctorId: string, date: string, timeSlot: string, bookedBy: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; appointment?: Appointment; error?: string }> => {
    const pSnap = await getDoc(doc(firestoreDb, 'Patient', patientId));
    if (!pSnap.exists() || !pSnap.data().is_active) return { success: false, error: 'Patient not active or does not exist.' };

    const existSnap = await getDocs(query(collection(firestoreDb, 'Appointment'), where('doctorId', '==', doctorId), where('date', '==', date), where('timeSlot', '==', timeSlot), where('status', 'in', ['scheduled', 'in-progress'])));
    if (!existSnap.empty) return { success: false, error: 'This time slot is already booked.' };

    const all = await getDocs(collection(firestoreDb, 'Appointment'));
    const aptId = `APT-${String(all.size + 1).padStart(5, '0')}`;
    const newApt: Appointment = {
      appointmentId: aptId, patientId, doctorId, date, timeSlot, status: 'scheduled', bookedBy, createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestoreDb, 'Appointment', aptId), newApt);
    await logActivity(operator.userId, operator.username, operator.role, `Booked Appointment (${aptId})`, 'Appointment', aptId);
    return { success: true, appointment: newApt };
  },

  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status'], operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    await updateDoc(doc(firestoreDb, 'Appointment', appointmentId), { status });
    await logActivity(operator.userId, operator.username, operator.role, `Updated Appointment Status to ${status} (${appointmentId})`, 'Appointment', appointmentId);
    return { success: true };
  },

  // Consultations
  getConsultations: async (): Promise<Consultation[]> => {
    const snap = await getDocs(collection(firestoreDb, 'Consultation'));
    return snap.docs.map(d => d.data() as Consultation);
  },

  startConsultation: async (appointmentId: string, patientId: string, doctorId: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; consultation?: Consultation }> => {
    const all = await getDocs(collection(firestoreDb, 'Consultation'));
    const conId = `CONS-${String(all.size + 1).padStart(5, '0')}`;
    const newCon: Consultation = {
      consultationId: conId, appointmentId, patientId, doctorId,
      symptoms: '', diagnosis: '', notes: '', status: 'in-progress', createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestoreDb, 'Consultation', conId), newCon);
    await updateDoc(doc(firestoreDb, 'Appointment', appointmentId), { status: 'in-progress' });
    await logActivity(operator.userId, operator.username, operator.role, `Started Consultation (${conId})`, 'Consultation', conId);
    return { success: true, consultation: newCon };
  },

  saveConsultation: async (consultationId: string, data: Partial<Consultation>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    await updateDoc(doc(firestoreDb, 'Consultation', consultationId), data);
    await logActivity(operator.userId, operator.username, operator.role, `Saved Consultation Draft (${consultationId})`, 'Consultation', consultationId);
    return { success: true };
  },

  finalizeConsultation: async (consultationId: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    const cSnap = await getDoc(doc(firestoreDb, 'Consultation', consultationId));
    if (!cSnap.exists()) return { success: false };
    await updateDoc(cSnap.ref, { status: 'completed' });
    await updateDoc(doc(firestoreDb, 'Appointment', cSnap.data().appointmentId), { status: 'completed' });
    await logActivity(operator.userId, operator.username, operator.role, `Finalized Consultation (${consultationId})`, 'Consultation', consultationId);
    return { success: true };
  },
  // Prescriptions
  getPrescriptions: async (): Promise<Prescription[]> => {
    const snap = await getDocs(collection(firestoreDb, 'Prescription'));
    return snap.docs.map(d => d.data() as Prescription);
  },

  createPrescription: async (data: Omit<Prescription, 'prescriptionId' | 'status' | 'createdAt'>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; prescription?: Prescription }> => {
    const all = await getDocs(collection(firestoreDb, 'Prescription'));
    const rxId = `RX-${String(all.size + 1).padStart(5, '0')}`;
    const newRx: Prescription = { ...data, prescriptionId: rxId, status: 'pending', createdAt: new Date().toISOString() };
    await setDoc(doc(firestoreDb, 'Prescription', rxId), newRx);
    await logActivity(operator.userId, operator.username, operator.role, `Created Prescription (${rxId})`, 'Prescription', rxId);
    return { success: true, prescription: newRx };
  },

  markPrescriptionDispensed: async (prescriptionId: string, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    await updateDoc(doc(firestoreDb, 'Prescription', prescriptionId), { status: 'dispensed' });
    await logActivity(operator.userId, operator.username, operator.role, `Dispensed Prescription (${prescriptionId})`, 'Prescription', prescriptionId);
    return { success: true };
  },

  // Inventory
  getInventory: async (): Promise<InventoryItem[]> => {
    const snap = await getDocs(query(collection(firestoreDb, 'InventoryItem'), where('is_active', '==', true)));
    return snap.docs.map(d => d.data() as InventoryItem);
  },

  addOrUpdateStock: async (item: Omit<InventoryItem, 'id'>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    if (operator.role !== 'Admin' && operator.role !== 'Pharmacist') return { success: false };
    const all = await getDocs(collection(firestoreDb, 'InventoryItem'));
    
    const existSnap = await getDocs(query(collection(firestoreDb, 'InventoryItem'), where('batch_number', '==', item.batch_number)));
    if (!existSnap.empty) {
      const exist = existSnap.docs[0].data() as InventoryItem;
      const updated = { ...exist, quantity_in_stock: exist.quantity_in_stock + item.quantity_in_stock };
      await updateDoc(existSnap.docs[0].ref, updated);
      await logActivity(operator.userId, operator.username, operator.role, `Updated Stock for ${item.name} (+${item.quantity_in_stock})`, 'Inventory', String(exist.id));
    } else {
      const newId = all.size + 1;
      const newItem: InventoryItem = { ...item, id: newId, is_active: true };
      await setDoc(doc(firestoreDb, 'InventoryItem', String(newId)), newItem);
      await logActivity(operator.userId, operator.username, operator.role, `Added New Stock ${item.name}`, 'Inventory', String(newId));
    }
    return { success: true };
  },

  dispenseMedicines: async (itemsToDeduct: { inventoryId: number; quantityToDeduct: number }[], operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; error?: string }> => {
    if (operator.role !== 'Admin' && operator.role !== 'Pharmacist') return { success: false, error: 'Unauthorized' };
    
    try {
      await runTransaction(firestoreDb, async (transaction) => {
        const itemDocs = [];
        for (const deduct of itemsToDeduct) {
          const itemRef = doc(firestoreDb, 'InventoryItem', String(deduct.inventoryId));
          const itemSnap = await transaction.get(itemRef);
          if (!itemSnap.exists()) throw new Error(`Item ${deduct.inventoryId} not found`);
          const currentData = itemSnap.data() as InventoryItem;
          if (currentData.quantity_in_stock < deduct.quantityToDeduct) {
            throw new Error(`Insufficient stock for ${currentData.name}`);
          }
          itemDocs.push({ ref: itemRef, updatedQuantity: currentData.quantity_in_stock - deduct.quantityToDeduct });
        }
        
        for (const update of itemDocs) {
          transaction.update(update.ref, { quantity_in_stock: update.updatedQuantity });
        }
      });
      
      await logActivity(operator.userId, operator.username, operator.role, `Dispensed ${itemsToDeduct.length} items from Inventory`, 'Inventory', 'multiple');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const snap = await getDocs(collection(firestoreDb, 'Invoice'));
    return snap.docs.map(d => d.data() as Invoice);
  },

  generateInvoice: async (data: Omit<Invoice, 'invoice_number' | 'timestamp' | 'status' | 'amount_paid' | 'balance_due'>, operator: { userId: string; username: string; role: string }): Promise<Invoice> => {
    const all = await getDocs(collection(firestoreDb, 'Invoice'));
    const invNum = `INV-${String(all.size + 1).padStart(5, '0')}`;
    const newInv: Invoice = {
      ...data, invoice_number: invNum, timestamp: new Date().toISOString(), status: 'Unpaid', amount_paid: 0, balance_due: data.grand_total
    };
    await setDoc(doc(firestoreDb, 'Invoice', invNum), newInv);
    await logActivity(operator.userId, operator.username, operator.role, `Generated Invoice (${invNum})`, 'Invoice', invNum);
    return newInv;
  },

  processPayment: async (invoiceNumber: string, amount: number, paymentMethod: Invoice['payment_method'], operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; error?: string }> => {
    if (operator.role !== 'Admin' && operator.role !== 'Billing Staff') return { success: false, error: 'Unauthorized' };
    
    const iRef = doc(firestoreDb, 'Invoice', invoiceNumber);
    const iSnap = await getDoc(iRef);
    if (!iSnap.exists()) return { success: false, error: 'Invoice not found' };
    
    const inv = iSnap.data() as Invoice;
    const newPaid = inv.amount_paid + amount;
    const newBalance = inv.grand_total - newPaid;
    let newStatus = inv.status;
    if (newBalance <= 0 && inv.status !== 'Refunded') newStatus = 'Paid';
    else if (newPaid > 0 && inv.status !== 'Refunded') newStatus = 'Partial';

    await updateDoc(iRef, { amount_paid: newPaid, balance_due: newBalance, status: newStatus, payment_method: paymentMethod });
    await logActivity(operator.userId, operator.username, operator.role, `Processed Payment ${amount} for Invoice (${invoiceNumber})`, 'Invoice', invoiceNumber);
    return { success: true };
  },

  issueCreditNote: async (invoiceNumber: string, amountToRefund: number, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; error?: string }> => {
    if (operator.role !== 'Admin') return { success: false, error: 'Unauthorized' };
    
    const iRef = doc(firestoreDb, 'Invoice', invoiceNumber);
    const iSnap = await getDoc(iRef);
    if (!iSnap.exists()) return { success: false, error: 'Invoice not found' };
    
    const inv = iSnap.data() as Invoice;
    if (inv.status === 'Unpaid' || inv.amount_paid < amountToRefund) return { success: false, error: 'Invalid refund amount' };

    const newPaid = inv.amount_paid - amountToRefund;
    const newBalance = inv.grand_total - newPaid;
    let newStatus = inv.status;
    if (newPaid === 0) newStatus = 'Refunded';
    else if (newBalance > 0) newStatus = 'Partial';

    await updateDoc(iRef, { amount_paid: newPaid, balance_due: newBalance, status: newStatus });
    await logActivity(operator.userId, operator.username, operator.role, `Issued Credit Note ${amountToRefund} for Invoice (${invoiceNumber})`, 'Invoice', invoiceNumber);
    return { success: true };
  },

  // Audit Logs
  getAuditLogs: async (role: string): Promise<AuditLog[]> => {
    if (role !== 'Admin') return [];
    const snap = await getDocs(collection(firestoreDb, 'AuditLog'));
    return snap.docs.map(d => d.data() as AuditLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const snap = await getDocs(collection(firestoreDb, 'Supplier'));
    return snap.docs.map(d => d.data() as Supplier);
  },

  createSupplier: async (data: Omit<Supplier, 'supplierId'>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean; supplierId?: string }> => {
    if (operator.role !== 'Admin') return { success: false };
    const all = await getDocs(collection(firestoreDb, 'Supplier'));
    const sId = `sup-${all.size + 1}`;
    const newSup = { ...data, supplierId: sId };
    await setDoc(doc(firestoreDb, 'Supplier', sId), newSup);
    await logActivity(operator.userId, operator.username, operator.role, `Created Supplier (${sId})`, 'Supplier', sId);
    return { success: true, supplierId: sId };
  },

  // Settings
  getSystemSettings: async (): Promise<SystemSettings | null> => {
    const snap = await getDoc(doc(firestoreDb, 'SystemSettings', 'settings'));
    return snap.exists() ? (snap.data() as SystemSettings) : null;
  },

  updateSystemSettings: async (settings: Partial<SystemSettings>, operator: { userId: string; username: string; role: string }): Promise<{ success: boolean }> => {
    if (operator.role !== 'Admin') return { success: false };
    await updateDoc(doc(firestoreDb, 'SystemSettings', 'settings'), settings);
    await logActivity(operator.userId, operator.username, operator.role, 'Updated System Settings', 'SystemSettings', 'settings');
    return { success: true };
  }
};
