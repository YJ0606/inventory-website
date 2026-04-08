const router = require('express').Router();
const { db, nextId } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  res.json(db.get('products').sortBy('id').value());
});
router.post('/', requireAuth, (req, res) => {
  const { name, grade, length_ft, weight_per_mt, current_stock_mt, min_stock_mt } = req.body;
  if (!name || !grade) return res.status(400).json({ error: 'Name and grade are required' });
  const product = {
    id: nextId('products'), name, grade,
    length_ft: Number(length_ft)||40, weight_per_mt: Number(weight_per_mt)||1000,
    unit: 'MT', current_stock_mt: Number(current_stock_mt)||0,
    min_stock_mt: Number(min_stock_mt)||1, created_at: new Date().toISOString()
  };
  db.get('products').push(product).write();
  res.json(product);
});
router.put('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { name, grade, length_ft, weight_per_mt, min_stock_mt } = req.body;
  db.get('products').find({ id })
    .assign({ name, grade, length_ft: Number(length_ft), weight_per_mt: Number(weight_per_mt), min_stock_mt: Number(min_stock_mt) })
    .write();
  res.json(db.get('products').find({ id }).value());
});
router.delete('/:id', requireAdmin, (req, res) => {
  db.get('products').remove({ id: Number(req.params.id) }).write();
  res.json({ success: true });
});
module.exports = router;
