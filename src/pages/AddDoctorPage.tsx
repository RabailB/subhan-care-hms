import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ArrowLeft, UserPlus, ShieldAlert } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00'
];

export const AddDoctorPage: React.FC = () => {
  const { dbOps, refreshData } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualification, setQualification] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(1000);

  // Schedule Selector States
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timeSlots, setTimeSlots] = useState<string[]>([
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'
  ]);

  // Loading/Errors
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle day select
  const handleDayToggle = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  // Toggle slot select
  const handleSlotToggle = (slot: string) => {
    if (timeSlots.includes(slot)) {
      setTimeSlots(timeSlots.filter(s => s !== slot));
    } else {
      setTimeSlots([...timeSlots, slot]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (name.trim().length < 3) {
      setError('Doctor Name must be at least 3 characters.');
      return;
    }

    if (!qualification.trim()) {
      setError('Please specify medical qualifications (e.g. MBBS, FCPS).');
      return;
    }

    if (!licenseNumber.trim().startsWith('PMDC-')) {
      setError('License Number must be a valid PMDC code (starts with PMDC-).');
      return;
    }

    if (consultationFee < 0) {
      setError('Consultation Fee cannot be negative.');
      return;
    }

    if (workingDays.length === 0) {
      setError('Please select at least one working day.');
      return;
    }

    if (timeSlots.length === 0) {
      setError('Please select at least one working time slot.');
      return;
    }

    if (!user) {
      setError('Active session operator not found.');
      return;
    }

    setLoading(true);

    try {
      const res = await dbOps.createDoctor(
        {
          name: name.trim(),
          specialization,
          qualification: qualification.trim(),
          licenseNumber: licenseNumber.trim(),
          contactInfo: contactInfo.trim(),
          consultationFee: Number(consultationFee),
          schedule: {
            workingDays,
            timeSlots
          }
        },
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );

      setLoading(false);

      if (res.success && res.doctor) {
        setSuccess(`Doctor Profile for '${res.doctor.name}' generated. Default credentials: username is doctor's initials, password: doctor123`);
        refreshData();
        setTimeout(() => navigate('/doctors'), 2000);
      } else {
        setError('Failed to register doctor profile.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred while creating doctor profile.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Navigation bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => navigate('/doctors')} 
          style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '50%' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Register Clinician</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Configure doctor qualifications and weekly schedule slots</p>
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

      {success && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
          {success}
        </div>
      )}

      {/* Main card form */}
      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: Doctor Profile Details */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
              1. Clinician Profile Info
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <Input
                label="Doctor Full Name"
                placeholder="e.g. Dr. Subhan Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="form-group">
                <label className="form-label">Specialization Speciality</label>
                <select 
                  className="form-input" 
                  value={specialization} 
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="ENT">ENT</option>
                </select>
              </div>

              <Input
                label="Qualification"
                placeholder="e.g. MBBS, FCPS (Cardiology)"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <Input
                label="PMDC License Number"
                placeholder="PMDC-XXXXX-P"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
              />

              <Input
                label="Contact Number"
                placeholder="e.g. +92 300 1234567"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required
              />

              <Input
                label="Consultation Fee (PKR)"
                type="number"
                placeholder="1500"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Section 2: Availability Schedule Checker */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
              2. Weekly Availability Schedule
            </h3>
            
            {/* Days picker checkboxes */}
            <div style={{ marginBottom: '20px' }}>
              <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Working Weekdays Selection</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {WEEKDAYS.map((day) => {
                  const active = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: active ? '#eff6ff' : '#ffffff',
                        color: active ? '#2563eb' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.1s'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots checkboxes */}
            <div>
              <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Active Daily Shift Slots (30 min slots)</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                {TIME_SLOTS.map((slot) => {
                  const active = timeSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSlotToggle(slot)}
                      style={{
                        height: '34px',
                        borderRadius: '6px',
                        border: active ? '1px solid #22c55e' : '1px solid #e2e8f0',
                        backgroundColor: active ? '#f0fdf4' : '#ffffff',
                        color: active ? '#15803d' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/doctors')} style={{ height: '42px' }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={<UserPlus size={16} />} style={{ height: '42px' }}>
              Register Clinician Profile
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default AddDoctorPage;
