import React, { useEffect, useState } from 'react';
import api from '../api';

const todayStr     = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export default function Reports() {
  const [tab,       setTab]       = useState('ds');
  const [date,      setDate]      = useState(todayStr());
  const [from,      setFrom]      = useState(firstOfMonth());
  const [to,        setTo]        = useState(todayStr());
  const [sid,       setSid]       = useState('');
  const [data,      setData]      = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    api.get('/suppliers').then(r => setSuppliers(r.data)).catch(() => {});
  }, []);

  const doFetch = async () => {
    setLoading(true); setData(null);
    try {
      let url = '';
      if      (tab === 'ds') url = `/reports/daily-sales?date=${date}`;
      else if (tab === 'sm') url = `/reports/stock-movement?from=${from}&to=${to}`;
      else if (tab === 'pl') url = `/reports/profit-loss?from=${from}&to=${to}`;
      else if (tab === 'sw') url = `/reports/supplier-wise?from=${from}&to=${to}${sid ? '&supplier_id=' + sid : ''}`;
      const r = await api.get(url);
      setData(r.data);
    } catch { alert('Error fetching report. Make sure the backend is running.'); }
    finally { setLoading(false); }
  };

  const fmtRs   = n => `\u20B9${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN') : '-';

  const TABS = [
    { id: 'ds', label: 'Daily Sales'    },
    { id: 'sm', label: 'Stock Movement' },
    { id: 'pl', label: 'Profit & Loss'  },
    { id: 'sw', label: 'Supplier-wise'  },
  ];

  const tabBtn = active => ({
    padding: '9px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
    background: active ? '#1a237e' : '#e8eaf6',
    color:      active ? '#fff'     : '#1a237e',
  });

  const inpS = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '13px' };
  const th   = { background: '#1a237e', color: '#fff', padding: '10px 12px', textAlign: 'left', fontSize: '12px' };
  const td   = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' };
  const tbl  = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginTop: '16px' };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a237e', marginBottom: '20px' }}>Reports</h2>

      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn(tab === t.id)} onClick={() => { setTab(t.id); setData(null); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Panel */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
        {tab === 'ds' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 600, fontSize: '13px' }}>Date:</label>
            <input type="date" style={inpS} value={date} onChange={e => setDate(e.target.value)} />
            <button onClick={doFetch} disabled={loading} style={{ ...tabBtn(true), padding: '8px 28px' }}>
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
        )}
        {(tab === 'sm' || tab === 'pl') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 600, fontSize: '13px' }}>From:</label>
            <input type="date" style={inpS} value={from} onChange={e => setFrom(e.target.value)} />
            <label style={{ fontWeight: 600, fontSize: '13px' }}>To:</label>
            <input type="date" style={inpS} value={to} onChange={e => setTo(e.target.value)} />
            <button onClick={doFetch} disabled={loading} style={{ ...tabBtn(true), padding: '8px 28px' }}>
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
        )}
        {tab === 'sw' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 600, fontSize: '13px' }}>From:</label>
            <input type="date" style={inpS} value={from} onChange={e => setFrom(e.target.value)} />
            <label style={{ fontWeight: 600, fontSize: '13px' }}>To:</label>
            <input type="date" style={inpS} value={to} onChange={e => setTo(e.target.value)} />
            <label style={{ fontWeight: 600, fontSize: '13px' }}>Supplier:</label>
            <select style={inpS} value={sid} onChange={e => setSid(e.target.value)}>
              <option value="">All Suppliers</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={doFetch} disabled={loading} style={{ ...tabBtn(true), padding: '8px 28px' }}>
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
        )}
      </div>

      {/* ── Daily Sales Results ── */}
      {data && tab === 'ds' && (
        <div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: '#2e7d32', color: '#fff', borderRadius: '8px', padding: '20px', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '6px' }}>Total Revenue</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>{fmtRs(data.total_revenue)}</div>
            </div>
            <div style={{ background: '#e65100', color: '#fff', borderRadius: '8px', padding: '20px', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '6px' }}>Invoice Count</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>{data.count}</div>
            </div>
          </div>
          <table style={tbl}>
            <thead><tr>{['Invoice No','Customer','Subtotal','GST','Total'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ ...td, fontWeight: 700, color: '#1a237e' }}>{inv.invoice_number}</td>
                  <td style={td}>{inv.customer_name}</td>
                  <td style={td}>{fmtRs(inv.subtotal)}</td>
                  <td style={td}>{fmtRs(inv.gst_amount)}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{fmtRs(inv.total_amount)}</td>
                </tr>
              ))}
              {data.invoices.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#999' }}>No sales on this date</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Stock Movement Results ── */}
      {data && tab === 'sm' && (
        <table style={tbl}>
          <thead><tr>{['Date','Product','Type','Qty (MT)','Rate/MT','Supplier','Reference'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {data.map(m => (
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
            {data.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#999' }}>No movements in this date range</td></tr>}
          </tbody>
        </table>
      )}

      {/* ── Profit & Loss Results ── */}
      {data && tab === 'pl' && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total Purchase Cost', value: fmtRs(data.total_purchase_cost), bg: '#1565c0' },
            { label: 'Total Revenue',       value: fmtRs(data.total_revenue),       bg: '#2e7d32' },
            { label: 'Gross Profit',        value: fmtRs(data.gross_profit),
              bg: data.gross_profit >= 0 ? '#2e7d32' : '#c62828' },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, background: c.bg, color: '#fff', borderRadius: '10px', padding: '28px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '8px' }}>{c.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Supplier-wise Results ── */}
      {data && tab === 'sw' && (
        <table style={tbl}>
          <thead><tr>{['Supplier','Product','Total Qty (MT)','Total Value'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.supplier_name}</td>
                <td style={td}>{r.product_name}</td>
                <td style={td}>{Number(r.total_qty_mt).toFixed(3)} MT</td>
                <td style={{ ...td, fontWeight: 600 }}>{fmtRs(r.total_value)}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: '#999' }}>No supplier data in this range</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
