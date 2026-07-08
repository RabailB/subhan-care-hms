import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Stethoscope, Plus, Calendar, Clock, UserCheck } from 'lucide-react';

export const DoctorListPage: React.FC = () => {
  const { doctors, dbOps, refreshData } = useDatabase();
  const navigate = useNavigate();

  const handleDeactivate = (docId: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate clinician ${name} and lock their account access?`)) {
      const activeUser = localStorage.getItem('subhancare_active_user');
      if (activeUser) {
        try {
          const operator = JSON.parse(activeUser);
          dbOps.deactivateDoctor(docId, operator);
          refreshData();
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Clinicians Directory</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage doctor profiles, consultation pricing, and work shifts schedules</p>
        </div>
        <Button onClick={() => navigate('/doctors/new')} icon={<Plus size={16} />}>
          Add Clinician Profile
        </Button>
      </div>

      {/* Main card panel */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <Stethoscope size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No Clinicians Configured</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', maxWidth: '360px', margin: '4px auto 0' }}>
                There are no active doctor records registered in the system database directory.
              </p>
            </div>
            <Button onClick={() => navigate('/doctors/new')} icon={<Plus size={16} />} style={{ height: '36px', marginTop: '8px' }}>
              Add Clinician Profile
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="hms-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Clinician ID</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Name</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Specialization</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>PMDC License</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Consultation Fee</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Working Days</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.doctorId} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                      {doc.doctorId}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                      <div>
                        <span>{doc.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 400 }}>{doc.qualification}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                      {doc.specialization}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569', fontFamily: 'monospace' }}>
                      {doc.licenseNumber}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      Rs. {doc.consultationFee.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.8rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: '#64748b' }} />
                        <span>{doc.schedule.workingDays.join(', ')}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDeactivate(doc.doctorId, doc.name)}
                          style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '6px 10px', height: '30px', fontSize: '0.75rem' }}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorListPage;
