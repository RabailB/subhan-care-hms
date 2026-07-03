import React from 'react';
import { Card } from '../components/Card';
import { UserCheck, Calendar, Search } from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Reception Workspace - Patient Registry" subtitle="Register patient demographic details and schedule appointments">
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <UserCheck size={48} style={{ color: '#22c55e', marginBottom: '16px' }} />
          <h3>Welcome to Hospital Reception Terminal</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Reception workflows (Register patient with CNIC duplicate checks, and book appointment schedules with doctor overlap prevention) will be active in Sprint Days 4-6.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default ReceptionistDashboard;
