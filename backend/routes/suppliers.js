const router = require('express').Router();
const { db, nextId } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
router.get('/', requireAuth, (req, res) => {
  res.json(db.get('suppliers').sortBy('name').value());
});
router.post('/', requireAuth, (req, res) => {
  const { name, contact, address, gstin } = req.body;
  if (!name) return res.status(400).json({ error: 'Supplier name is required' });
  const s = { id: nextId('suppliers'), name, contact:contact||'', address:address||'', gstin:gstin||'', created_at:new Date().toISOString() };
  db.get('suppliers').push(s).write();
  res.json(s);
});
router.put('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { name, contact, address, gstin } = req.body;
  db.get('suppliers').find({ id }).assign({ name, contact:contact||'', address:address||'', gstin:gstin||'' }).write();
  res.json(db.get('suppliers').find({ id }).value());
});
router.delete('/:id', requireAdmin, (req, res) => {
  db.get('suppliers').remove({ id: Number(req.params.id) }).write();
  res.json({ success: true });
});
module.exports = router;
