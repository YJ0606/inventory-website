const low      = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db      = low(adapter);

db.defaults({ users:[], suppliers:[], products:[], stock_movements:[], invoices:[] }).write();

// Helper: next auto-increment ID
function nextId(col) {
  const arr = db.get(col).value();
  return arr.length === 0 ? 1 : Math.max(...arr.map(r => r.id)) + 1;
}

const now = () => new Date().toISOString();

// Seed users
if (db.get('users').value().length === 0) {
  db.set('users', [
    { id:1, name:'Admin User',  email:'admin@tmt.com',  password_hash:bcrypt.hashSync('admin123',10), role:'admin', created_at:now() },
    { id:2, name:'Staff One',   email:'staff1@tmt.com', password_hash:bcrypt.hashSync('staff123',10), role:'staff', created_at:now() },
    { id:3, name:'Staff Two',   email:'staff2@tmt.com', password_hash:bcrypt.hashSync('staff123',10), role:'staff', created_at:now() },
    { id:4, name:'Staff Three', email:'staff3@tmt.com', password_hash:bcrypt.hashSync('staff123',10), role:'staff', created_at:now() },
  ]).write();
  console.log('Users seeded');
}

// Seed suppliers
if (db.get('suppliers').value().length === 0) {
  db.set('suppliers', [
    { id:1, name:'Steel Corp India',   contact:'9876543210', address:'12 Industrial Area, Mumbai', gstin:'27AABCS1234A1Z5', created_at:now() },
    { id:2, name:'RajLakshmi Steels',  contact:'9988776655', address:'45 Market Road, Pune',       gstin:'27AALCR5678B2Z3', created_at:now() },
    { id:3, name:'National TMT Depot', contact:'8877665544', address:'78 Steel Hub, Nagpur',        gstin:'27AANCT9012C3Z1', created_at:now() },
  ]).write();
  console.log('Suppliers seeded');
}

// Seed products
if (db.get('products').value().length === 0) {
  db.set('products', [
    { id:1, name:'TMT Rod 8mm',  grade:'Fe415',  length_ft:40, weight_per_mt:395,  unit:'MT', current_stock_mt:10.5, min_stock_mt:2, created_at:now() },
    { id:2, name:'TMT Rod 10mm', grade:'Fe415',  length_ft:40, weight_per_mt:617,  unit:'MT', current_stock_mt:8.0,  min_stock_mt:2, created_at:now() },
    { id:3, name:'TMT Rod 12mm', grade:'Fe500',  length_ft:40, weight_per_mt:888,  unit:'MT', current_stock_mt:15.0, min_stock_mt:3, created_at:now() },
    { id:4, name:'TMT Rod 16mm', grade:'Fe500',  length_ft:40, weight_per_mt:1579, unit:'MT', current_stock_mt:20.0, min_stock_mt:5, created_at:now() },
    { id:5, name:'TMT Rod 20mm', grade:'Fe550D', length_ft:40, weight_per_mt:2469, unit:'MT', current_stock_mt:12.0, min_stock_mt:3, created_at:now() },
  ]).write();
  console.log('Products seeded');
}

module.exports = { db, nextId };
