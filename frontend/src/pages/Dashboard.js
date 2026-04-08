import React, { useEffect, useState } from 'react';
import api from '../api';
export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [sales,   setSales]   = useState({ total_revenue: 0, count: 0 });
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    api.get('/stock/summary').then(r => setSummary(r.data)).catch(() => {});
    api.get(`/reports/daily-sales?date=${today}`).then(r => setSales(r.data)).catch(() => {});
  }, []);
  const totalStock = summary.reduce((s, p) => s + p.current_stock_mt, 0);
  const lowItems   = summary.filter(p => p.low_stock);
  const fmt = n => `\u20B9${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const cards = [
    { label: 'Total Products',   value: summary.length,               bg: '#1565c0', icon: '\uD83D\uDCE6' },
    { label: 'Total Stock (MT)', value: totalStock.toFixed(2) + ' MT', bg: '#2e7d32', icon: '\uD83D\uDCCA' },
    { label: "Today's Revenue",  value: fmt(sales.total_revenue),      bg: '#e65100', icon: '\uD83D\uDCB0' },
    { label: 'Low Stock Alerts', value: lowItems.length,               bg: '#c62828', icon: '\u26A0\uFE0F'  },
  ];
  const th = { background: '#c62828', color: '#fff', padding: '10px 14px', textAlign: 'left', fontSize: '13px' };
  const td = { padding: '10px 14px', borderBottom: '1px solid #f5f5f5', fontSize: '13px' };
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a237e', marginBottom: '24px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: c.bg, borderRadius: '10px', padding: '24px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>{c.value}</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>{c.label}</div>
          </div>
        ))}
      </div>
      {lowItems.length > 0 && (
        <>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#c62828', marginBottom: '12px' }}>&#9888; Low Stock Products</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <thead><tr>{['Product','Grade','Current (MT)','Minimum (MT)','Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {lowItems.map(p => (
                <tr key={p.id}>
                  <td style={td}>{p.name}</td><td style={td}>{p.grade}</td>
                  <td style={{ ...td, color: '#c62828', fontWeight: 700 }}>{p.current_stock_mt} MT</td>
                  <td style={td}>{p.min_stock_mt} MT</td>
                  <td style={td}><span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>LOW STOCK</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
