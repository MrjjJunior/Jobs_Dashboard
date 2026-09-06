# Jobs Dashboard & ATS Tracker (Python Backend + React Frontend)

A full-stack, career management dashboard, ATS keyword match calculator, and AI-assisted application tracker built with a **Python FastAPI backend** and **React + Tailwind CSS frontend**.

---

## 🏗️ Architecture Overview

```text
Jobs_Dashboard/
├── backend/                  # Python FastAPI Backend
│   ├── database.py           # SQLite database persistence & CRUD operations
│   ├── models.py             # Pydantic data schemas & validation models
│   ├── main.py               # FastAPI entrypoint, middleware, routes
│   ├── routers/              # Modular REST API route handlers
│   │   ├── jobs.py           # /api/jobs (CRUD, batch operations, stage moves)
│   │   ├── resumes.py        # /api/resumes (CRUD & document file upload/parse)
│   │   ├── profile.py        # /api/profile & /api/goals
│   │   ├── ats.py            # /api/ats/calculate
│   │   └── ai.py             # /api/ai/draft-email
│   └── services/             # Core backend business logic
│       ├── ats_service.py    # Python ATS scoring engine & keyword taxonomy
│       ├── ai_service.py     # Career Coach email draft generator
│       └── file_service.py   # PDF / DOCX / TXT document text extraction
├── src/                      # React + TypeScript Frontend
│   ├── services/
│   │   └── api.ts            # Typed frontend client calling Python backend
│   ├── components/           # UI components (Kanban, Table, ATS, Modals, etc.)
│   └── App.tsx               # Main state container with live backend sync
├── run_backend.py            # Simple runner script for Python server
├── requirements.txt          # Python dependencies (FastAPI, Uvicorn, Pydantic)
├── package.json              # Node.js dependencies & scripts
└── vite.config.ts            # Vite config with API proxy to localhost:8000
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

**Python Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

---

### 2. Run the System

You can run both servers in separate terminal tabs:

**Terminal 1 — Python Backend:**
```bash
python run_backend.py
# Or via npm script:
# npm run backend
```
> 📍 Backend runs at `http://127.0.0.1:8000`
> 📖 Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend:**
```bash
npm run dev
```
> 📍 Frontend runs at `http://localhost:5173`

---

## 🔌 API Endpoints Reference

### Jobs (`/api/jobs`)
- `GET /api/jobs` - List jobs (supports `?stage=...`, `?priority=...`, `?search=...`)
- `POST /api/jobs` - Create or update a job application
- `GET /api/jobs/{id}` - Retrieve job details
- `PUT /api/jobs/{id}` - Update job details
- `DELETE /api/jobs/{id}` - Delete a job
- `POST /api/jobs/batch-delete` - Delete multiple jobs by ID
- `POST /api/jobs/batch-stage` - Move multiple jobs to a new stage
- `PATCH /api/jobs/{id}/stage` - Move a single job's stage (Kanban drag/drop)
- `PATCH /api/jobs/{id}/rating` - Update job priority rating (1-5)
- `POST /api/jobs/{id}/interviews/{interview_id}/complete` - Mark interview round completed

### Resumes (`/api/resumes`)
- `GET /api/resumes` - List all resume versions
- `POST /api/resumes` - Create/update resume version
- `GET /api/resumes/{id}` - Retrieve single resume
- `DELETE /api/resumes/{id}` - Delete resume version
- `POST /api/resumes/upload` - Upload PDF/DOCX/TXT file and extract text/skills

### Profile & Goals (`/api`)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/goals` - Get user search targets & monthly goals
- `PUT /api/goals` - Save user goals
- `POST /api/reset-demo` - Reset database to clean sample dataset

### ATS Match Engine (`/api/ats`)
- `POST /api/ats/calculate` - Calculate ATS score, keyword taxonomy matching, and actionable recommendations.

### Career Coach AI (`/api/ai`)
- `POST /api/ai/draft-email` - Generate personalized Thank You, Follow-up, Negotiation, and Withdrawal email drafts.
