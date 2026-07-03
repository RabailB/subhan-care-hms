import React from 'react';
import { Card } from '../components/Card';
import { Package, ClipboardList, ExclamationTriangleIcon } from 'lucide-react';

export const PharmacistDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Pharmacist Workspace - Medicine Inventory" subtitle="Dispense prescriptions and monitor batch stocks">
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <Package size={48} style={{ color: '#d97706', marginBottom: '16px' }} />
          <h3>Welcome to Pharmacy Dispensing Console</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Pharmacist workflows (Stock management, low-stock/nearing-expiry alerts, and prescription fulfillment) will be active in Sprint Days 7-9.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default PharmacistDashboard;
