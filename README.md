# TMT Inventory Management System (v2)

## No Compilation Required!
This version uses **lowdb** (pure JavaScript) instead of better-sqlite3.
- No Visual Studio needed
- No node-gyp compilation
- Works on any Windows machine with Node.js

## Prerequisites
- Node.js 18 or 20 LTS (https://nodejs.org)

## Setup & Run

### Step 1 — Start Backend
```
cd backend
npm install
node server.js
```
Runs on http://localhost:5000
Data saved in backend/db.json

### Step 2 — Start Frontend (new terminal)
```
cd frontend
npm install
npm start
```
Opens at http://localhost:3000

> Quick Start: Double-click start.bat

## Login Credentials
| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@tmt.com   | admin123  |
| Staff | staff1@tmt.com  | staff123  |
| Staff | staff2@tmt.com  | staff123  |
| Staff | staff3@tmt.com  | staff123  |

## Features
- Dashboard with live stats and low-stock alerts
- Products CRUD (TMT Rods, MT tracking)
- Stock IN / OUT management
- Supplier management
- GST Invoice generation (CGST 9% + SGST 9%)
- Reports: Daily Sales, Stock Movement, P&L, Supplier-wise
- Print-ready GST Tax Invoice

## Tech Stack
- Frontend: React 18, React Router v6, Axios
- Backend: Node.js, Express.js
- Database: lowdb (JSON file, pure JavaScript)
- Auth: JWT + bcryptjs
