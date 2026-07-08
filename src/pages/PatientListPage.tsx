import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Search, UserPlus, Eye, Users, FileSpreadsheet } from 'lucide-react';
import { Patient } from '../types';

export const PatientListPage: React.FC = () => {
  const { patients } = useDatabase();
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter logic
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = 
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cnic.includes(searchTerm) ||
        patient.patient_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All' || 
        patient.status === statusFilter;

      return matchesSearch && matchesStatus && patient.is_active;
    });
  }, [patients, searchTerm, statusFilter]);

  // Pagination calculations
  const totalRecords = filteredPatients.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedPatients = useMemo(() => {
    return filteredPatients.slice(startIndex, endIndex);
  }, [filteredPatients, startIndex, endIndex]);

  // Handle page change safely
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Patient Registry</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Search, filter, and manage hospital patient database folders</p>
        </div>
        <Button onClick={() => navigate('/patients/new')} icon={<UserPlus size={16} />}>
          Register New Patient
        </Button>
      </div>

      {/* Search & Filter bar Card */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search by Name, CNIC, or Patient Code (e.g. SC-PAT-00001)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              icon={<Search size={18} style={{ color: '#64748b' }} />}
              style={{ margin: 0 }}
            />
          </div>
          
          <div style={{ width: '180px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status State</label>
              <select 
                className="form-input" 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              >
                <option value="All">All Patients</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table view */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {totalRecords === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <Users size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No Patient Folders Found</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', maxWidth: '360px', margin: '4px auto 0' }}>
                There are no patient records that match your search filters or the database is currently empty.
              </p>
            </div>
            <Button onClick={() => navigate('/patients/new')} icon={<UserPlus size={16} />} style={{ height: '36px', marginTop: '8px' }}>
              Register Patient Folder
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="hms-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Patient Code</th>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Full Name</th>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>CNIC Number</th>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Contact</th>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Blood Group</th>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                    <th scope="col" style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onDoubleClick={() => navigate(`/patients/${patient.patientId}`)}
                      className="table-row-hover"
                      style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', height: '52px' }}
                    >
                      <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                        {patient.patient_code}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>
                        {patient.full_name}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                        {patient.cnic}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569' }}>
                        {patient.contact_number}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                        {patient.blood_group}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span className={`hms-badge ${patient.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <Button 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.patientId}`); }}
                          icon={<Eye size={15} />}
                          style={{ padding: '6px 10px', height: '30px' }}
                        >
                          View Folder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Show</span>
                <select 
                  className="form-input" 
                  style={{ width: '70px', height: '32px', padding: '0 8px', fontSize: '0.8rem' }}
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>records per page</span>
                <span style={{ marginLeft: '12px' }}>Showing {totalRecords === 0 ? 0 : startIndex + 1}–{endIndex} of {totalRecords} records</span>
              </div>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{ height: '32px', padding: '0 12px', fontSize: '0.8rem' }}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    style={{
                      height: '32px',
                      width: '32px',
                      borderRadius: '6px',
                      border: p === currentPage ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: p === currentPage ? '#2563eb' : 'transparent',
                      color: p === currentPage ? '#ffffff' : '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: p === currentPage ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {p}
                  </button>
                ))}
                <Button 
                  variant="outline" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{ height: '32px', padding: '0 12px', fontSize: '0.8rem' }}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientListPage;
