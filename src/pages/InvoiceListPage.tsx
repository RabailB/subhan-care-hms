import React, { useState, useEffect } from 'react';
import { CreditCard, Search, FileText, CheckCircle, Clock, AlertTriangle, Plus, Printer } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Invoice, Patient } from '../types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export const InvoiceListPage: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Invoice['payment_method']>('Cash');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(db.getInvoices().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setPatients(db.getPatients());
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    if (paymentAmount > selectedInvoice.outstanding_balance) {
      alert(`Payment cannot exceed outstanding balance of Rs ${selectedInvoice.outstanding_balance}`);
      return;
    }

    const res = db.processPayment(selectedInvoice.invoice_number, paymentAmount, paymentMethod, {
      userId: user!.userId,
      username: user!.username,
      role: user!.role
    });

    if (res.success) {
      setPaymentModalOpen(false);
      setSelectedInvoice(null);
      loadData();
    } else {
      alert(res.error);
    }
  };

  const getPatientName = (id: string) => patients.find(p => p.patientId === id)?.full_name || id;

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
    getPatientName(inv.patientId).toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: Invoice['payment_status']) => {
    switch(status) {
      case 'Paid': return <span className="hms-badge badge-success"><CheckCircle size={12} style={{marginRight:'4px'}}/> Paid</span>;
      case 'Partially Paid': return <span className="hms-badge badge-warning"><Clock size={12} style={{marginRight:'4px'}}/> Partially Paid</span>;
      case 'Unpaid': return <span className="hms-badge badge-danger"><AlertTriangle size={12} style={{marginRight:'4px'}}/> Unpaid</span>;
      default: return <span className="hms-badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <FileText size={20} className="text-info" />
            Billing & Invoices
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Manage patient invoices and payments</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => window.location.pathname = '/billing/new'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Create Invoice
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Invoice # or Patient Name..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Total Amount (PKR)</th>
              <th>Balance Due (PKR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No invoices found.</td>
              </tr>
            ) : (
              filteredInvoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{inv.invoice_number}</td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(inv.timestamp).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{getPatientName(inv.patientId)}</td>
                  <td>Rs {inv.total_amount.toLocaleString()}</td>
                  <td style={{ color: inv.outstanding_balance > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    Rs {inv.outstanding_balance.toLocaleString()}
                  </td>
                  <td>{getStatusBadge(inv.payment_status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button 
                        variant="secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto', backgroundColor: '#e2e8f0', color: '#334155', border: 'none' }}
                        onClick={() => window.open(`/invoice/print/${inv.invoice_number}`, '_blank')}
                      >
                        <Printer size={14} style={{ marginRight: '4px' }} /> PDF
                      </Button>
                      {inv.payment_status !== 'Paid' && (
                        <Button 
                          variant="success" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto' }}
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(inv.outstanding_balance);
                            setPaymentMethod('Cash');
                            setPaymentModalOpen(true);
                          }}
                        >
                          <CreditCard size={14} style={{ marginRight: '4px' }} /> Pay
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setSelectedInvoice(null); }}
        title="Record Payment"
        primaryActionLabel="Process Payment"
        primaryActionVariant="success"
        onPrimaryAction={handleRecordPayment}
      >
        {selectedInvoice && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-muted">Invoice:</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.invoice_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-muted">Patient:</span>
                <span style={{ fontWeight: 600 }}>{getPatientName(selectedInvoice.patientId)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Balance Due:</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '1.1rem' }}>Rs {selectedInvoice.outstanding_balance.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="form-label">Payment Amount (PKR) *</label>
              <input 
                type="number" 
                className="input-field" 
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                max={selectedInvoice.outstanding_balance}
                min={1}
              />
            </div>
            
            <div>
              <label className="form-label">Payment Method *</label>
              <select 
                className="input-field" 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceListPage;
