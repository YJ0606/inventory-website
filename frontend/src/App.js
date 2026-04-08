import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products  from './pages/Products';
import Stock     from './pages/Stock';
import Suppliers from './pages/Suppliers';
import Invoices  from './pages/Invoices';
import Reports   from './pages/Reports';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/products"  element={<Products />} />
          <Route path="/stock"     element={<Stock />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/invoices"  element={<Invoices />} />
          <Route path="/reports"   element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
