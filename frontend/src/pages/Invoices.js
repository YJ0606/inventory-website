import React, { useEffect, useState } from 'react';
import api from '../api';

const EC      = { name: '', gstin: '', addr: '' };
const newItem = () => ({ pid: '', pname: '', qty: '', rate: '' });

// ── Dynamic script loader (no npm install needed) ─────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── PDF Generator ─────────────────────────────────────────────────────────────
async function generatePDF(inv) {
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  } catch (e) {
    alert('Failed to load PDF library. Please check your internet connection and try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();

  const fmtRs   = n => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN') : '';

  // ── Dark blue header ──────────────────────────────────────────────────────
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, W, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TMT TRADERS', W / 2, 12, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    '123 Steel Market, Thane - 400601  |  GSTIN: 27AATFT1234A1Z5  |  Ph: 9876543210',
    W / 2, 19, { align: 'center' }
  );

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', W / 2, 27, { align: 'center' });

  // ── Invoice + Customer boxes ──────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  let y = 36;

  // Left box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(10, y, 88, 24, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(10, y, 88, 24, 2, 2, 'S');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('INVOICE DETAILS', 14, y + 6);
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.text(`Invoice No:  ${inv.invoice_number}`, 14, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date:  ${fmtDate(inv.created_at)}`, 14, y + 20);

  // Right box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(104, y, 96, 24, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(104, y, 96, 24, 2, 2, 'S');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('BILL TO', 108, y + 6);
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(String(inv.customer_name || ''), 108, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  if (inv.customer_gstin)   doc.text(`GSTIN: ${inv.customer_gstin}`, 108, y + 19);
  if (inv.customer_address) doc.text(String(inv.customer_address).slice(0, 45), 108, y + 24);

  y += 30;

  // ── Items table ───────────────────────────────────────────────────────────
  const items     = inv.items || [];
  const tableRows = items.map((it, i) => [
    i + 1,
    it.product_name || `Product #${it.product_id}`,
    `${it.quantity_mt} MT`,
    fmtRs(it.rate_per_mt),
    fmtRs(it.quantity_mt * it.rate_per_mt)
  ]);

  doc.autoTable({
    startY: y,
    head:   [['S.No', 'Description', 'Qty (MT)', 'Rate / MT', 'Amount']],
    body:   tableRows,
    theme:  'grid',
    headStyles: {
      fillColor:  [26, 35, 126],
      textColor:  [255, 255, 255],
      fontStyle:  'bold',
      fontSize:   10,
      halign:     'left'
    },
    bodyStyles:          { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles:  { fillColor: [249, 249, 249] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      1: { cellWidth: 72 },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'right',  cellWidth: 36 },
      4: { halign: 'right',  cellWidth: 36 }
    },
    margin: { left: 10, right: 10 }
  });

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = inv.subtotal     || 0;
  const gst      = inv.gst_amount   || 0;
  const total    = inv.total_amount || 0;

  let ty = doc.lastAutoTable.finalY + 6;
  const tx = 116, tw = 84;

  const row = (label, value, bold, highlight) => {
    const h = bold ? 9 : 7;
    if (highlight) {
      doc.setFillColor(26, 35, 126);
      doc.rect(tx, ty, tw, h, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(ty % 14 === 0 ? 245 : 255, 245, 245);
      doc.rect(tx, ty, tw, h, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(tx, ty, tw, h, 'S');
      doc.setTextColor(50, 50, 50);
    }
    doc.setFontSize(bold ? 11 : 9);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, tx + 3,        ty + (bold ? 6.5 : 5));
    doc.text(value, tx + tw - 3,   ty + (bold ? 6.5 : 5), { align: 'right' });
    ty += h;
  };

  row('Subtotal',    fmtRs(subtotal));
  row('CGST @ 9%',   fmtRs(gst / 2));
  row('SGST @ 9%',   fmtRs(gst / 2));
  row('Grand Total', fmtRs(total), true, true);

  // ── Footer ────────────────────────────────────────────────────────────────
  ty += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(10, ty, W - 10, ty);
  ty += 5;

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!  Goods once sold will not be taken back.  E&OE.', 14, ty);

  ty += 16;
  doc.setDrawColor(80, 80, 80);
  doc.line(W - 72, ty, W - 12, ty);
  ty += 5;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorised Signatory', W - 12, ty, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TMT TRADERS', W - 12, ty + 5, { align: 'right' });

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save(`${inv.invoice_number}.pdf`);
}

