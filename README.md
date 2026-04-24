# Campus Opportunity Aggregator (COA) - BluePenguin

A centralized portal for students to discover and track internships, hackathons, and academic opportunities. Built with the **AccentSketch** design language for a premium, high-fidelity experience.

## 🚀 Recent Updates: QA Swarm Completion
The platform has undergone a comprehensive 7-phase QA swarm to ensure production readiness. Key improvements include:
- **Critical Fixes**: Resolved Admin Panel crashes and logic errors in student eligibility views.
- **New Features**: Implemented Student Feed Search, Keyboard Shortcuts (`?`, `/`), and Admin Breadcrumbs.
- **Mobile First**: Full mobile responsive design with a Student Bottom Nav and Admin Hamburger Drawer.
- **Resilience**: Added a Global Error Boundary to handle runtime crashes gracefully.
- **Security**: Re-enabled production-grade rate limiters and completed a route security audit.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS (Vanilla CSS), Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Design System**: AccentSketch (Custom Premium UI components).

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env (see .env.example)
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Admin Access
- **Email**: `igiveheadsup@gmail.com`
- **Password**: `Admin@123`
- **Hub**: Navigate to `/admin` after logging in.

## 🛡️ Production Hardening
Before deploying to production:
1. **Secrets**: Rotate `JWT_SECRET` in `backend/.env`.
2. **Email**: Update `SMTP_PASS` from the test App Password to a production SMTP service.
3. **Caching**: Provide a `REDIS_URL` in `.env` to enable feed-level caching for performance.
4. **Environment**: Ensure `NODE_ENV=production` is set in your deployment environment.

## 🏗️ Project Structure
- `frontend/`: React application with custom library components.
- `backend/`: Express API with MongoDB models and curation logic.
- `COA_Test_Plan.md`: Master test suite used for QA validation.
- `walkthrough.md`: Detailed logs of the fixes implemented during the QA swarm.

---
*Created by Antigravity - Advanced Agentic Coding*
