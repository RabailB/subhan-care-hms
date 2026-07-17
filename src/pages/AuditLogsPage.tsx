import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { ShieldAlert, Search } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.affectedRecordId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModule = filterModule === 'All' || log.affectedTable === filterModule;

      return matchesSearch && matchesModule;
    });
  }, [auditLogs, searchTerm, filterModule]);

  // Extract unique modules for the filter dropdown
  const uniqueModules = ['All', ...Array.from(new Set(auditLogs.map(log => log.affectedTable).filter(Boolean)))];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px' }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>System Audit Logs</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Tamper-evident record of all system activities.</p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search logs by user, action, or record ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <div style={{ width: '250px' }}>
            <select 
              className="form-input"
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
            >
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module === 'All' ? 'All Modules' : module}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <table className="hms-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8fafc' }}>
              <tr>
                <th>Timestamp</th>
                <th>User / Role</th>
                <th>Action Performed</th>
                <th>Module / Table</th>
                <th>Record ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.logId}>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.username}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{log.role}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: '#334155' }}>
                    {log.action}
                  </td>
                  <td>
                    <span style={{ 
                      padding: '2px 8px', 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      color: '#475569' 
                    }}>
                      {log.affectedTable || 'System'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                    {log.affectedRecordId || 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
