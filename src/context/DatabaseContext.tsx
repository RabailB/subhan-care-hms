import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDatabase, db } from '../services/db';
import { db as firestoreDb } from '../services/firebase';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
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

  useEffect(() => {
    // Ensure DB is initialized (seeds initial data if empty)
    initializeDatabase().then(() => {
      // Set up real-time listeners
      const unsubPatients = onSnapshot(query(collection(firestoreDb, 'Patient'), where('is_active', '==', true)), (snap) => {
        setPatients(snap.docs.map(d => d.data() as Patient));
      });
      const unsubDoctors = onSnapshot(query(collection(firestoreDb, 'Doctor'), where('status', '==', 'active')), (snap) => {
        setDoctors(snap.docs.map(d => d.data() as Doctor));
      });
      const unsubStaff = onSnapshot(query(collection(firestoreDb, 'Staff'), where('status', '==', 'active')), (snap) => {
        setStaff(snap.docs.map(d => d.data() as Staff));
      });
      const unsubAppointments = onSnapshot(collection(firestoreDb, 'Appointment'), (snap) => {
        setAppointments(snap.docs.map(d => d.data() as Appointment));
      });
      const unsubConsultations = onSnapshot(collection(firestoreDb, 'Consultation'), (snap) => {
        setConsultations(snap.docs.map(d => d.data() as Consultation));
      });
      const unsubPrescriptions = onSnapshot(collection(firestoreDb, 'Prescription'), (snap) => {
        setPrescriptions(snap.docs.map(d => d.data() as Prescription));
      });
      const unsubInvoices = onSnapshot(collection(firestoreDb, 'Invoice'), (snap) => {
        setInvoices(snap.docs.map(d => d.data() as Invoice));
      });
      const unsubInventory = onSnapshot(query(collection(firestoreDb, 'InventoryItem'), where('is_active', '==', true)), (snap) => {
        setInventory(snap.docs.map(d => d.data() as InventoryItem));
      });
      const unsubSuppliers = onSnapshot(collection(firestoreDb, 'Supplier'), (snap) => {
        setSuppliers(snap.docs.map(d => d.data() as Supplier));
      });
      const unsubAuditLogs = onSnapshot(collection(firestoreDb, 'AuditLog'), (snap) => {
        setAuditLogs(snap.docs.map(d => d.data() as AuditLog).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      });
      const unsubSettings = onSnapshot(doc(firestoreDb, 'SystemSettings', 'settings'), (docSnap) => {
        if (docSnap.exists()) setSystemSettings(docSnap.data() as SystemSettings);
      });

      return () => {
        unsubPatients(); unsubDoctors(); unsubStaff(); unsubAppointments(); unsubConsultations();
        unsubPrescriptions(); unsubInvoices(); unsubInventory(); unsubSuppliers(); unsubAuditLogs(); unsubSettings();
      };
    });
  }, []);

  const refreshData = () => {
    // With onSnapshot, manual refresh is largely unnecessary, but kept for interface compatibility
  };

  return (
    <DatabaseContext.Provider value={{
      patients, doctors, staff, appointments, consultations, prescriptions, invoices,
      inventory, suppliers, auditLogs, systemSettings, refreshData, dbOps: db
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within a DatabaseProvider');
  return context;
};
