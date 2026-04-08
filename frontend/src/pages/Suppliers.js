import React, { useEffect, useState } from 'react';
import api from '../api';
const EMPTY = { name: '', contact: '', address: '', gstin: '' };
export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [error,     setError]     = useState('');
  const user    = JSON.parse(localStorage.getItem('tmt_user') || '{}');
  const isAdmin = user.role === 'admin';

  const load = () => api.get('/suppliers').then(r => setSuppliers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setError(''); setModal(true); };
  const openEdit = s  => {
    setForm({ name: s.name, contact: s.contact || '', address: s.address || '', gstin: s.gstin || '' });
    setEditId(s.id); setError(''); setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault(); setError('');
    try {
      if (editId) await api.put(`/suppliers/${editId}`, form);
      else        await api.post('/suppliers', form);
      load(); setModal(false);
    } catch (err) { setError(err.response?.data?.error || 'Error saving supplier'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this supplier?')) return;
    try { await api.delete(`/suppliers/${id}`); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '12px' };
  const th  = { background: '#1a237e', color: '#fff', padding: '11px 14px', textAlign: 'left', fontSize: '13px' };
  const td  = { padding: '10px 14px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a237e' }}>Suppliers</h2>
        <button onClick={openAdd} style={{ background: '#1a237e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          + Add Supplier
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <thead>
          <tr>{['#','Name','Contact','Address','GSTIN','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {suppliers.map((s, i) => (
            <tr key={s.id}>
              <td style={td}>{i + 1}</td>
              <td style={td}><b>{s.name}</b></td>
              <td style={td}>{s.contact || '-'}</td>
              <td style={td}>{s.address || '-'}</td>
              <td style={td}>{s.gstin   || '-'}</td>
              <td style={td}>
                <button onClick={() => openEdit(s)} style={{ background: '#1565c0', color: '#fff', border: 'none', padding: '5px 11px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>Edit</button>
                {isAdmin && (
                  <button onClick={() => handleDelete(s.id)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '5px 11px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
          {suppliers.length === 0 && (
            <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#999' }}>No suppliers found. Click "+ Add Supplier" to get started.</td></tr>
          )}
        </tbody>
      </table>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '32px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a237e', marginBottom: '20px' }}>
              {editId ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: '4px', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
            <form onSubmit={handleSave}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Supplier Name *</label>
              <input style={inp} value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Company name" />
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Contact Number</label>
              <input style={inp} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Mobile / Phone" />
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Address</label>
              <input style={inp} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>GSTIN</label>
              <input style={inp} value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} placeholder="27XXXXX1234A1Z5" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" style={{ background: '#1a237e', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Save</button>
                <button type="button" onClick={() => setModal(false)} style={{ background: '#eee', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
