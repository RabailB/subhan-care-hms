import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Calendar, Plus, Clock, Eye, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';

export const AppointmentListPage: React.FC = () => {
  const { appointments, patients, doctors, dbOps, refreshData } = useDatabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter States
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [dateFilter, setDateFilter] = useState('');

  // Cancel Modal States
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<'Patient Request' | 'Doctor Unavailable' | 'Clinical Reason' | 'Other'>('Patient Request');
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule Modal States
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Find Patient name for rendering
  const getPatientName = (patientId: string) => {
    const p = patients.find(p => p.patientId === patientId);
    return p ? p.full_name : 'Unknown Patient';
  };

  // Find Doctor name for rendering
  const getDoctorName = (docId: string) => {
    const d = doctors.find(d => d.doctorId === docId);
    return d ? d.name : 'Unknown Doctor';
  };

  // Filter Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDoc = doctorFilter === 'All' || apt.doctorId === doctorFilter;
      const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
      const matchesDate = !dateFilter || apt.appointment_date === dateFilter;
      return matchesDoc && matchesStatus && matchesDate;
    });
  }, [appointments, doctorFilter, statusFilter, dateFilter]);

  // Handle Cancel Appointment
  const handleCancelConfirm = async () => {
    if (!cancelTarget || !user) return;
    setCancelLoading(true);
    
    try {
      const reasonText = cancelReason === 'Other' ? cancelReasonDetail : cancelReason;
      await dbOps.updateAppointmentStatus(
        cancelTarget.appointmentId,
        'Cancelled',
        reasonText,
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );
      setCancelLoading(false);
      setCancelTarget(null);
      setCancelReason('Patient Request');
      setCancelReasonDetail('');
      refreshData();
    } catch (err) {
      setCancelLoading(false);
    }
  };

  // Handle Reschedule Appointment
  const handleRescheduleConfirm = async () => {
    setRescheduleError('');
    if (!rescheduleTarget || !user) return;
    if (!rescheduleDate || !rescheduleSlot) {
      setRescheduleError('Please select both date and time slot.');
      return;
    }

    setRescheduleLoading(true);
    try {
      // First cancel the old one
      await dbOps.updateAppointmentStatus(
        rescheduleTarget.appointmentId,
        'Cancelled',
        'Rescheduled to new slot',
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );

      // Book a new one
      const res = await dbOps.bookAppointment(
        {
          patientId: rescheduleTarget.patientId,
          doctorId: rescheduleTarget.doctorId,
          appointment_date: rescheduleDate,
          slot_start_time: rescheduleSlot,
          slot_end_time: '' // auto-calculated
        },
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      );

      setRescheduleLoading(false);

      if (res.success) {
        setRescheduleTarget(null);
        setRescheduleDate('');
        setRescheduleSlot('');
        refreshData();
      } else {
        // Rollback cancel if new booking fails (not needed for mock but clean)
        await dbOps.updateAppointmentStatus(
          rescheduleTarget.appointmentId,
          'Scheduled',
          '',
          {
            userId: user.userId,
            username: user.username,
            role: user.role
          }
        );
        setRescheduleError(res.error || 'Failed to book slot.');
      }
    } catch (err) {
      setRescheduleLoading(false);
      setRescheduleError('Failed to reschedule.');
    }
  };

  // Available slots logic helper for rescheduling
  const availableSlotsForReschedule = useMemo(() => {
    if (!rescheduleTarget || !rescheduleDate) return [];
    
    const doc = doctors.find(d => d.doctorId === rescheduleTarget.doctorId);
    if (!doc) return [];

    // Parse day name (e.g. "Monday") from date
    const dateObj = new Date(rescheduleDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if doctor works on this day
    if (!doc.schedule.workingDays.includes(dayName)) {
      return [];
    }

    // Filter already booked slots for this doctor on this day
    return doc.schedule.timeSlots.filter(slot => {
      const alreadyBooked = appointments.find(
        a => a.doctorId === doc.doctorId &&
             a.appointment_date === rescheduleDate &&
             a.slot_start_time === slot &&
             a.status === 'Scheduled'
      );
      return !alreadyBooked;
    });
  }, [rescheduleTarget, rescheduleDate, doctors, appointments]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Appointments Calendar</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Search and coordinate patient consultation schedules</p>
        </div>
        <Button onClick={() => navigate('/appointments/new')} icon={<Plus size={16} />}>
          Book Appointment slot
        </Button>
      </div>

      {/* Filter panel */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ width: '220px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Filter Doctor</label>
              <select 
                className="form-input" 
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              >
                <option value="All">All Clinicians</option>
                {doctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ width: '180px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Filter Status</label>
              <select 
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
          </div>

          <div style={{ width: '180px' }}>
            <Input
              label="Select Date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          {(doctorFilter !== 'All' || statusFilter !== 'All' || dateFilter) && (
            <Button 
              variant="outline" 
              onClick={() => { setDoctorFilter('All'); setStatusFilter('All'); setDateFilter(''); }}
              style={{ height: '40px' }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table panel */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Calendar size={36} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
            <h3>No Appointments Recorded</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>There are no scheduling slots found matching your selected filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="hms-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Appointment ID</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Patient</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Doctor</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Time Slot</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                      {apt.appointmentId}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                      {getPatientName(apt.patientId)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                      {getDoctorName(apt.doctorId)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                      {apt.appointment_date}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: '#64748b' }} />
                        <span>{apt.slot_start_time} – {apt.slot_end_time}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span className={`hms-badge ${
                        apt.status === 'Scheduled' ? 'badge-scheduled' :
                        apt.status === 'Completed' ? 'badge-completed' :
                        apt.status === 'Cancelled' ? 'badge-cancelled' : 'badge-noshow'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {apt.status === 'Scheduled' && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outline" 
                            onClick={() => setRescheduleTarget(apt)}
                            icon={<Edit2 size={13} />}
                            style={{ padding: '6px 10px', height: '30px', fontSize: '0.75rem' }}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setCancelTarget(apt)}
                            icon={<Trash2 size={13} />}
                            style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '6px 10px', height: '30px', fontSize: '0.75rem' }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {apt.status === 'Cancelled' && apt.cancellation_reason && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                          Cancelled: {apt.cancellation_reason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Cancel Confirmation */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Scheduled Appointment"
        primaryActionLabel="Confirm Cancellation"
        onPrimaryAction={handleCancelConfirm}
        primaryActionLoading={cancelLoading}
        primaryActionVariant="danger"
        isConfirmation
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0 }}>
            Are you sure you want to cancel appointment <strong style={{ color: '#ef4444' }}>{cancelTarget?.appointmentId}</strong> for patient <strong>{cancelTarget ? getPatientName(cancelTarget.patientId) : ''}</strong>?
          </p>

          <div className="form-group">
            <label className="form-label">Cancellation Reason Selection</label>
            <select 
              className="form-input"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value as any)}
            >
              <option value="Patient Request">Patient Request</option>
              <option value="Doctor Unavailable">Doctor Unavailable</option>
              <option value="Clinical Reason">Clinical Reason</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {cancelReason === 'Other' && (
            <Input
              label="Provide details"
              placeholder="Specify the reason for cancellation..."
              value={cancelReasonDetail}
              onChange={(e) => setCancelReasonDetail(e.target.value)}
              required
            />
          )}
        </div>
      </Modal>

      {/* Modal: Reschedule Date/Slot Picker */}
      <Modal
        isOpen={!!rescheduleTarget}
        onClose={() => { setRescheduleTarget(null); setRescheduleError(''); }}
        title="Reschedule Appointment Time Slot"
        primaryActionLabel="Reschedule Slot"
        onPrimaryAction={handleRescheduleConfirm}
        primaryActionLoading={rescheduleLoading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0 }}>
            Change scheduling slots details for <strong>{rescheduleTarget ? getPatientName(rescheduleTarget.patientId) : ''}</strong> with <strong>{rescheduleTarget ? getDoctorName(rescheduleTarget.doctorId) : ''}</strong>.
          </p>

          {rescheduleError && (
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '6px', fontSize: '0.8rem' }}>
              {rescheduleError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Input
              label="Select New Date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleSlot(''); }}
              required
            />

            <div className="form-group">
              <label className="form-label">Available time slots</label>
              <select
                className="form-input"
                value={rescheduleSlot}
                onChange={(e) => setRescheduleSlot(e.target.value)}
                disabled={!rescheduleDate}
              >
                <option value="">-- Choose Slot --</option>
                {availableSlotsForReschedule.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {!rescheduleDate && <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Choose a date first</span>}
              {rescheduleDate && availableSlotsForReschedule.length === 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>No free slots on this day</span>}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AppointmentListPage;
