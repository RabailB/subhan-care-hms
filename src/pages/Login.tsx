import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Building, ShieldAlert, LogIn } from 'lucide-react';

interface LoginProps {
  onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onForgotPassword }) => {
  const { login, user } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    // Simulate database lookup/hashing delay
    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed.');
      } else {
        // Handle remember me preference
        if (rememberMe) {
          localStorage.setItem('subhancare_remembered_user', username);
        } else {
          localStorage.removeItem('subhancare_remembered_user');
        }
      }
    }, 1200);
  };

  // Pre-fill remembered username if exists
  React.useEffect(() => {
    const remembered = localStorage.getItem('subhancare_remembered_user');
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  // If user is already logged in, redirect them to the home page (which routes them to their dashboard)
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '16px',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(34, 197, 94, 0.05) 0, transparent 50%)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '420px' }}>
        
        {/* Main login card */}
        <div className="hms-card animate-slide-up" style={{ padding: '36px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
          
          {/* Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#2563eb', color: '#ffffff', margin: '0 auto 16px', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}>
              <Building size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>SUBHAN CARE</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Hospital Management System</p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fca5a5', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Remember Me & Forgot Password links */}
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <label className="flex-center" style={{ gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" loading={loading} style={{ width: '100%' }} icon={<LogIn size={16} />}>
              Sign In to Dashboard
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};
export default Login;
