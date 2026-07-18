import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ShieldCheck, Mail, Key, CheckCircle, ArrowLeft, Send } from 'lucide-react';

type Step = 'request' | 'otp' | 'reset' | 'success';

export const ForgotPassword: React.FC = () => {
  const { resetPassword, user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('request');
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Errors and loaders
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Step 1: Submit email & contact to generate OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !contactNumber) {
      setError('Please fill in all details.');
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Mock generate 4 digit OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  // Step 2: Validate simulated OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode !== generatedOtp) {
      setError('Incorrect verification code. Please try again.');
      return;
    }

    setStep('reset');
  };

  // Step 3: Enforce password complexity (SR-08)
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Complexity checks (at least one number, special character, uppercase and lowercase)
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);

    if (!hasNumber || !hasSpecial || !hasUpper || !hasLower) {
      setError('Password must contain uppercase and lowercase letters, a number, and a special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Call Context password reset which verifies linked accounts
    setTimeout(() => {
      const res = resetPassword(username, contactNumber, newPassword);
      setLoading(false);
      if (res.success) {
        setStep('success');
      } else {
        setError(res.error || 'Password reset failed.');
      }
    }, 1200);
  };

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
      <div className="hms-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Step 1: Request Screen */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="animate-slide-up">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', margin: '0 auto 16px' }}>
                <Key size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Forgot Password?</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>Verify your account username and contact details to receive a recovery code.</p>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <Input
              label="Username"
              placeholder="e.g. doctor, receptionist"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Registered Contact Number"
              placeholder="e.g. +92 300 1234567"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              helperText="Must match profile contact details"
              required
            />

            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '8px' }} icon={<Send size={16} />}>
              Send Verification Code
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                color: '#475569',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Screen */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="animate-slide-up">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', margin: '0 auto 16px' }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Enter Verification Code</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>We sent a mock SMS recovery code. For demonstration purposes, enter the code shown below.</p>
              <div style={{ display: 'inline-block', backgroundColor: '#f0fdf4', border: '1px dashed #22c55e', color: '#16a34a', padding: '6px 14px', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, marginTop: '12px', letterSpacing: '2px' }}>
                {generatedOtp}
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <Input
              label="4-Digit Code"
              type="text"
              maxLength={4}
              placeholder="0 0 0 0"
              style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '8px' }}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              required
            />

            <Button type="submit" style={{ width: '100%', marginTop: '8px' }}>
              Verify & Proceed
            </Button>

            <button
              type="button"
              onClick={() => setStep('request')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                color: '#475569',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              Request New Code
            </button>
          </form>
        )}

        {/* Step 3: Password Reset Screen */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="animate-slide-up">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', margin: '0 auto 16px' }}>
                <Key size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Reset Password</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>Choose a secure password complying with hospital complexity policies.</p>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Min. 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
              Update Password
            </Button>
          </form>
        )}

        {/* Step 4: Success Screen */}
        {step === 'success' && (
          <div className="animate-slide-up" style={{ textAlign: 'center' }}>
            <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', margin: '0 auto 20px' }}>
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Password Reset Complete</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>
              Your account password has been updated successfully. You can now log in using your new credentials.
            </p>

            <Button onClick={() => navigate('/login')} style={{ width: '100%' }}>
              Sign In Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
