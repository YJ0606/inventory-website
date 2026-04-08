import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('tmt_token', res.data.token);
      localStorage.setItem('tmt_user',  JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) { setError(err.response?.data?.error || 'Login failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a237e,#0d47a1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '48px 40px', width: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', fontSize: '40px', marginBottom: '8px' }}>&#9889;</div>
        <h1 style={{ textAlign: 'center', color: '#1a237e', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>TMT Inventory System</h1>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '28px' }}>Sign in to continue</p>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@tmt.com" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }} />
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#aaa' }}>Default: admin@tmt.com / admin123</p>
      </div>
    </div>
  );
}
