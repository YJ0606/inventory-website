const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { db } = require('../db');
const SECRET = 'tmt_secret_2024';
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  const user = db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET, { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
module.exports = router;
