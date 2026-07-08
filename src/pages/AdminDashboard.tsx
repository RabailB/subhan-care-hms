import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  ShieldAlert, 
  Settings, 
  UserPlus, 
  TrendingUp,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { patients, doctors, staff, inventory, invoices, auditLogs, dbOps } = useDatabase();
  const { user } = useAuth();
  
  // States for staff registration
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'receptionist' | 'pharmacist' | 'billing'>('receptionist');
  const [staffContact, setStaffContact] = useState('');
  const [staffShift, setStaffShift] = useState('09:00 - 17:00');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate Metrics
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalStaff = staff.length;
  const lowStockCount = inventory.filter(item => item.quantity_in_stock <= item.reorder_threshold).length;
  
  const totalRevenue = invoices
    .filter(inv => inv.payment_status === 'Paid' || inv.payment_status === 'Partially Paid')
    .reduce((sum, inv) => sum + inv.amount_paid, 0);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!staffName || !staffContact || !staffShift) {
      setError('Please fill in all staff details.');
      return;
    }

    if (!user) return;

    const res = dbOps.createStaff(
      {
        name: staffName,
        role: staffRole,
        contactInfo: staffContact,
        shiftTiming: staffShift
      },
      {
        userId: user.userId,
        username: user.username,
        role: user.role
      }
    );

    if (res.success && res.staff) {
      setSuccess(`Staff '${res.staff.name}' and user login registered successfully!`);
      // Reset form
      setStaffName('');
      setStaffContact('');
      setStaffShift('09:00 - 17:00');
      setTimeout(() => setShowAddStaff(false), 2000);
    } else {
      setError('Failed to create staff account.');
    }
  };

  const handleDeactivateStaff = (staffId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to deactivate this staff member and revoke all access?')) {
      dbOps.deactivateStaff(staffId, {
        userId: user.userId,
        username: user.username,
        role: user.role
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overview Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <Card className="flex-between" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Patients</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{totalPatients}</span>
          </div>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <Users size={24} />
          </div>
        </Card>

        <Card className="flex-between" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Active Clinicians</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{totalDoctors}</span>
          </div>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <TrendingUp size={24} />
          </div>
        </Card>

        <Card className="flex-between" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Revenue</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Rs. {totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <DollarSign size={24} />
          </div>
        </Card>

        <Card className="flex-between" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Low-Stock Items</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>{lowStockCount}</span>
          </div>
          <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Package size={24} />
          </div>
        </Card>

      </div>

      {/* Main Grid: Staff Management & Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Staff List & Control */}
        <Card 
          title="Hospital Staff Directories" 
          subtitle="Manage receptionists, pharmacists, and billing staff roles"
          headerAction={
            <Button onClick={() => setShowAddStaff(!showAddStaff)} icon={<UserPlus size={16} />} variant="outline">
              {showAddStaff ? 'Close Form' : 'Register Staff'}
            </Button>
          }
        >
          {showAddStaff && (
            <form onSubmit={handleAddStaffSubmit} className="animate-slide-up" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>New Staff Information</h4>
              
              {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '8px' }}>{error}</div>}
              {success && <div style={{ color: '#22c55e', fontSize: '0.8rem', marginBottom: '8px' }}>{success}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                />
                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select
                    className="form-input"
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="billing">Billing Staff</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
                <Input
                  label="Contact Phone"
                  placeholder="e.g. +92 300 1234567"
                  value={staffContact}
                  onChange={(e) => setStaffContact(e.target.value)}
                  required
                />
                <Input
                  label="Work Shift Hours"
                  placeholder="e.g. 09:00 - 17:00"
                  value={staffShift}
                  onChange={(e) => setStaffShift(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" style={{ marginTop: '14px', width: '100%' }}>
                Register Staff Profile & Account
              </Button>
            </form>
          )}

          <div className="table-container">
            <table className="hms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Shift Time</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(st => (
                  <tr key={st.staffId}>
                    <td><strong>{st.name}</strong></td>
                    <td>
                      <span className={`hms-badge ${
                        st.role === 'receptionist' ? 'badge-success' :
                        st.role === 'pharmacist' ? 'badge-warning' : 'badge-primary'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {st.role}
                      </span>
                    </td>
                    <td>{st.shiftTiming}</td>
                    <td>{st.contactInfo}</td>
                    <td>
                      <Button onClick={() => handleDeactivateStaff(st.staffId)} variant="outline" style={{ height: '30px', padding: '0 8px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}>
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Side: Audit Logs */}
        <Card 
          title="System Audit Logs" 
          subtitle="Real-time tamper-evident records of all database changes"
          headerAction={<ShieldAlert size={20} style={{ color: '#ef4444' }} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {auditLogs.map(log => (
              <div 
                key={log.logId}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div className="flex-between">
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.username} ({log.role.toUpperCase()})</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p style={{ color: '#475569', fontWeight: 500 }}>{log.action}</p>
                <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '0.7rem' }}>
                  <span>Table: <strong style={{ color: '#64748b' }}>{log.affectedTable}</strong></span>
                  <span>ID: <strong style={{ color: '#64748b' }}>{log.affectedRecordId}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
};
export default AdminDashboard;
