import React from 'react';
import { Card } from '../components/Card';
import { Calendar, User, FileText, Stethoscope } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Doctor Workspace - Clinical Hub" subtitle="View assigned consultations and patient medical history files">
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <Stethoscope size={48} style={{ color: '#2563eb', marginBottom: '16px' }} />
          <h3>Welcome to Clinical Consultations Console</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Doctor workflows (Consultation history, diagnosis records, prescriptions with allergy validation warnings) will be active in Sprint Days 4-6.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default DoctorDashboard;
