import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Search, Pill } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Prescription, Patient, Doctor } from '../types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export const PrescriptionQueuePage: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [dispenseQuantities, setDispenseQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPrescriptions(db.getPrescriptions());
    setPatients(db.getPatients());
    setDoctors(db.getDoctors());
  };

  const handleDispense = () => {
    if (!selectedRx) return;

    const itemsToDeduct = selectedRx.medicines.map((m, idx) => ({
      name: m.name,
      quantity: dispenseQuantities[idx] || 1
    }));
    
    // Deduct stock first
    const dispRes = db.dispenseMedicines(itemsToDeduct, {
      userId: user!.userId,
      username: user!.username,
      role: user!.role
    });

    if (!dispRes.success) {
      alert(dispRes.error);
      return;
    }

    const res = db.markPrescriptionDispensed(selectedRx.prescriptionId, {
      userId: user!.userId,
      username: user!.username,
      role: user!.role
    });

    if (res.success) {
      setDispenseModalOpen(false);
      setSelectedRx(null);
      loadData();
    } else {
      alert(res.error);
    }
  };

  const getPatientName = (id: string) => patients.find(p => p.patientId === id)?.full_name || id;
  const getDoctorName = (id: string) => doctors.find(d => d.doctorId === id)?.name || id;

  const filteredRx = prescriptions.filter(rx => 
    rx.prescriptionId.toLowerCase().includes(search.toLowerCase()) || 
    getPatientName(rx.patientId).toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <FileText size={20} className="text-warning" />
            Prescriptions Queue
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Review and dispense patient medications</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Rx ID or Patient Name..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredRx.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No prescriptions found.
          </div>
        ) : (
          filteredRx.map(rx => (
            <div key={rx.id} style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '16px',
              backgroundColor: rx.is_dispensed ? '#f8fafc' : '#ffffff',
              opacity: rx.is_dispensed ? 0.8 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{rx.prescriptionId}</span>
                {rx.is_dispensed ? (
                  <span className="hms-badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> Dispensed
                  </span>
                ) : (
                  <span className="hms-badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>
              
              <div style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#475569' }}>Patient:</strong> {getPatientName(rx.patientId)}</p>
                <p style={{ margin: 0 }}><strong style={{ color: '#475569' }}>Doctor:</strong> {getDoctorName(rx.doctorId)}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(rx.timestamp).toLocaleString()}</p>
              </div>

              <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Pill size={14} /> Medicines
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#334155' }}>
                  {rx.medicines.map((m, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      <strong>{m.name}</strong> - {m.dosage} ({m.duration})<br/>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.frequency}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!rx.is_dispensed && (
                <Button 
                  variant="primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '6px' }}
                  onClick={() => { 
                    setSelectedRx(rx); 
                    const initialQty: Record<number, number> = {};
                    rx.medicines.forEach((_, idx) => initialQty[idx] = 1);
                    setDispenseQuantities(initialQty);
                    setDispenseModalOpen(true); 
                  }}
                >
                  <CheckCircle size={16} /> Mark as Dispensed
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={dispenseModalOpen}
        onClose={() => { setDispenseModalOpen(false); setSelectedRx(null); }}
        title="Dispense Prescription"
        primaryActionLabel="Confirm Dispense"
        primaryActionVariant="success"
        onPrimaryAction={handleDispense}
      >
        <p>Are you sure you want to mark <strong>{selectedRx?.prescriptionId}</strong> as dispensed?</p>
        
        {selectedRx && selectedRx.medicines.length > 0 && (
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Inventory Deduction Quantities:</p>
            {selectedRx.medicines.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>{m.name}</strong><br/>
                  <span style={{ color: '#64748b' }}>{m.dosage} ({m.duration})</span>
                </div>
                <div style={{ width: '80px' }}>
                  <input 
                    type="number" 
                    min="1"
                    className="input-field" 
                    value={dispenseQuantities[idx] || 1}
                    onChange={(e) => setDispenseQuantities({...dispenseQuantities, [idx]: Number(e.target.value)})}
                    style={{ padding: '4px 8px', height: '32px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          This will deduct the selected quantities from inventory and mark the prescription as complete.
        </p>
      </Modal>
    </div>
  );
};

export default PrescriptionQueuePage;
