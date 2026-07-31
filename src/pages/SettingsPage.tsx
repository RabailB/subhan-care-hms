import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Settings, Save, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { systemSettings, dbOps } = useDatabase();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    hospital_name: '',
    hospital_address: '',
    hospital_phone: '',
    default_tax_rate: 0,
    default_consultation_fee: 0
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (systemSettings) {
      setFormData(systemSettings);
    }
  }, [systemSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const res = await dbOps.updateSystemSettings(formData, {
        userId: user.userId,
        username: user.username,
        role: user.role
      });

      if (res.success) {
        setMessage({ text: 'System settings updated successfully.', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: 'Failed to update settings.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to update settings.', type: 'error' });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!systemSettings) return <div>Loading settings...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '8px' }}>
          <Settings size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>System Configuration</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage global hospital details and operational rules.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {message.text && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#166534' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{message.text}</span>
            </div>
          )}

          <div style={{ paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Hospital Identity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <Input
                label="Hospital Name"
                value={formData.hospital_name}
                onChange={(e) => handleChange('hospital_name', e.target.value)}
                required
              />
              <Input
                label="Primary Contact Number"
                value={formData.hospital_phone}
                onChange={(e) => handleChange('hospital_phone', e.target.value)}
                required
              />
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.hospital_address}
                  onChange={(e) => handleChange('hospital_address', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Financial Rules</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Input
                type="number"
                label="Default Tax Rate (%)"
                min="0"
                max="100"
                step="0.1"
                value={formData.default_tax_rate}
                onChange={(e) => handleChange('default_tax_rate', parseFloat(e.target.value))}
                required
              />
              <Input
                type="number"
                label="Base Consultation Fee (Rs.)"
                min="0"
                value={formData.default_consultation_fee}
                onChange={(e) => handleChange('default_consultation_fee', parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="submit" icon={<Save size={16} />}>
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
