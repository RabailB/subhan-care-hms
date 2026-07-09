import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ArrowLeft, UserCheck, ShieldAlert } from 'lucide-react';

export const PatientRegisterPage: React.FC = () => {
  const { dbOps } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [cnic, setCnic] = useState('');
  const [bloodGroup, setBloodGroup] = useState<any>('Unknown');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // Emergency Contact Details
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Error/Loading States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // CNIC Auto-Formatter: adds hyphens at index 5 and 13 (e.g. 42101-1234567-1)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
    if (value.length > 13) value = value.slice(0, 13); // Max 13 digits
    
    // Formatting: #####-#######-#
    let formatted = value;
    if (value.length > 5 && value.length <= 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12, 13)}`;
    }
    setCnic(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (fullName.trim().length < 3) {
      setError('Full Name must be at least 3 characters long.');
      return;
    }

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime()) || birthDate >= new Date()) {
      setError('Date of Birth must be a valid past date.');
      return;
    }

    // CNIC digits check (must be 13 digits excluding hyphens)
    const rawCnic = cnic.replace(/[^0-9]/g, '');
    if (rawCnic.length !== 13) {
      setError('CNIC must contain exactly 13 digits.');
      return;
    }

    if (!contactNumber.trim() || !address.trim()) {
      setError('Contact Number and Home Address are required fields.');
      return;
    }

    if (!user) {
      setError('Active session operator not found. Log in again.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = dbOps.registerPatient(
        {
          full_name: fullName.trim(),
          date_of_birth: dob,
          gender,
          cnic,
          contact_number: contactNumber.trim(),
          address: address.trim(),
          blood_group: bloodGroup,
          emergency_contact_name: emergencyName.trim() || undefined,
          emergency_contact_phone: emergencyPhone.trim() || undefined,
          emergency_contact_relation: emergencyRelation.trim() || undefined
        },
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );

      setLoading(false);

      if (res.success && res.patient) {
        navigate(`/patients/${res.patient.patientId}`);
      } else {
        setError(res.error || 'Failed to complete patient registration.');
      }
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header bar */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Patient Folder Registration</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Create a new digital folder for a hospital patient</p>
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

      {/* Registration Card Form */}
      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section: Demographics */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
              1. Demographics & Contact
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <Input
                label="Full Name"
                placeholder="e.g. Muhammad Murtaza"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                  className="form-input" 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <Input
                label="CNIC / B-Form Number"
                placeholder="42101-1234567-1"
                value={cnic}
                onChange={handleCnicChange}
                required
              />

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select 
                  className="form-input" 
                  value={bloodGroup} 
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <Input
                label="Contact Mobile"
                placeholder="e.g. +92 333 1234567"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-input"
                style={{ height: '80px', padding: '12px 14px' }}
                placeholder="Enter patient home address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section: Emergency Contacts */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px', marginTop: '8px' }}>
              2. Emergency Contact (Optional)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <Input
                label="Contact Person Name"
                placeholder="e.g. Zahid Hussain"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
              />

              <Input
                label="Contact Person Phone"
                placeholder="e.g. +92 300 9988776"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />

              <Input
                label="Relationship to Patient"
                placeholder="e.g. Spouse, Father, Brother"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/patients')} style={{ height: '42px' }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={<UserCheck size={16} />} style={{ height: '42px' }}>
              Register Patient Folder
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default PatientRegisterPage;
