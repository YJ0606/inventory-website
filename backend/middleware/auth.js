const jwt = require('jsonwebtoken');
const SECRET = 'tmt_secret_2024';
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(auth.split(' ')[1], SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}
module.exports = { requireAuth, requireAdmin };
