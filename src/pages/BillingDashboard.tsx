import React from 'react';
import { Card } from '../components/Card';
import { CreditCard, FileText } from 'lucide-react';

export const BillingDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card title="Billing Workspace - Cashier Terminal" subtitle="Generate invoices and process payment receipts">
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <CreditCard size={48} style={{ color: '#2563eb', marginBottom: '16px' }} />
          <h3>Welcome to Billing & Invoicing Terminal</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Billing workflows (Itemized charges generator, cash/card updates, credit note corrections, and PDF receipt downloads) will be active in Sprint Days 7-9.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default BillingDashboard;
