import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  User, 
  Activity, 
  Calendar, 
  FileText, 
  ClipboardList, 
  Package, 
  CreditCard, 
  ShieldAlert, 
  Clock, 
  UserCheck,
  Building,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab 
}) => {
  const { user, logout, sessionTimeRemaining } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) return null;

  // Format time remaining MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'badge-danger';
      case 'Doctor': return 'badge-primary';
      case 'Receptionist': return 'badge-success';
      case 'Pharmacist': return 'badge-warning';
      case 'Billing Staff': return 'badge-info';
      default: return 'badge-primary';
    }
  };

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const common = [
      { id: 'profile', label: 'My Profile', icon: User }
    ];

    switch (user.role) {
      case 'Admin':
        return [
          { id: 'overview', label: 'Overview Dashboard', icon: Activity },
          { id: 'staff', label: 'Staff Configuration', icon: UserCheck },
          { id: 'doctors', label: 'Clinicians Registry', icon: Calendar },
          { id: 'patients', label: 'Patient Registry', icon: ClipboardList },
          { id: 'appointments', label: 'Appointments Calendar', icon: Calendar },
          { id: 'inventory', label: 'Inventory Control', icon: Package },
          { id: 'audit', label: 'System Audit Logs', icon: ShieldAlert },
          { id: 'reports', label: 'Operational Reports', icon: FileText },
          { id: 'settings', label: 'System Settings', icon: Settings },
          ...common
        ];
      case 'Doctor':
        return [
          { id: 'schedules', label: 'My Appointments', icon: Calendar },
          { id: 'patients', label: 'Patient Medical Records', icon: ClipboardList },
          ...common
        ];
      case 'Receptionist':
        return [
          { id: 'registration', label: 'Patient Registry', icon: UserCheck },
          { id: 'appointments', label: 'Manage Appointments', icon: Calendar },
          ...common
        ];
      case 'Pharmacist':
        return [
          { id: 'prescriptions', label: 'Prescriptions Queue', icon: FileText },
          { id: 'inventory', label: 'Pharmacy Inventory', icon: Package },
          ...common
        ];
      case 'Billing Staff':
        return [
          { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
          { id: 'financials', label: 'Financial Reports', icon: FileText },
          ...common
        ];
      default:
        return common;
    }
  };

  const menuLinks = getSidebarLinks();

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar */}
      <aside 
        className={`dashboard-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          width: isSidebarOpen ? '260px' : '0px',
          minWidth: isSidebarOpen ? '260px' : '0px',
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 100,
          borderRight: '1px solid #1e293b',
          position: 'relative'
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={24} style={{ color: '#3b82f6' }} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>SUBHAN CARE</h2>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Hospital Suite</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} style={{ color: isActive ? '#ffffff' : '#64748b' }} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #1e293b', backgroundColor: '#090d16' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{user.username}</h4>
              <span className={`hms-badge ${getRoleBadgeColor(user.role)}`} style={{ fontSize: '0.65rem', padding: '2px 6px', textTransform: 'uppercase' }}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header 
          style={{
            height: '70px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            zIndex: 90
          }}
        >
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#f1f5f9'
              }}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a' }}>
              {menuLinks.find(link => link.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Session Timeout Indicator */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: sessionTimeRemaining < 60 ? '#fef2f2' : '#f0f9ff',
                border: `1px solid ${sessionTimeRemaining < 60 ? '#fca5a5' : '#bae6fd'}`,
                color: sessionTimeRemaining < 60 ? '#ef4444' : '#0369a1',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Clock size={15} style={{ animation: sessionTimeRemaining < 60 ? 'pulse 1s infinite' : 'none' }} />
              <span>Session Out in: {formatTime(sessionTimeRemaining)}</span>
            </div>
            
            {/* Quick User Avatar Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>System Console</p>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Profile</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main 
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.02) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(34, 197, 94, 0.01) 0, transparent 50%)'
          }}
        >
          {children}
        </main>
      </div>
      
      {/* Pulse Animation Style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
