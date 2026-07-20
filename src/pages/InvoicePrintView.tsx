import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Invoice, Patient } from '../types';

export const InvoicePrintView: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (invoiceId) {
      const invs = db.getInvoices();
      const inv = invs.find(i => i.invoice_number === invoiceId);
      if (inv) {
        setInvoice(inv);
        const pats = db.getPatients();
        const pat = pats.find(p => p.patientId === inv.patientId);
        if (pat) setPatient(pat);
      }
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && patient) {
      // Small delay to ensure styles apply before print dialog
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [invoice, patient]);

  if (!invoice || !patient) return <div style={{ padding: '20px' }}>Loading invoice...</div>;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '40px', color: '#000', fontFamily: 'Arial, sans-serif' }}>
      {/* Print styles block directly in component to ensure it prints well */}
      <style>
        {`
          @media print {
            body { background: #fff; margin: 0; padding: 0; }
            @page { margin: 1cm; }
          }
        `}
      </style>

      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', padding: '40px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#2563eb', fontSize: '24px' }}>Subhan Care Hospital</h1>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>123 Health Avenue, Medical District<br/>Phone: +92 300 1234567</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#333' }}>INVOICE</h2>
            <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>No:</strong> {invoice.invoice_number}</p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Date:</strong> {new Date(invoice.timestamp).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#555' }}>Billed To:</h3>
            <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: 'bold' }}>{patient.full_name}</p>
            <p style={{ margin: '2px 0', fontSize: '14px' }}>Patient ID: {patient.patientId}</p>
            <p style={{ margin: '2px 0', fontSize: '14px' }}>Phone: {patient.contact_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#555' }}>Payment Status:</h3>
            <p style={{ margin: '2px 0', fontSize: '16px', fontWeight: 'bold', color: invoice.payment_status === 'Paid' ? '#10b981' : '#ef4444' }}>
              {invoice.payment_status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.consultation_fee > 0 && (
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Consultation Fee</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Fixed</td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{invoice.consultation_fee.toLocaleString()}</td>
              </tr>
            )}
            {invoice.medicine_charges > 0 && (
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Medicine Charges</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Fixed</td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{invoice.medicine_charges.toLocaleString()}</td>
              </tr>
            )}
            {invoice.additional_charges > 0 && (
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Additional Charges</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Fixed</td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{invoice.additional_charges.toLocaleString()}</td>
              </tr>
            )}
            {invoice.items && invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {item.description} {item.quantity > 1 && `(x${item.quantity})`}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee', textTransform: 'capitalize' }}>{item.type}</td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{(item.amount * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>Subtotal:</strong>
              <span>Rs {invoice.total_amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>Amount Paid:</strong>
              <span>Rs {invoice.amount_paid.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #333', marginTop: '8px' }}>
              <strong style={{ fontSize: '18px' }}>Balance Due:</strong>
              <strong style={{ fontSize: '18px', color: '#ef4444' }}>Rs {invoice.outstanding_balance.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '60px', textAlign: 'center', color: '#777', fontSize: '12px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>Thank you for choosing Subhan Care Hospital.</p>
        </div>
      </div>
    </div>
  );
};
export default InvoicePrintView;
