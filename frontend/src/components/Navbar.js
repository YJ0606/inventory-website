import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
const LINKS = [
  { to: '/',          label: 'Dashboard' },
  { to: '/products',  label: 'Products'  },
  { to: '/stock',     label: 'Stock'     },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/invoices',  label: 'Invoices'  },
  { to: '/reports',   label: 'Reports'   },
];
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('tmt_user') || '{}');
  const logout = () => { localStorage.removeItem('tmt_token'); localStorage.removeItem('tmt_user'); navigate('/login'); };
  return (
    <nav style={{ background: '#1a237e', display: 'flex', alignItems: 'center', padding: '0 24px', height: '56px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginRight: '28px', whiteSpace: 'nowrap' }}>&#9889; TMT Inventory</span>
      <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
        {LINKS.map(l => (
          <Link key={l.to} to={l.to} style={{ color: location.pathname === l.to ? '#fff' : '#c5cae9', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 500, background: location.pathname === l.to ? 'rgba(255,255,255,0.18)' : 'transparent' }}>{l.label}</Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#e8eaf6', fontSize: '13px' }}>{user.name}</span>
        <span style={{ background: user.role === 'admin' ? '#ff6f00' : '#0288d1', color: '#fff', padding: '2px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</span>
        <button onClick={logout} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Logout</button>
      </div>
    </nav>
  );
}
