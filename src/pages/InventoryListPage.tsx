import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertCircle, Edit, Search } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { InventoryItem } from '../types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export const InventoryListPage: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    setInventory(db.getInventory());
  };

  const handleSaveItem = () => {
    if (!editingItem?.name || editingItem.quantity_in_stock === undefined || editingItem.reorder_threshold === undefined) {
      alert('Please fill in required fields: Name, Quantity, Threshold');
      return;
    }

    const res = db.addOrUpdateStock(editingItem as Omit<InventoryItem, 'id'>, {
      userId: user!.userId,
      username: user!.username,
      role: user!.role
    });

    if (res.success) {
      setIsModalOpen(false);
      setEditingItem(null);
      loadInventory();
    } else {
      alert(res.error);
    }
  };

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.batch_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <Package size={20} className="text-primary" />
            Pharmacy Inventory
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Manage medicines and track stock levels</p>
        </div>
        <Button 
          onClick={() => { setEditingItem({ quantity_in_stock: 0, reorder_threshold: 10, unit: 'Tablet', unit_cost: 0, is_active: true }); setIsModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Stock Item
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by medicine name or batch..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="hms-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Batch / Unit</th>
              <th>Unit Cost (PKR)</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No inventory items found.</td>
              </tr>
            ) : (
              filteredInventory.map(item => {
                const isLowStock = item.quantity_in_stock <= item.reorder_threshold;
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{item.batch_number}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.unit}</div>
                    </td>
                    <td>Rs {item.unit_cost.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600 }}>{item.quantity_in_stock}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>/ {item.reorder_threshold} (min)</span>
                      </div>
                    </td>
                    <td>
                      {isLowStock ? (
                        <span className="hms-badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                          <AlertCircle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="hms-badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>{item.expiry_date}</td>
                    <td>
                      <button 
                        className="btn-icon" 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem?.id ? 'Update Stock Item' : 'Add New Item'}
        primaryActionLabel="Save Item"
        onPrimaryAction={handleSaveItem}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label className="form-label">Medicine Name *</label>
            <input 
              className="input-field" 
              value={editingItem?.name || ''} 
              onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Batch Number</label>
              <input 
                className="input-field" 
                value={editingItem?.batch_number || ''} 
                onChange={e => setEditingItem({...editingItem, batch_number: e.target.value})} 
              />
            </div>
            <div>
              <label className="form-label">Unit Type</label>
              <select 
                className="input-field" 
                value={editingItem?.unit || 'Tablet'} 
                onChange={e => setEditingItem({...editingItem, unit: e.target.value as InventoryItem['unit']})}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Vial">Vial</option>
                <option value="Box">Box</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Quantity *</label>
              <input 
                type="number" 
                className="input-field" 
                value={editingItem?.quantity_in_stock || 0} 
                onChange={e => setEditingItem({...editingItem, quantity_in_stock: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="form-label">Reorder Min *</label>
              <input 
                type="number" 
                className="input-field" 
                value={editingItem?.reorder_threshold || 10} 
                onChange={e => setEditingItem({...editingItem, reorder_threshold: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="form-label">Cost (PKR)</label>
              <input 
                type="number" 
                className="input-field" 
                value={editingItem?.unit_cost || 0} 
                onChange={e => setEditingItem({...editingItem, unit_cost: Number(e.target.value)})} 
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Expiry Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={editingItem?.expiry_date || ''} 
                onChange={e => setEditingItem({...editingItem, expiry_date: e.target.value})} 
              />
            </div>
            <div>
              <label className="form-label">Supplier ID</label>
              <input 
                className="input-field" 
                value={editingItem?.supplierId || ''} 
                onChange={e => setEditingItem({...editingItem, supplierId: e.target.value})} 
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryListPage;
