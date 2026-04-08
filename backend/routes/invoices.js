const router = require('express').Router();
const { db, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const all  = db.get('invoices').filter(inv => inv.invoice_number && inv.invoice_number.startsWith('INV-'+year+'-')).value();
  const num  = all.length === 0 ? 1 : Math.max(...all.map(inv => parseInt(inv.invoice_number.split('-')[2])||0)) + 1;
  return 'INV-'+year+'-'+String(num).padStart(4,'0');
}

router.get('/', requireAuth, (req, res) => {
  res.json(db.get('invoices').sortBy('id').reverse().value());
});
router.get('/:id', requireAuth, (req, res) => {
  const inv = db.get('invoices').find({ id: Number(req.params.id) }).value();
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ ...inv, items: typeof inv.items_json === 'string' ? JSON.parse(inv.items_json) : (inv.items_json||[]) });
});
router.post('/', requireAuth, (req, res) => {
  const { customer_name, customer_gstin, customer_address, items } = req.body;
  if (!customer_name || !items || items.length === 0)
    return res.status(400).json({ error: 'Customer name and items are required' });
  const subtotal    = items.reduce((s,i) => s + i.quantity_mt * i.rate_per_mt, 0);
  const gst_amount  = parseFloat((subtotal * 0.18).toFixed(2));
  const total_amount = parseFloat((subtotal + gst_amount).toFixed(2));
  const invoice = {
    id: nextId('invoices'),
    invoice_number: nextInvoiceNumber(),
    customer_name, customer_gstin: customer_gstin||'', customer_address: customer_address||'',
    items_json: JSON.stringify(items),
    subtotal, gst_rate: 18, gst_amount, total_amount,
    created_by: req.user.id, created_at: new Date().toISOString()
  };
  db.get('invoices').push(invoice).write();
  res.json({ ...invoice, items });
});
module.exports = router;
