import React, { useState, useEffect } from 'react';
import api from '../api';
const EI = { product_id: '', quantity_mt: '', rate_per_mt: '', supplier_id: '', reference: '' };
const EO = { product_id: '', quantity_mt: '', rate_per_mt: '', reference: '' };
export default function Stock() {
  const [products,  setProducts]  = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [iF, setIF] = useState(EI);
  const [oF, setOF] = useState(EO);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = () =>
    Promise.all([api.get('/products'), api.get('/suppliers'), api.get('/stock/movements')])
      .then(([pr, su, mv]) => { setProducts(pr.data); setSuppliers(su.data); setMovements(mv.data); })
      .catch(() => {});

  useEffect(() => { load(); }, []);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleIn = async e => {
    e.preventDefault();
    try {
      await api.post('/stock/in', {
        product_id:  Number(iF.product_id),
        quantity_mt: Number(iF.quantity_mt),
        rate_per_mt: Number(iF.rate_per_mt),
        supplier_id: iF.supplier_id ? Number(iF.supplier_id) : null,
        reference:   iF.reference
      });
      flash('Stock IN recorded successfully!');
      setIF(EI); load();
    } catch (err) { flash(err.response?.data?.error || 'Error recording Stock IN', 'error'); }
  };

  const handleOut = async e => {
    e.preventDefault();
    try {
      await api.post('/stock/out', {
        product_id:  Number(oF.product_id),
        quantity_mt: Number(oF.quantity_mt),
        rate_per_mt: Number(oF.rate_per_mt),
        reference:   oF.reference
      });
      flash('Stock OUT recorded successfully!');
      setOF(EO); load();
    } catch (err) { flash(err.response?.data?.error || 'Error recording Stock OUT', 'error'); }
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN') : '-';
  const fmtRs   = n => `\u20B9${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const inp = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '13px', marginBottom: '10px' };
  const lbl = { display: 'block', marginBottom: '3px', fontSize: '12px', fontWeight: 600 };
  const th  = { background: '#1a237e', color: '#fff', padding: '10px 12px', textAlign: 'left', fontSize: '12px' };
  const td  = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '12px' };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a237e', marginBottom: '16px' }}>Stock Management</h2>

      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontWeight: 600, fontSize: '14px',
          background: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
          color:      msg.type === 'success' ? '#2e7d32' : '#c62828'
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {/* ── Stock IN ── */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <div style={{ background: '#1b5e20', color: '#fff', padding: '8px 14px', borderRadius: '5px', marginBottom: '14px', fontWeight: 700 }}>
            📥 Stock IN (Purchase)
          </div>
          <form onSubmit={handleIn}>
            <label style={lbl}>Product *</label>
            <select style={inp} value={iF.product_id} required onChange={e => setIF({ ...iF, product_id: e.target.value })}>
              <option value="">-- Select Product --</option>
              {products.map(pr => <option key={pr.id} value={pr.id}>{pr.name} ({pr.current_stock_mt} MT)</option>)}
            </select>
            <label style={lbl}>Quantity (MT) *</label>
            <input style={inp} type="number" step="0.001" min="0.001" required
              value={iF.quantity_mt} onChange={e => setIF({ ...iF, quantity_mt: e.target.value })} placeholder="e.g. 5.000" />
            <label style={lbl}>Rate per MT (₹) *</label>
            <input style={inp} type="number" step="0.01" min="1" required
              value={iF.rate_per_mt} onChange={e => setIF({ ...iF, rate_per_mt: e.target.value })} placeholder="e.g. 55000" />
            <label style={lbl}>Supplier</label>
            <select style={inp} value={iF.supplier_id} onChange={e => setIF({ ...iF, supplier_id: e.target.value })}>
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label style={lbl}>Reference / Challan No.</label>
            <input style={inp} value={iF.reference} onChange={e => setIF({ ...iF, reference: e.target.value })} placeholder="PO / Challan number" />
            <button type="submit" style={{ width: '100%', background: '#1b5e20', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 700 }}>
              ✓ Record Stock IN
            </button>
          </form>
        </div>

        {/* ── Stock OUT ── */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <div style={{ background: '#b71c1c', color: '#fff', padding: '8px 14px', borderRadius: '5px', marginBottom: '14px', fontWeight: 700 }}>
            📤 Stock OUT (Issue / Sale)
          </div>
          <form onSubmit={handleOut}>
            <label style={lbl}>Product *</label>
            <select style={inp} value={oF.product_id} required onChange={e => setOF({ ...oF, product_id: e.target.value })}>
              <option value="">-- Select Product --</option>
              {products.map(pr => <option key={pr.id} value={pr.id}>{pr.name} ({pr.current_stock_mt} MT)</option>)}
            </select>
            <label style={lbl}>Quantity (MT) *</label>
            <input style={inp} type="number" step="0.001" min="0.001" required
              value={oF.quantity_mt} onChange={e => setOF({ ...oF, quantity_mt: e.target.value })} placeholder="e.g. 2.000" />
            <label style={lbl}>Rate per MT (₹) *</label>
            <input style={inp} type="number" step="0.01" min="1" required
              value={oF.rate_per_mt} onChange={e => setOF({ ...oF, rate_per_mt: e.target.value })} placeholder="e.g. 58000" />
            <label style={lbl}>Reference / Invoice No.</label>
            <input style={inp} value={oF.reference} onChange={e => setOF({ ...oF, reference: e.target.value })} placeholder="Invoice / order reference" />
            <button type="submit" style={{ width: '100%', background: '#b71c1c', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 700 }}>
              ✓ Record Stock OUT
            </button>
          </form>
        </div>
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a237e', marginBottom: '10px' }}>Recent Stock Movements</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        <thead>
          <tr>{['Date','Product','Type','Qty (MT)','Rate / MT','Supplier','Reference'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {movements.map(m => (
            <tr key={m.id}>
              <td style={td}>{fmtDate(m.created_at)}</td>
              <td style={td}>{m.product_name}</td>
              <td style={td}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
                  background: m.type === 'IN' ? '#e8f5e9' : '#ffebee',
                  color:      m.type === 'IN' ? '#2e7d32' : '#c62828' }}>
                  {m.type}
                </span>
              </td>
              <td style={td}>{m.quantity_mt} MT</td>
              <td style={td}>{fmtRs(m.rate_per_mt)}</td>
              <td style={td}>{m.supplier_name || '-'}</td>
              <td style={td}>{m.reference || '-'}</td>
            </tr>
          ))}
          {movements.length === 0 && (
            <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#999', padding: '24px' }}>
              No stock movements yet. Record a Stock IN or OUT above.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
