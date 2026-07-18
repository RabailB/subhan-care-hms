import React from 'react';
import { Card } from '../components/Card';
import { UserPlus, CalendarPlus, UserCheck, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Reception Workspace" subtitle="Quick Actions and Dashboard">
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <UserCheck size={48} style={{ color: '#2563eb', marginBottom: '16px' }} />
          <h3 style={{ color: '#0f172a' }}>Welcome to the Reception Terminal</h3>
          <p style={{ marginTop: '8px', fontSize: '0.95rem', marginBottom: '30px' }}>
            What would you like to do today?
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button 
              variant="primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              onClick={() => navigate('/patients/new')}
            >
              <UserPlus size={20} /> Register New Patient
            </Button>
            
            <Button 
              variant="success" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              onClick={() => navigate('/appointments/new')}
            >
              <CalendarPlus size={20} /> Book Appointment
            </Button>

            <Button 
              variant="outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              onClick={() => navigate('/patients')}
            >
              <Search size={20} /> Search Patients
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default ReceptionistDashboard;
