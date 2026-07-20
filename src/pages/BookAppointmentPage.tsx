import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Search, Calendar, User, UserCheck, Stethoscope, ChevronRight, ChevronLeft, CalendarCheck, ShieldAlert } from 'lucide-react';
import { Patient, Doctor } from '../types';

export const BookAppointmentPage: React.FC = () => {
  const { patients, doctors, appointments, dbOps, refreshData } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step wizard state: 1: Select Patient, 2: Select Doctor, 3: Select Date & Slot
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selections state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Lookup Patient Search state
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  // Errors / loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-select patient if patientId is in URL query parameters
  useEffect(() => {
    const patientIdParam = searchParams.get('patientId');
    if (patientIdParam) {
      const found = patients.find(p => p.patientId === patientIdParam && p.is_active);
      if (found) {
        setSelectedPatient(found);
        setStep(2); // Jump directly to doctor selection step
      }
    }
  }, [searchParams, patients]);

  // Step 1: Filter Patients
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.filter(p => p.is_active).slice(0, 5); // show first 5
    return patients.filter((patient) => {
      const search = patientSearch.toLowerCase();
      return (
        patient.full_name.toLowerCase().includes(search) ||
        patient.cnic.includes(search) ||
        patient.patient_code.toLowerCase().includes(search)
      ) && patient.is_active;
    });
  }, [patients, patientSearch]);

  // Step 2: Filter Doctors
  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return doctors;
    return doctors.filter((doc) => {
      const search = doctorSearch.toLowerCase();
      return (
        doc.name.toLowerCase().includes(search) ||
        doc.specialization.toLowerCase().includes(search)
      );
    });
  }, [doctors, doctorSearch]);

  // Step 3: Available time slot grid mapping
  const timeSlotsStatus = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];

    // Parse date weekday name safely to avoid UTC off-by-one errors
    const [y, m, d] = selectedDate.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if clinician works on this day
    const isWorkingDay = selectedDoctor.schedule.workingDays.includes(dayName);

    return selectedDoctor.schedule.timeSlots.map((slot) => {
      const isBooked = appointments.some(
        (apt) =>
          apt.doctorId === selectedDoctor.doctorId &&
          apt.appointment_date === selectedDate &&
          apt.slot_start_time === slot &&
          apt.status === 'Scheduled'
      );

      return {
        slot,
        isAvailable: isWorkingDay && !isBooked,
        isWorkingDay
      };
    });
  }, [selectedDoctor, selectedDate, appointments]);

  // Proceed with booking slot
  const handleConfirmBooking = () => {
    setError('');
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Please finalize all selections including patient, clinician, date and time slot.');
      return;
    }

    if (!user) {
      setError('Operator credentials session missing.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = dbOps.bookAppointment(
        {
          patientId: selectedPatient.patientId,
          doctorId: selectedDoctor.doctorId,
          appointment_date: selectedDate,
          slot_start_time: selectedSlot,
          slot_end_time: '' // auto-computed inside db
        },
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );

      setLoading(false);

      if (res.success && res.appointment) {
        refreshData();
        navigate('/appointments');
      } else {
        setError(res.error || 'Failed to schedule appointment.');
      }
    }, 1500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Book Appointment Slot</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Schedule a consultation slot conflict-free</p>
      </div>

      {/* Step Indicators bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px 24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 1 ? '#2563eb' : '#64748b', fontWeight: step === 1 ? 600 : 400 }}>
          <div className="flex-center" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 1 ? '#eff6ff' : '#f1f5f9', border: step >= 1 ? '1px solid #2563eb' : '1px solid #e2e8f0', fontSize: '0.8rem' }}>1</div>
          <span>Select Patient</span>
        </div>
        <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 2 ? '#2563eb' : '#64748b', fontWeight: step === 2 ? 600 : 400 }}>
          <div className="flex-center" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 2 ? '#eff6ff' : '#f1f5f9', border: step >= 2 ? '1px solid #2563eb' : '1px solid #e2e8f0', fontSize: '0.8rem' }}>2</div>
          <span>Select Clinician</span>
        </div>
        <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 3 ? '#2563eb' : '#64748b', fontWeight: step === 3 ? 600 : 400 }}>
          <div className="flex-center" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 3 ? '#eff6ff' : '#f1f5f9', border: step >= 3 ? '1px solid #2563eb' : '1px solid #e2e8f0', fontSize: '0.8rem' }}>3</div>
          <span>Select Slot Grid</span>
        </div>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fca5a5', 
          color: '#ef4444', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Step Panels */}
      
      {/* STEP 1: Select Patient */}
      {step === 1 && (
        <Card title="Patient Lookup Search" subtitle="Search by Patient Code, Name, or CNIC to link appointment">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              placeholder="Search by Name, CNIC, or Patient Code..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              icon={<Search size={18} style={{ color: '#64748b' }} />}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPatients.map((p) => (
                <div 
                  key={p.patientId}
                  onClick={() => setSelectedPatient(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: selectedPatient?.patientId === p.patientId ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: selectedPatient?.patientId === p.patientId ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="flex-center" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{p.full_name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CNIC: {p.cnic} | Code: {p.patient_code}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>{p.blood_group}</span>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: '0.85rem' }}>
                  No patient matches found. <button onClick={() => navigate('/patients/new')} style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Register new patient</button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button 
                disabled={!selectedPatient}
                onClick={() => setStep(2)}
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Next Step
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Select Clinician */}
      {step === 2 && (
        <Card title="Choose Clinician" subtitle="Select treating doctor or specialist">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              placeholder="Search by Doctor Name or Specialty..."
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              icon={<Search size={18} style={{ color: '#64748b' }} />}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {filteredDoctors.map((doc) => (
                <div 
                  key={doc.doctorId}
                  onClick={() => setSelectedDoctor(doc)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: selectedDoctor?.doctorId === doc.doctorId ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: selectedDoctor?.doctorId === doc.doctorId ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="flex-center" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{doc.name}</h4>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{doc.specialization}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '0.75rem', color: '#475569' }}>
                    <span>Fee: <strong>Rs. {doc.consultationFee}</strong></span>
                    <span>{doc.schedule.workingDays.length} days / week</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <Button variant="secondary" onClick={() => setStep(1)} icon={<ChevronLeft size={16} />}>
                Back
              </Button>
              <Button 
                disabled={!selectedDoctor}
                onClick={() => setStep(3)}
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Next Step
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Select Date & Slot Grid */}
      {step === 3 && (
        <Card title="Finalize Appointment Schedule" subtitle="Select date and confirm available slot conflict-free">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Selected Patient</span>
                <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {selectedPatient?.full_name} ({selectedPatient?.patient_code})
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Selected Clinician</span>
                <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {selectedDoctor?.name} ({selectedDoctor?.specialization})
                </div>
              </div>
            </div>

            <Input
              label="Select Consultation Date"
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
              required
            />

            {/* Slots selector grid */}
            {selectedDate && (
              <div>
                <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Available Time Slots Grid</span>
                
                {timeSlotsStatus.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem' }}>
                    Clinician is not working on the selected day. Select another date.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {timeSlotsStatus.map(({ slot, isAvailable }) => (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          height: '42px',
                          borderRadius: '8px',
                          border: selectedSlot === slot 
                            ? '1px solid #2563eb' 
                            : isAvailable 
                              ? '1px solid #22c55e' 
                              : '1px solid #e2e8f0',
                          backgroundColor: selectedSlot === slot 
                            ? '#eff6ff' 
                            : isAvailable 
                              ? '#f0fdf4' 
                              : '#f1f5f9',
                          color: selectedSlot === slot 
                            ? '#2563eb' 
                            : isAvailable 
                              ? '#166534' 
                              : '#94a3b8',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          fontSize: '0.85rem',
                          fontWeight: selectedSlot === slot || isAvailable ? 600 : 400,
                          transition: 'all 0.1s',
                          textDecoration: !isAvailable ? 'line-through' : 'none'
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setStep(2)} icon={<ChevronLeft size={16} />}>
                Back
              </Button>
              <Button 
                disabled={!selectedSlot}
                loading={loading}
                onClick={handleConfirmBooking}
                icon={<CalendarCheck size={16} />}
              >
                Confirm Appointment Slot
              </Button>
            </div>

          </div>
        </Card>
      )}

    </div>
  );
};

export default BookAppointmentPage;
