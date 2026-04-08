const router = require('express').Router();
const { db, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, (req, res) => {
  const products = db.get('products').sortBy('name').value();
  res.json(products.map(p => ({ ...p, low_stock: p.current_stock_mt < p.min_stock_mt })));
});

router.get('/movements', requireAuth, (req, res) => {
  const products  = db.get('products').value();
  const suppliers = db.get('suppliers').value();
  const movements = db.get('stock_movements').sortBy('id').reverse().take(200).value();
  const result = movements.map(m => ({
    ...m,
    product_name:  (products.find(p => p.id === m.product_id)  || {}).name || '',
    supplier_name: m.supplier_id ? (suppliers.find(s => s.id === m.supplier_id) || {}).name || '' : ''
  }));
  res.json(result);
});

router.post('/in', requireAuth, (req, res) => {
  const { product_id, quantity_mt, rate_per_mt, supplier_id, reference, notes } = req.body;
  if (!product_id || !quantity_mt || !rate_per_mt)
    return res.status(400).json({ error: 'product_id, quantity_mt and rate_per_mt are required' });
  const pid = Number(product_id), qty = Number(quantity_mt);
  db.get('stock_movements').push({
    id: nextId('stock_movements'), product_id: pid, type: 'IN',
    quantity_mt: qty, rate_per_mt: Number(rate_per_mt),
    supplier_id: supplier_id ? Number(supplier_id) : null,
    reference: reference||'', notes: notes||'', created_at: new Date().toISOString()
  }).write();
  db.get('products').find({ id: pid })
    .update('current_stock_mt', v => Math.round((v + qty) * 1000) / 1000)
    .write();
  res.json({ success: true });
});

router.post('/out', requireAuth, (req, res) => {
  const { product_id, quantity_mt, rate_per_mt, reference, notes } = req.body;
  if (!product_id || !quantity_mt || !rate_per_mt)
    return res.status(400).json({ error: 'product_id, quantity_mt and rate_per_mt are required' });
  const pid = Number(product_id), qty = Number(quantity_mt);
  const product = db.get('products').find({ id: pid }).value();
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.current_stock_mt < qty)
    return res.status(400).json({ error: `Insufficient stock. Available: ${product.current_stock_mt} MT` });
  db.get('stock_movements').push({
    id: nextId('stock_movements'), product_id: pid, type: 'OUT',
    quantity_mt: qty, rate_per_mt: Number(rate_per_mt),
    supplier_id: null, reference: reference||'', notes: notes||'',
    created_at: new Date().toISOString()
  }).write();
  db.get('products').find({ id: pid })
    .update('current_stock_mt', v => Math.round((v - qty) * 1000) / 1000)
    .write();
  res.json({ success: true });
});
module.exports = router;
