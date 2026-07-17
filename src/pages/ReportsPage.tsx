import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/Card';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { invoices, patients, inventory } = useDatabase();
  const [dateRange, setDateRange] = useState('month'); // 'today', 'week', 'month', 'all'

  // Filter invoices based on date range
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter(inv => {
      if (dateRange === 'all') return true;
      const invDate = new Date(inv.timestamp);
      if (dateRange === 'today') return invDate.toDateString() === now.toDateString();
      if (dateRange === 'week') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invDate >= lastWeek;
      }
      if (dateRange === 'month') {
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [invoices, dateRange]);

  const totalRevenue = filteredInvoices
    .filter(i => i.payment_status === 'Paid' || i.payment_status === 'Partially Paid')
    .reduce((sum, i) => sum + i.amount_paid, 0);

  const outstandingBalance = filteredInvoices
    .reduce((sum, i) => sum + i.outstanding_balance, 0);

  // Group revenue by day for simple bar chart
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    filteredInvoices.forEach(inv => {
      const day = new Date(inv.timestamp).toLocaleDateString();
      const current = map.get(day) || 0;
      map.set(day, current + inv.amount_paid);
    });
    return Array.from(map.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [filteredInvoices]);

  const maxRevenue = Math.max(...revenueByDay.map(r => r[1]), 1); // Avoid division by zero

  // Pharmacy stock analysis
  const topSellingMedicines = useMemo(() => {
    const medCounts = new Map<string, number>();
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.type === 'medicine') {
          const current = medCounts.get(item.description) || 0;
          medCounts.set(item.description, current + item.quantity);
        }
      });
    });
    return Array.from(medCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredInvoices]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '8px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Analytics & Reports</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Financial and operational performance insights.</p>
          </div>
        </div>
        
        <div>
          <select 
            className="form-input" 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <Card className="flex-between">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Collected Revenue</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
              Rs. {totalRevenue.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
        </Card>

        <Card className="flex-between">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Outstanding Balance</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>
              Rs. {outstandingBalance.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
        </Card>

        <Card className="flex-between">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Patients Registered</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>
              {patients.length}
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        <Card title="Revenue Trend" subtitle="Daily collected revenue based on invoices">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '250px', marginTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
            {revenueByDay.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No revenue data for this period.</div>
            ) : (
              revenueByDay.map(([date, amount], i) => {
                const heightPercent = (amount / maxRevenue) * 100;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '40px' }}>
                    <div style={{ 
                      height: `${Math.max(heightPercent, 5)}%`, 
                      width: '30px', 
                      backgroundColor: '#3b82f6', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }} title={`Rs. ${amount.toLocaleString()}`} />
                    <span style={{ fontSize: '0.7rem', color: '#64748b', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                      {date.substring(0, 5)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card title="Top Selling Medicines" subtitle="By dispensed quantity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {topSellingMedicines.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>No medicines sold.</div>
            ) : (
              topSellingMedicines.map(([name, qty], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                      #{i + 1}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>{name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>{qty} units</span>
                </div>
              ))
            )}
          </div>
        </Card>
        
      </div>
    </div>
  );
};

export default ReportsPage;
