const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const inRange = (d, from, to) => { const s = d ? d.slice(0,10) : ''; return s >= from && s <= to; };

router.get('/daily-sales', requireAuth, (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0,10);
  const invoices = db.get('invoices').filter(inv => inv.created_at && inv.created_at.slice(0,10) === date).value();
  res.json({ date, invoices, total_revenue: invoices.reduce((s,r) => s+r.total_amount, 0), count: invoices.length });
});

router.get('/stock-movement', requireAuth, (req, res) => {
  const from = req.query.from||'2000-01-01', to = req.query.to||'2099-12-31';
  const products  = db.get('products').value();
  const suppliers = db.get('suppliers').value();
  const rows = db.get('stock_movements').filter(m => inRange(m.created_at, from, to)).sortBy('id').reverse().value()
    .map(m => ({ ...m, product_name:(products.find(p=>p.id===m.product_id)||{}).name||'', supplier_name:m.supplier_id?(suppliers.find(s=>s.id===m.supplier_id)||{}).name||'':'' }));
  res.json(rows);
});

router.get('/profit-loss', requireAuth, (req, res) => {
  const from = req.query.from||'2000-01-01', to = req.query.to||'2099-12-31';
  const cost = db.get('stock_movements').filter(m => m.type==='IN' && inRange(m.created_at,from,to)).reduce((s,m)=>s+m.quantity_mt*m.rate_per_mt,0);
  const rev  = db.get('invoices').filter(inv=>inRange(inv.created_at,from,to)).reduce((s,inv)=>s+inv.subtotal,0);
  res.json({ from, to, total_purchase_cost:parseFloat(cost.toFixed(2)), total_revenue:parseFloat(rev.toFixed(2)), gross_profit:parseFloat((rev-cost).toFixed(2)) });
});

router.get('/supplier-wise', requireAuth, (req, res) => {
  const from = req.query.from||'2000-01-01', to = req.query.to||'2099-12-31';
  const sid  = req.query.supplier_id ? Number(req.query.supplier_id) : null;
  const products  = db.get('products').value();
  const suppliers = db.get('suppliers').value();
  let mvts = db.get('stock_movements').filter(m => m.type==='IN' && m.supplier_id && inRange(m.created_at,from,to)).value();
  if (sid) mvts = mvts.filter(m => m.supplier_id === sid);
  const grouped = {};
  mvts.forEach(m => {
    const key = m.supplier_id+'_'+m.product_id;
    if (!grouped[key]) grouped[key] = { supplier_id:m.supplier_id, product_id:m.product_id, total_qty_mt:0, total_value:0 };
    grouped[key].total_qty_mt += m.quantity_mt;
    grouped[key].total_value  += m.quantity_mt * m.rate_per_mt;
  });
  const result = Object.values(grouped).map(g => ({
    supplier_name: (suppliers.find(s=>s.id===g.supplier_id)||{}).name||'',
    product_name:  (products.find(pr=>pr.id===g.product_id)||{}).name||'',
    total_qty_mt:  parseFloat(g.total_qty_mt.toFixed(3)),
    total_value:   parseFloat(g.total_value.toFixed(2))
  })).sort((a,b)=>a.supplier_name.localeCompare(b.supplier_name));
  res.json(result);
});
module.exports = router;
