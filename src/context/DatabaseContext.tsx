import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDatabase, db } from '../services/db';
import { Patient, Doctor, Staff, Appointment, Consultation, Prescription, Invoice, InventoryItem, Supplier, AuditLog, SystemSettings } from '../types';

interface DatabaseContextType {
  patients: Patient[];
  doctors: Doctor[];
  staff: Staff[];
  appointments: Appointment[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings | null;
  refreshData: () => void;
  // Expose the database operations
  dbOps: typeof db;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  const loadData = () => {
    setPatients(db.getPatients());
    setDoctors(db.getDoctors());
    setStaff(db.getStaff());
    setAppointments(db.getAppointments());
    setConsultations(db.getConsultations());
    setPrescriptions(db.getPrescriptions());
    setInvoices(db.getInvoices());
    setInventory(db.getInventory());
    setSuppliers(db.getSuppliers());
    setSystemSettings(db.getSystemSettings());
    // Use role admin by default for loader, component-level checks will restrict log views
    setAuditLogs(db.getAuditLogs('admin'));
  };

  useEffect(() => {
    initializeDatabase();
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  // Wrapped operations that automatically refresh state
  const wrappedDbOps = {
    ...db,
    registerPatient: (...args: Parameters<typeof db.registerPatient>) => {
      const res = db.registerPatient(...args);
      if (res.success) refreshData();
      return res;
    },
    updatePatient: (...args: Parameters<typeof db.updatePatient>) => {
      const res = db.updatePatient(...args);
      if (res.success) refreshData();
      return res;
    },
    deactivatePatient: (...args: Parameters<typeof db.deactivatePatient>) => {
      const res = db.deactivatePatient(...args);
      if (res.success) refreshData();
      return res;
    },
    createDoctor: (...args: Parameters<typeof db.createDoctor>) => {
      const res = db.createDoctor(...args);
      if (res.success) refreshData();
      return res;
    },
    updateDoctorSchedule: (...args: Parameters<typeof db.updateDoctorSchedule>) => {
      const res = db.updateDoctorSchedule(...args);
      if (res.success) refreshData();
      return res;
    },
    deactivateDoctor: (...args: Parameters<typeof db.deactivateDoctor>) => {
      const res = db.deactivateDoctor(...args);
      if (res.success) refreshData();
      return res;
    },
    createStaff: (...args: Parameters<typeof db.createStaff>) => {
      const res = db.createStaff(...args);
      if (res.success) refreshData();
      return res;
    },
    deactivateStaff: (...args: Parameters<typeof db.deactivateStaff>) => {
      const res = db.deactivateStaff(...args);
      if (res.success) refreshData();
      return res;
    },
    bookAppointment: (...args: Parameters<typeof db.bookAppointment>) => {
      const res = db.bookAppointment(...args);
      if (res.success) refreshData();
      return res;
    },
    updateAppointmentStatus: (...args: Parameters<typeof db.updateAppointmentStatus>) => {
      const res = db.updateAppointmentStatus(...args);
      refreshData();
      return res;
    },
    startConsultation: (...args: Parameters<typeof db.startConsultation>) => {
      const res = db.startConsultation(...args);
      refreshData();
      return res;
    },
    saveConsultation: (...args: Parameters<typeof db.saveConsultation>) => {
      const res = db.saveConsultation(...args);
      if (res.success) refreshData();
      return res;
    },
    finalizeConsultation: (...args: Parameters<typeof db.finalizeConsultation>) => {
      const res = db.finalizeConsultation(...args);
      if (res.success) refreshData();
      return res;
    },
    createPrescription: (...args: Parameters<typeof db.createPrescription>) => {
      const res = db.createPrescription(...args);
      if (res.success) refreshData();
      return res;
    },
    addOrUpdateStock: (...args: Parameters<typeof db.addOrUpdateStock>) => {
      const res = db.addOrUpdateStock(...args);
      if (res.success) refreshData();
      return res;
    },
    dispenseMedicines: (...args: Parameters<typeof db.dispenseMedicines>) => {
      const res = db.dispenseMedicines(...args);
      if (res.success) refreshData();
      return res;
    },
    generateInvoice: (...args: Parameters<typeof db.generateInvoice>) => {
      const res = db.generateInvoice(...args);
      refreshData();
      return res;
    },
    processPayment: (...args: Parameters<typeof db.processPayment>) => {
      const res = db.processPayment(...args);
      if (res.success) refreshData();
      return res;
    },
    issueCreditNote: (...args: Parameters<typeof db.issueCreditNote>) => {
      const res = db.issueCreditNote(...args);
      if (res.success) refreshData();
      return res;
    },
    createSupplier: (...args: Parameters<typeof db.createSupplier>) => {
      const res = db.createSupplier(...args);
      refreshData();
      return res;
    },
    updateSystemSettings: (...args: Parameters<typeof db.updateSystemSettings>) => {
      const res = db.updateSystemSettings(...args);
      if (res.success) refreshData();
      return res;
    }
  };

  return (
    <DatabaseContext.Provider value={{
      patients,
      doctors,
      staff,
      appointments,
      consultations,
      prescriptions,
      invoices,
      inventory,
      suppliers,
      auditLogs,
      systemSettings,
      refreshData,
      dbOps: wrappedDbOps
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