// ── React Component ───────────────────────────────────────────────────────────
export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [cust,     setCust]     = useState(EC);
  const [items,    setItems]    = useState([newItem()]);
  const [viewInv,  setViewInv]  = useState(null);
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null); // invoice id being downloaded

  const load = () => {
    api.get('/invoices').then(r => setInvoices(r.data)).catch(() => {});
    api.get('/products').then(r => setProducts(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addItem    = ()        => setItems([...items, newItem()]);
  const removeItem = i         => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, f, v) => setItems(items.map((it, idx) => {
    if (idx !== i) return it;
    const next = { ...it, [f]: v };
    if (f === 'pid') {
      const pr = products.find(p => String(p.id) === String(v));
      next.pname = pr ? pr.name : '';
    }
    return next;
  }));

  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const cgst  = subtotal * 0.09;
  const sgst  = subtotal * 0.09;
  const grand = subtotal + cgst + sgst;

  const fmtRs   = n => `\u20B9${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN') : '';

  const handleSubmit = async e => {
    e.preventDefault();
    if (!cust.name) { alert('Customer name is required'); return; }
    const valid = items.filter(it => it.pid && Number(it.qty) > 0 && Number(it.rate) > 0);
    if (!valid.length) { alert('Add at least one item with product, quantity and rate'); return; }
    setLoading(true);
    try {
      const res = await api.post('/invoices', {
        customer_name:    cust.name,
        customer_gstin:   cust.gstin,
        customer_address: cust.addr,
        items: valid.map(it => ({
          product_id:   Number(it.pid),
          product_name: it.pname,
          quantity_mt:  Number(it.qty),
          rate_per_mt:  Number(it.rate)
        }))
      });
      setSuccess(`Invoice ${res.data.invoice_number} created successfully!`);
      setTimeout(() => setSuccess(''), 5000);
      setCust(EC); setItems([newItem()]); load();
    } catch (err) { alert(err.response?.data?.error || 'Error creating invoice'); }
    finally { setLoading(false); }
  };

  const handleView = async id => {
    try { const r = await api.get(`/invoices/${id}`); setViewInv(r.data); }
    catch { alert('Error loading invoice'); }
  };

  const handleDownloadPDF = async id => {
    setPdfLoading(id);
    try {
      const r = await api.get(`/invoices/${id}`);
      await generatePDF(r.data);
    } catch { alert('Error generating PDF'); }
    finally { setPdfLoading(null); }
  };

  const th  = { background: '#1a237e', color: '#fff', padding: '10px 12px', textAlign: 'left', fontSize: '12px' };
  const td  = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' };
  const inp = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '13px', width: '100%' };

  return (
    <div>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* ── Create Invoice ── */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a237e', marginBottom: '20px' }}>Create Invoice</h2>
        {success && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontWeight: 600 }}>
            \u2713 {success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Customer Name *</label>
              <input style={inp} value={cust.name} required onChange={e => setCust({ ...cust, name: e.target.value })} placeholder="Customer / Company name" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>GSTIN</label>
              <input style={inp} value={cust.gstin} onChange={e => setCust({ ...cust, gstin: e.target.value })} placeholder="27XXXXX1234A1Z5" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '13px' }}>Address</label>
              <input style={inp} value={cust.addr} onChange={e => setCust({ ...cust, addr: e.target.value })} placeholder="Customer address" />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead>
              <tr style={{ background: '#e8eaf6' }}>
                {['Product', 'Qty (MT)', 'Rate/MT (\u20B9)', 'Amount (\u20B9)', ''].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#1a237e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={{ padding: '5px 4px', width: '35%' }}>
                    <select style={{ ...inp, marginBottom: 0 }} value={it.pid} onChange={e => updateItem(i, 'pid', e.target.value)}>
                      <option value="">-- Select Product --</option>
                      {products.map(pr => <option key={pr.id} value={pr.id}>{pr.name} ({pr.grade})</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '5px 4px', width: '15%' }}>
                    <input style={{ ...inp, marginBottom: 0 }} type="number" step="0.001" min="0"
                      value={it.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="0.000" />
                  </td>
                  <td style={{ padding: '5px 4px', width: '20%' }}>
                    <input style={{ ...inp, marginBottom: 0 }} type="number" step="0.01" min="0"
                      value={it.rate} onChange={e => updateItem(i, 'rate', e.target.value)} placeholder="0.00" />
                  </td>
                  <td style={{ padding: '5px 10px', fontWeight: 600, fontSize: '13px', width: '20%' }}>
                    {fmtRs((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                  </td>
                  <td style={{ padding: '5px 4px', width: '10%' }}>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>\u2715</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={addItem} style={{ background: '#e8eaf6', color: '#1a237e', border: '1px dashed #1a237e', padding: '7px 16px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            + Add Item
          </button>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ width: '300px', fontSize: '13px' }}>
              <tbody>
                <tr><td style={{ padding: '5px 10px', color: '#555' }}>Subtotal</td><td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtRs(subtotal)}</td></tr>
                <tr><td style={{ padding: '5px 10px', color: '#555' }}>CGST @9%</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmtRs(cgst)}</td></tr>
                <tr><td style={{ padding: '5px 10px', color: '#555' }}>SGST @9%</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmtRs(sgst)}</td></tr>
                <tr style={{ borderTop: '2px solid #1a237e' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: '#1a237e', fontSize: '15px' }}>Grand Total</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#1a237e', fontSize: '15px' }}>{fmtRs(grand)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '16px', background: '#1a237e', color: '#fff', border: 'none', padding: '11px 32px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
            {loading ? 'Creating...' : '\u2713 Create Invoice'}
          </button>
        </form>
      </div>

      {/* ── Invoice List ── */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a237e', marginBottom: '16px' }}>Invoice List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <thead>
          <tr>{['Invoice No', 'Customer', 'Date', 'Subtotal', 'GST (18%)', 'Total', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td style={{ ...td, fontWeight: 700, color: '#1a237e' }}>{inv.invoice_number}</td>
              <td style={td}>{inv.customer_name}</td>
              <td style={td}>{fmtDate(inv.created_at)}</td>
              <td style={td}>{fmtRs(inv.subtotal)}</td>
              <td style={td}>{fmtRs(inv.gst_amount)}</td>
              <td style={{ ...td, fontWeight: 700 }}>{fmtRs(inv.total_amount)}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <button onClick={() => handleView(inv.id)}
                  style={{ background: '#1565c0', color: '#fff', border: 'none', padding: '5px 11px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginRight: '6px' }}>
                  \uD83D\uDC41 View
                </button>
                <button onClick={() => handleDownloadPDF(inv.id)} disabled={pdfLoading === inv.id}
                  style={{ background: pdfLoading === inv.id ? '#aaa' : '#2e7d32', color: '#fff', border: 'none', padding: '5px 11px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                  {pdfLoading === inv.id ? 'Loading...' : '\u2B07 PDF'}
                </button>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#999' }}>No invoices yet. Create one above.</td></tr>
          )}
        </tbody>
      </table>

      {/* ── Print / View Modal ── */}
      {viewInv && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, overflow: 'auto', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '32px', width: '800px', maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
              <button onClick={() => generatePDF(viewInv)}
                style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}>
                \u2B07 Download PDF
              </button>
              <button onClick={() => window.print()}
                style={{ background: '#1a237e', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}>
                \uD83D\uDDA8 Print
              </button>
              <button onClick={() => setViewInv(null)}
                style={{ background: '#eee', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}>
                \u2715 Close
              </button>
            </div>

            <div style={{ textAlign: 'center', borderBottom: '2px solid #1a237e', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#1a237e', letterSpacing: '2px' }}>TMT TRADERS</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>123 Steel Market, Thane - 400601 | GSTIN: 27AATFT1234A1Z5 | Ph: 9876543210</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px', letterSpacing: '4px', color: '#333' }}>TAX INVOICE</div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, background: '#f8f9fa', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', marginBottom: '6px' }}>INVOICE DETAILS</div>
                <div style={{ fontSize: '13px' }}><b>Invoice No:</b> {viewInv.invoice_number}</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}><b>Date:</b> {fmtDate(viewInv.created_at)}</div>
              </div>
              <div style={{ flex: 2, background: '#f8f9fa', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', marginBottom: '6px' }}>BILL TO</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{viewInv.customer_name}</div>
                {viewInv.customer_gstin   && <div style={{ fontSize: '12px', color: '#555' }}>GSTIN: {viewInv.customer_gstin}</div>}
                {viewInv.customer_address && <div style={{ fontSize: '12px', color: '#555' }}>{viewInv.customer_address}</div>}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1a237e', color: '#fff' }}>
                  {['S.No', 'Description', 'Qty (MT)', 'Rate/MT (\u20B9)', 'Amount (\u20B9)'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(viewInv.items || []).map((it, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '8px 12px' }}>{i + 1}</td>
                    <td style={{ padding: '8px 12px' }}>{it.product_name || `Product #${it.product_id}`}</td>
                    <td style={{ padding: '8px 12px' }}>{it.quantity_mt} MT</td>
                    <td style={{ padding: '8px 12px' }}>{fmtRs(it.rate_per_mt)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{fmtRs(it.quantity_mt * it.rate_per_mt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <table style={{ width: '280px', fontSize: '13px', border: '1px solid #e0e0e0' }}>
                <tbody>
                  <tr><td style={{ padding: '7px 12px', background: '#f5f5f5' }}>Subtotal</td><td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtRs(viewInv.subtotal)}</td></tr>
                  <tr><td style={{ padding: '7px 12px' }}>CGST @9%</td><td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtRs(viewInv.gst_amount / 2)}</td></tr>
                  <tr><td style={{ padding: '7px 12px', background: '#f5f5f5' }}>SGST @9%</td><td style={{ padding: '7px 12px', textAlign: 'right', background: '#f5f5f5' }}>{fmtRs(viewInv.gst_amount / 2)}</td></tr>
                  <tr style={{ background: '#1a237e', color: '#fff' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 800, fontSize: '14px' }}>Grand Total</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, fontSize: '14px' }}>{fmtRs(viewInv.total_amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                Thank you for your business! Goods once sold will not be taken back. E&OE.
              </div>
              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{ borderTop: '1px solid #333', paddingTop: '6px', fontSize: '12px', color: '#555' }}>Authorised Signatory</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>TMT TRADERS</div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
