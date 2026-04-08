import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
export default function ProtectedRoute() {
  const token = localStorage.getItem('tmt_token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
        <Outlet />
      </div>
    </>
  );
}
