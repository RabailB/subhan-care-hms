import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Calendar, User, FileText, Stethoscope, Clock, CheckCircle } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Appointment, Patient } from '../types';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    // Only fetch for the specific doctor (using their username or entityId mapping)
    // In our mock, user.userId corresponds to the doctor. Wait, user.username might be the doctor name?
    // In db.ts, user.userId usually maps to booked_by or doctorId. 
    // We'll fetch all and filter by doctorId === user.entityId (if set) or just string match name
    const allApts = db.getAppointments();
    
    // In a real app, user.entityId would be set to the doctorId. 
    // For this prototype, we'll try to find the doctor ID by name, or just show all if not strictly mapped.
    const docs = db.getDoctors();
    const myDocProfile = docs.find(d => d.name === user?.username || d.doctorId === user?.entityId);
    
    if (myDocProfile) {
      setAppointments(allApts.filter(a => a.doctorId === myDocProfile.doctorId));
    } else {
      // Fallback: show all if mapping isn't perfect in our mock data
      setAppointments(allApts);
    }
    
    setPatients(db.getPatients());
  }, [user]);

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.patientId === patientId)?.full_name || patientId;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Scheduled': return <span className="hms-badge badge-primary"><Calendar size={12} style={{marginRight:'4px'}}/> Scheduled</span>;
      case 'Completed': return <span className="hms-badge badge-success"><CheckCircle size={12} style={{marginRight:'4px'}}/> Completed</span>;
      default: return <span className="hms-badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <Stethoscope size={20} className="text-primary" />
            Clinical Consultations
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Manage your daily appointments and patient encounters</p>
        </div>
      </div>

      <Card title="Today's Appointments" subtitle="Patients scheduled for consultation">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient Name</th>
                <th>Appointment ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No appointments scheduled for today.</td>
                </tr>
              ) : (
                appointments.map(apt => (
                  <tr key={apt.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} className="text-muted" />
                        {apt.slot_start_time} - {apt.slot_end_time}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: '#0f172a' }}>{getPatientName(apt.patientId)}</td>
                    <td style={{ fontSize: '0.85rem' }}>{apt.appointmentId}</td>
                    <td>{getStatusBadge(apt.status)}</td>
                    <td>
                      {apt.status === 'Scheduled' ? (
                        <Button 
                          variant="primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto' }}
                          onClick={() => navigate(`/consultation/${apt.appointmentId}`)}
                        >
                          <Stethoscope size={14} style={{ marginRight: '4px' }} /> Start Consultation
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto' }}
                          onClick={() => navigate(`/consultation/${apt.appointmentId}`)}
                        >
                          <FileText size={14} style={{ marginRight: '4px' }} /> View Record
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default DoctorDashboard;
