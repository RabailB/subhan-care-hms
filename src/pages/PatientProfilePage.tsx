import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  ClipboardList, 
  Calendar, 
  Receipt, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { PatientAllergy } from '../types';

type TabId = 'history' | 'appointments' | 'invoices';

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { patients, consultations, appointments, invoices, dbOps, refreshData } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Find patient
  const patient = useMemo(() => {
    return patients.find(p => p.patientId === id && p.is_active);
  }, [patients, id]);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabId>('history');

  // Allergy Modal States
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [allergenName, setAllergenName] = useState('');
  const [allergyType, setAllergyType] = useState<'Medication' | 'Food' | 'Environmental'>('Medication');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  
  const [allergyError, setAllergyError] = useState('');
  const [allergyLoading, setAllergyLoading] = useState(false);

  // Sub-list filters
  const patientConsultations = useMemo(() => {
    return consultations.filter(c => c.patientId === id);
  }, [consultations, id]);

  const patientAppointments = useMemo(() => {
    return appointments.filter(a => a.patientId === id);
  }, [appointments, id]);

  const patientInvoices = useMemo(() => {
    return invoices.filter(i => i.patientId === id);
  }, [invoices, id]);

  if (!patient) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h3>Patient Folder Not Found</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>
          The requested patient record could not be found or has been archived.
        </p>
        <Button onClick={() => navigate('/patients')} style={{ marginTop: '16px' }}>
          Return to Registry
        </Button>
      </div>
    );
  }

  const handleAddAllergySubmit = async () => {
    setAllergyError('');
    if (!allergenName.trim()) {
      setAllergyError('Please enter an allergen name.');
      return;
    }

    if (!user) return;

    setAllergyLoading(true);
    
    try {
      const res = await dbOps.addPatientAllergy(
        patient.patientId,
        {
          allergen_name: allergenName.trim(),
          allergy_type: allergyType,
          severity
        },
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );

      if (res.success) {
        setAllergenName('');
        setShowAddAllergy(false);
      } else {
        setAllergyError(res.error || 'Failed to record allergy.');
      }
    } catch (err) {
      setAllergyError('Failed to record allergy.');
    } finally {
      setAllergyLoading(false);
    }
  };

  // Handle Delete Allergy
  const handleDeleteAllergy = async (allergenName: string) => {
    if (!user) return;
    if (confirm(`Remove allergen '${allergenName}' from patient profile?`)) {
      try {
        await dbOps.deletePatientAllergy(
          patient.patientId,
          allergenName,
          {
            userId: user.userId,
            username: user.username,
            role: user.role
          }
        );
      } catch (err) {
        alert('Failed to delete allergy');
      }
    }
  };

  // Helper: Severity Badge color
  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Severe':
        return { backgroundColor: '#fecaca', color: '#b91c1c', fontWeight: 'bold' };
      case 'Moderate':
        return { backgroundColor: '#ffedd5', color: '#d97706' };
      default:
        return { backgroundColor: '#fef3c7', color: '#b45309' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/patients')} 
            style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '50%' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{patient.full_name}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Patient Code: <strong style={{ color: '#2563eb' }}>{patient.patient_code}</strong></p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => navigate(`/appointments/new?patientId=${patient.patientId}`)} icon={<Calendar size={16} />} style={{ height: '38px' }}>
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Grid: Demographics info (Left) & Allergies warn list (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Demographics Card */}
        <Card title="Demographics Folder" subtitle="Core patient identification details" style={{ height: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '4px 0' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Full Name</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{patient.full_name}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>CNIC Number</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>{patient.cnic}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Date of Birth</span>
              <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{patient.date_of_birth}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Gender / Blood Group</span>
              <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{patient.gender} — ({patient.blood_group})</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Contact Mobile</span>
              <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{patient.contact_number}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Registered On</span>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>{new Date(patient.registrationDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Residential Home Address</span>
            <span style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.5 }}>{patient.address}</span>
          </div>

          {patient.emergency_contact_name && (
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Emergency Contact Name</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{patient.emergency_contact_name} ({patient.emergency_contact_relation})</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Emergency Contact Phone</span>
                <span style={{ fontSize: '0.85rem', color: '#0f172a' }}>{patient.emergency_contact_phone}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Right Side: Allergies Warning Panel */}
        <Card 
          title="Allergies & Warnings" 
          subtitle="Critical medication safety alerts"
          headerAction={
            <Button onClick={() => setShowAddAllergy(true)} icon={<Plus size={14} />} variant="outline" style={{ padding: '4px 10px', height: '28px', fontSize: '0.75rem' }}>
              Add Allergy
            </Button>
          }
        >
          {!patient.allergies || patient.allergies.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No Known Active Allergies</span>
              <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.9 }}>This patient record has no critical drug or environmental allergies recorded.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* ALLERGY ALERT BANNER (Section 3.4 of UI Specification) */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                backgroundColor: '#fef2f2', 
                borderLeft: '4px solid #ef4444', 
                borderRadius: '8px', 
                padding: '12px 14px' 
              }}>
                <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ALLERGY ALERT</h4>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Allergies are active and will trigger prescription builders warnings.</span>
                </div>
              </div>

              {/* Allergies list */}
              {patient.allergies.map((allergy, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{allergy.allergen_name}</h5>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Type: {allergy.allergy_type}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span 
                      className="hms-badge" 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '2px 8px',
                        ...getSeverityStyle(allergy.severity)
                      }}
                    >
                      {allergy.severity}
                    </span>
                    
                    <button 
                      onClick={() => handleDeleteAllergy(allergy.allergen_name)}
                      style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Section Tabs: History, Appointments, Invoices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        
        {/* Navigation tabs header bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'history' ? 600 : 500,
              color: activeTab === 'history' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'history' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ClipboardList size={16} />
            <span>Consultation History ({patientConsultations.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'appointments' ? 600 : 500,
              color: activeTab === 'appointments' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'appointments' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calendar size={16} />
            <span>Appointments Grid ({patientAppointments.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'invoices' ? 600 : 500,
              color: activeTab === 'invoices' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'invoices' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Receipt size={16} />
            <span>Outstanding Invoices ({patientInvoices.length})</span>
          </button>
        </div>

        {/* Tab view panels */}
        <Card style={{ padding: 0 }}>
          {activeTab === 'history' && (
            <div>
              {patientConsultations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <ClipboardList size={32} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                  <span style={{ fontSize: '0.85rem', display: 'block' }}>No Consultation Files Logged</span>
                </div>
              ) : (
                <table className="hms-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Diagnosis Details</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Vital Signs</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status Badge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientConsultations.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#0f172a' }}>
                          {new Date(c.finalized_at || c.consultationId).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                          {c.diagnosis_description}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.8rem', color: '#64748b' }}>
                          BP: {c.blood_pressure || '—'} | Temp: {c.temperature || '—'}°C | HR: {c.pulse_rate || '—'} bpm
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span className={`hms-badge ${c.status === 'Completed' ? 'badge-completed' : 'badge-inprogress'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              {patientAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Calendar size={32} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                  <span style={{ fontSize: '0.85rem', display: 'block' }}>No Appointments Booked</span>
                </div>
              ) : (
                <table className="hms-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Appointment ID</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Time Slot</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientAppointments.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                          {a.appointmentId}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#0f172a' }}>
                          {a.appointment_date}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                          {a.slot_start_time} – {a.slot_end_time}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span className={`hms-badge ${
                            a.status === 'Scheduled' ? 'badge-scheduled' :
                            a.status === 'Completed' ? 'badge-completed' :
                            a.status === 'Cancelled' ? 'badge-cancelled' : 'badge-noshow'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              {patientInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Receipt size={32} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                  <span style={{ fontSize: '0.85rem', display: 'block' }}>No Invoices Generated</span>
                </div>
              ) : (
                <table className="hms-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Invoice ID</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Total Fee</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Amount Paid</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientInvoices.map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                          {inv.invoice_number}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                          Rs. {inv.total_amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#16a34a' }}>
                          Rs. {inv.amount_paid.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span className={`hms-badge ${
                            inv.payment_status === 'Paid' ? 'badge-paid' :
                            inv.payment_status === 'Partially Paid' ? 'badge-partiallypaid' : 'badge-unpaid'
                          }`}>
                            {inv.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Modal: Add Patient Allergy Overlay */}
      <Modal
        isOpen={showAddAllergy}
        onClose={() => { setShowAddAllergy(false); setAllergyError(''); }}
        title="Add Critical Patient Allergy"
        primaryActionLabel="Add Allergy Card"
        onPrimaryAction={handleAddAllergySubmit}
        primaryActionLoading={allergyLoading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allergyError && (
            <div style={{ color: '#ef4444', fontSize: '0.8rem', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
              {allergyError}
            </div>
          )}

          <Input
            label="Allergen Name"
            placeholder="e.g. Penicillin, Aspirin, Peanuts"
            value={allergenName}
            onChange={(e) => setAllergenName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Allergy Category</label>
              <select 
                className="form-input" 
                value={allergyType} 
                onChange={(e) => setAllergyType(e.target.value as any)}
              >
                <option value="Medication">Medication</option>
                <option value="Food">Food</option>
                <option value="Environmental">Environmental</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select 
                className="form-input" 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value as any)}
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default PatientProfilePage;
