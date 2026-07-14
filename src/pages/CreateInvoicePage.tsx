import React, { useState, useEffect } from 'react';
import { FilePlus, Save, Users, CreditCard, Activity } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Patient, InvoiceItem } from '../types';
import { Button } from '../components/Button';

export const CreateInvoicePage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [patientId, setPatientId] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [medicineCharges, setMedicineCharges] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  
  const [dynamicItems, setDynamicItems] = useState<InvoiceItem[]>([]);
  
  useEffect(() => {
    setPatients(db.getPatients());
  }, []);

  const totalAmount = consultationFee + medicineCharges + additionalCharges + 
    dynamicItems.reduce((acc, item) => acc + (item.amount * item.quantity), 0);

  const addDynamicItem = () => {
    setDynamicItems([...dynamicItems, { description: '', amount: 0, quantity: 1, type: 'service' }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...dynamicItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setDynamicItems(newItems);
  };

  const removeItem = (index: number) => {
    setDynamicItems(dynamicItems.filter((_, i) => i !== index));
  };

  const handleGenerateInvoice = () => {
    if (!patientId) {
      alert('Please select a patient first.');
      return;
    }

    if (totalAmount <= 0) {
      alert('Invoice total must be greater than 0.');
      return;
    }

    const validItems = dynamicItems.filter(i => i.description && i.amount > 0 && i.quantity > 0);

    const invoice = db.generateInvoice(
      patientId,
      validItems,
      {
        consultation_fee: consultationFee,
        medicine_charges: medicineCharges,
        additional_charges: additionalCharges
      },
      {
        userId: user!.userId,
        username: user!.username,
        role: user!.role
      }
    );

    if (invoice) {
      alert(`Invoice ${invoice.invoice_number} generated successfully!`);
      // Reset form
      setPatientId('');
      setConsultationFee(0);
      setMedicineCharges(0);
      setAdditionalCharges(0);
      setDynamicItems([]);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <FilePlus size={20} className="text-info" />
            Create New Invoice
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Generate a billing invoice for a patient</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleGenerateInvoice}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} /> Generate Invoice
        </Button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} className="text-muted" /> Patient Information
        </h3>
        <div>
          <label className="form-label">Select Patient *</label>
          <select 
            className="input-field" 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.patientId} value={p.patientId}>
                {p.full_name} ({p.patientId})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} className="text-muted" /> Standard Charges
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Consultation Fee (PKR)</label>
            <input 
              type="number" 
              className="input-field" 
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Medicine Charges (PKR)</label>
            <input 
              type="number" 
              className="input-field" 
              value={medicineCharges}
              onChange={(e) => setMedicineCharges(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Additional Charges (PKR)</label>
            <input 
              type="number" 
              className="input-field" 
              value={additionalCharges}
              onChange={(e) => setAdditionalCharges(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilePlus size={18} className="text-muted" /> Custom Line Items
          </h3>
          <Button variant="secondary" onClick={addDynamicItem} style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto' }}>
            + Add Item
          </Button>
        </div>

        {dynamicItems.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>No custom items added. Use standard charges above if sufficient.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {dynamicItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 2 }}>
                  <input 
                    placeholder="Item description" 
                    className="input-field" 
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <select 
                    className="input-field"
                    value={item.type}
                    onChange={(e) => updateItem(index, 'type', e.target.value)}
                  >
                    <option value="service">Service</option>
                    <option value="medicine">Medicine</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div style={{ width: '100px' }}>
                  <input 
                    type="number" 
                    placeholder="Qty" 
                    className="input-field" 
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div style={{ width: '150px' }}>
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    className="input-field" 
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                  />
                </div>
                <button 
                  className="btn-icon" 
                  style={{ color: '#ef4444', alignSelf: 'center', padding: '8px' }}
                  onClick={() => removeItem(index)}
                  title="Remove Item"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#22c55e', padding: '10px', borderRadius: '50%' }}>
            <CreditCard size={24} color="#ffffff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>Total Invoice Amount</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d' }}>Includes all standard charges and custom items</p>
          </div>
        </div>
        <h2 style={{ margin: 0, color: '#166534', fontSize: '1.8rem' }}>Rs {totalAmount.toLocaleString()}</h2>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
