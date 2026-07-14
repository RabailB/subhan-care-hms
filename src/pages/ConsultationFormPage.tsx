import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Patient, Consultation, Appointment, InventoryItem, PrescriptionMedicine } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { AlertTriangle, User, FileText, CheckCircle, Plus, Pill } from 'lucide-react';

export const ConsultationFormPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Form Fields
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Prescription Builder
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');

  // Modals
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    if (!appointmentId || !user) return;

    const apts = db.getAppointments();
    const apt = apts.find(a => a.appointmentId === appointmentId);
    if (!apt) {
      alert("Appointment not found");
      navigate('/schedules');
      return;
    }
    setAppointment(apt);

    const pats = db.getPatients();
    const pat = pats.find(p => p.patientId === apt.patientId);
    if (pat) setPatient(pat);

    const cons = db.startConsultation(apt.appointmentId, apt.patientId, apt.doctorId, {
      userId: user.userId, username: user.username, role: user.role
    });
    setConsultation(cons);

    if (cons) {
      setBloodPressure(cons.blood_pressure || '');
      setTemperature(cons.temperature ? String(cons.temperature) : '');
      setWeight(cons.weight_kg ? String(cons.weight_kg) : '');
      setChiefComplaint(cons.chief_complaint || '');
      setDiagnosis(cons.diagnosis_description || '');
      setClinicalNotes(cons.clinical_notes || '');
      setIsFinalized(cons.is_finalized);
    }

    setInventory(db.getInventory());

    // Trigger Allergy Warning
    if (pat?.allergies && pat.allergies.length > 0 && !cons.is_finalized) {
      setAllergyModalOpen(true);
    }
  }, [appointmentId, user, navigate]);

  const handleAddMedicine = () => {
    if (!selectedMedicine || !dosage || !frequency || !duration) {
      alert("Please fill all medicine fields.");
      return;
    }

    const item = inventory.find(i => i.id.toString() === selectedMedicine);
    if (!item) return;

    const newMed: PrescriptionMedicine = {
      medicineId: item.id.toString(),
      name: item.name,
      dosage,
      frequency,
      duration
    };

    setMedicines([...medicines, newMed]);
    setSelectedMedicine('');
    setDosage('');
    setFrequency('');
    setDuration('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleSave = async (finalize: boolean = false) => {
    if (!consultation || !user) return;

    if (finalize && !diagnosis) {
      alert("Diagnosis is required to finalize consultation.");
      return;
    }

    const res = db.saveConsultation(consultation.consultationId, {
      chief_complaint: chiefComplaint,
      diagnosis_description: diagnosis,
      clinical_notes: clinicalNotes,
      blood_pressure: bloodPressure,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight_kg: weight ? parseFloat(weight) : undefined,
      is_finalized: finalize
    }, {
      userId: user.userId, username: user.username, role: user.role
    });

    if (res.success) {
      if (finalize && medicines.length > 0) {
        // Generate Prescription
        db.createPrescription({
          consultationId: consultation.consultationId,
          patientId: consultation.patientId,
          doctorId: consultation.doctorId,
          medicines: medicines
        }, {
          userId: user.userId, username: user.username, role: user.role
        });
      }

      if (finalize) {
        setIsFinalized(true);
        alert("Consultation Finalized and Prescription Generated successfully!");
        navigate('/schedules');
      } else {
        alert("Draft saved successfully.");
      }
    } else {
      alert(res.error);
    }
  };

  if (!patient || !consultation) return <p>Loading...</p>;

  const hasSevereAllergies = patient.allergies?.some(a => a.severity === 'Severe');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Info */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="#64748b" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {patient.full_name}
              {patient.allergies && patient.allergies.length > 0 && (
                <span className="hms-badge badge-danger" style={{ fontSize: '0.7rem' }}>Allergies Found</span>
              )}
            </h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              ID: {patient.patientId} | Age: {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} | Gender: {patient.gender}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`hms-badge ${isFinalized ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
            {isFinalized ? 'Completed' : 'In Progress'}
          </span>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Consultation: {consultation.consultationId}</p>
        </div>
      </div>

      {/* Vitals Section */}
      <Card title="Vitals & Assessment">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <label className="form-label">Blood Pressure</label>
            <input 
              className="input-field" 
              placeholder="e.g., 120/80" 
              value={bloodPressure}
              onChange={e => setBloodPressure(e.target.value)}
              disabled={isFinalized}
            />
          </div>
          <div>
            <label className="form-label">Temperature (°F)</label>
            <input 
              type="number"
              className="input-field" 
              placeholder="e.g., 98.6" 
              value={temperature}
              onChange={e => setTemperature(e.target.value)}
              disabled={isFinalized}
            />
          </div>
          <div>
            <label className="form-label">Weight (kg)</label>
            <input 
              type="number"
              className="input-field" 
              placeholder="e.g., 70" 
              value={weight}
              onChange={e => setWeight(e.target.value)}
              disabled={isFinalized}
            />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="form-label">Chief Complaint *</label>
          <input 
            className="input-field" 
            placeholder="Main reason for visit..." 
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            disabled={isFinalized}
          />
        </div>
      </Card>

      {/* Clinical Notes & Diagnosis */}
      <Card title="Clinical Notes & Diagnosis">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label className="form-label">Clinical Notes</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Detailed observations..."
              value={clinicalNotes}
              onChange={e => setClinicalNotes(e.target.value)}
              disabled={isFinalized}
            />
          </div>
          <div>
            <label className="form-label">Diagnosis *</label>
            <input 
              className="input-field" 
              placeholder="Primary diagnosis..." 
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              disabled={isFinalized}
            />
          </div>
        </div>
      </Card>

      {/* Prescription Builder */}
      {!isFinalized && (
        <Card title="Prescription Builder" subtitle="Add medicines from pharmacy inventory">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Medicine</label>
              <select className="input-field" value={selectedMedicine} onChange={e => setSelectedMedicine(e.target.value)}>
                <option value="">Select Medicine</option>
                {inventory.filter(i => i.is_active).map(item => (
                  <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity_in_stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Dosage</label>
              <input className="input-field" placeholder="e.g. 1-0-1" value={dosage} onChange={e => setDosage(e.target.value)} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Frequency</label>
              <select className="input-field" value={frequency} onChange={e => setFrequency(e.target.value)}>
                <option value="">Select</option>
                <option value="After Meal">After Meal</option>
                <option value="Before Meal">Before Meal</option>
                <option value="Empty Stomach">Empty Stomach</option>
                <option value="As Needed (SOS)">As Needed (SOS)</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Duration</label>
              <input className="input-field" placeholder="e.g. 5 Days" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
          <Button variant="secondary" onClick={handleAddMedicine} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Plus size={16} /> Add Medicine to Prescription
          </Button>

          {medicines.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#475569' }}>Current Prescription List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                      <td>
                        <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => handleRemoveMedicine(idx)}>&times;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Action Bar */}
      {!isFinalized && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button variant="outline" onClick={() => handleSave(false)}>
            Save Draft
          </Button>
          <Button variant="success" onClick={() => handleSave(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Finalize Consultation & Generate Rx
          </Button>
        </div>
      )}

      {/* Allergy Modal */}
      <Modal
        isOpen={allergyModalOpen}
        onClose={() => setAllergyModalOpen(false)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasSevereAllergies ? '#ef4444' : '#f59e0b' }}>
            <AlertTriangle size={20} /> Patient Allergy Warning
          </span>
        }
        primaryActionLabel="Acknowledge & Continue"
        onPrimaryAction={() => setAllergyModalOpen(false)}
        primaryActionVariant="primary"
      >
        <p style={{ color: '#334155', marginBottom: '16px' }}>
          Please review the following allergies before prescribing any medication:
        </p>
        <ul style={{ paddingLeft: '20px', margin: 0, color: '#0f172a' }}>
          {patient.allergies?.map((a, idx) => (
            <li key={idx} style={{ marginBottom: '8px', fontWeight: a.severity === 'Severe' ? 600 : 400 }}>
              {a.allergen_name} ({a.allergy_type}) - 
              <span style={{ color: a.severity === 'Severe' ? '#ef4444' : a.severity === 'Moderate' ? '#f59e0b' : '#3b82f6', marginLeft: '4px' }}>
                {a.severity}
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};
export default ConsultationFormPage;
