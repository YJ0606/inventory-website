import React, { useEffect, useState } from 'react';
import api from '../api';
const EMPTY  = { name: '', grade: 'Fe415', length_ft: 40, weight_per_mt: 1000, min_stock_mt: 1 };
const GRADES = ['Fe415','Fe500','Fe500D','Fe550','Fe550D','Fe600'];
export default function Products() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('tmt_user') || '{}');
  const isAdmin = user.role === 'admin';
  const load = () => api.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);
  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(''); setModal(true); };
  const openEdit = p => { setForm({ name:p.name, grade:p.grade, length_ft:p.length_ft, weight_per_mt:p.weight_per_mt, min_stock_mt:p.min_stock_mt }); setEditId(p.id); setError(''); setModal(true); };
  const handleSave = async e => {
    e.preventDefault(); setError('');
    try { if (editId) await api.put(`/products/${editId}`, form); else await api.post('/products', form); load(); setModal(false); }
    catch (err) { setError(err.response?.data?.error || 'Error saving product'); }
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); load(); } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '12px' };
  const th  = { background: '#1a237e', color: '#fff', padding: '11px 14px', textAlign: 'left', fontSize: '13px' };
  const td  = { padding: '10px 14px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a237e' }}>Products</h2>
        {isAdmin && <button onClick={openAdd} style={{ background: '#1a237e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Product</button>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <thead><tr>{['#','Name','Grade','Length (ft)','Weight/MT (kg)','Stock (MT)','Min Stock','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id}>
              <td style={td}>{i+1}</td><td style={td}>{p.name}</td><td style={td}>{p.grade}</td>
              <td style={td}>{p.length_ft} ft</td><td style={td}>{p.weight_per_mt} kg</td>
              <td style={td}><span style={{ color: p.current_stock_mt < p.min_stock_mt ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{p.current_stock_mt} MT</span>{p.current_stock_mt < p.min_stock_mt && <span style={{ background: '#ffebee', color: '#c62828', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, marginLeft: '5px' }}>LOW</span>}</td>
              <td style={td}>{p.min_stock_mt} MT</td>
              <td style={td}>
                <button onClick={() => openEdit(p)} style={{ background: '#1565c0', color: '#fff', border: 'none', padding: '5px 11px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>Edit</button>
                {isAdmin && <button onClick={() => handleDelete(p.id)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '5px 11px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>}
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#999' }}>No products found</td></tr>}
        </tbody>
      </table>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '32px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a237e', marginBottom: '20px' }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
            {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: '4px', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
            <form onSubmit={handleSave}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Product Name *</label>
              <input style={inp} value={form.name} required onChange={e => setForm({...form, name: e.target.value})} />
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Grade *</label>
              <select style={inp} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>{GRADES.map(g => <option key={g}>{g}</option>)}</select>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Length (ft)</label><input style={inp} type="number" value={form.length_ft} onChange={e => setForm({...form, length_ft: e.target.value})} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Weight/MT (kg)</label><input style={inp} type="number" value={form.weight_per_mt} onChange={e => setForm({...form, weight_per_mt: e.target.value})} /></div>
              </div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Min Stock (MT)</label>
              <input style={inp} type="number" step="0.1" value={form.min_stock_mt} onChange={e => setForm({...form, min_stock_mt: e.target.value})} />
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
