# Jobs Dashboard & ATS Tracker
Tracking code : WTC-C73XSVKZ

Cyber Tracking code: WTC-S597GLFW

**Live demo**: [Jobbdash](http://44.220.138.111/)

A full-stack career management dashboard, ATS keyword match calculator, and AI-assisted application tracker built with **Python FastAPI** and **React + Tailwind CSS**.
---

---

[![Watch the video](https://youtube.com)](https://youtu.be/7bC8mowHgSw)

---


## 🏗️ Architecture
```text
Jobs_Dashboard/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # FastAPI entrypoint, middleware, routes
│   ├── database.py           # SQLite database persistence & CRUD operations
│   ├── models.py             # Pydantic data schemas & validation models
│   ├── routers/              # Modular REST API route handlers
│   │   ├── jobs.py           # /api/jobs (CRUD, batch operations, stage moves)
│   │   ├── resumes.py        # /api/resumes (CRUD & document file upload/parse)
│   │   ├── profile.py        # /api/profile & /api/goals
│   │   ├── ats.py            # /api/ats/calculate
│   │   └── ai.py             # /api/ai/draft-email
│   └── services/             # Core backend business logic
│       ├── ats_service.py    # ATS scoring engine & keyword taxonomy
│       ├── ai_service.py     # Career Coach email draft generator
│       ├── file_service.py   # PDF / DOCX / TXT document text extraction
│       └── job_importer.py   # URL job listing scraper with SSRF protection
├── src/                      # React + TypeScript Frontend
│   ├── App.tsx               # Main state container with live backend sync
│   ├── components/           # UI components (Kanban, Table, ATS, Modals, etc.)
│   ├── services/api.ts       # Typed frontend client calling Python backend
│   ├── types.ts              # TypeScript domain models
│   └── utils/                # Client-side helpers (ATS calculator, file parser)
├── run_backend.py            # Runner script for Python server
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies & scripts
└── vite.config.ts            # Vite config with API proxy to localhost:8000
```

---

## 🚀 Quick Start

### 1. Install Dependencies

**Python Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, DATABASE_URL, and other settings
```

#### Database Setup (PostgreSQL or SQLite)
The application operates in **hybrid database mode**:
- **PostgreSQL**: Set `DATABASE_URL` in `.env` (e.g. Neon, Supabase, AWS RDS, or local Docker).
  ```bash
  # Example for Neon / Supabase / Cloud Postgres:
  DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
  ```
- **SQLite Fallback**: If `DATABASE_URL` is omitted or empty, the backend automatically uses the local SQLite database (`backend/jobs_dashboard.db`).

#### Local PostgreSQL with Docker (Optional)
If you want to run PostgreSQL locally using Docker:
```bash
docker compose up -d
```
Then set in your `.env`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobs_dashboard"
```

#### Migrate Existing SQLite Data to PostgreSQL
To migrate all your existing job applications, resumes, user profiles, and goals from SQLite to PostgreSQL:
```bash
# Preview what will be migrated without making changes:
python scripts/migrate_sqlite_to_postgres.py --dry-run

# Run the live migration:
python scripts/migrate_sqlite_to_postgres.py
```

### 3. Run the System

**Terminal 1 — Python Backend:**
```bash
python run_backend.py
```
> 📍 Backend: `http://127.0.0.1:8000`
> 📖 API Docs: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend:**
```bash
npm run dev
```
> 📍 Frontend: `http://localhost:5173`

---

## 🚢 Production Deployment

### Build the frontend
```bash
npm run build
```

### Environment Variables
| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Gemini AI API key for AI features | Required |
| `APP_URL` | Production URL of the deployed app | Required |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

### Run the backend
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

---

## 🔌 API Endpoints

### Jobs (`/api/jobs`)
- `GET /api/jobs` — List jobs (`?stage=...`, `?priority=...`, `?search=...`)
- `POST /api/jobs` — Create or update a job application
- `GET /api/jobs/{id}` — Retrieve job details
- `PUT /api/jobs/{id}` — Update job details
- `DELETE /api/jobs/{id}` — Delete a job
- `POST /api/jobs/batch-delete` — Delete multiple jobs
- `POST /api/jobs/batch-stage` — Move multiple jobs to a new stage
- `PATCH /api/jobs/{id}/stage` — Move a single job's stage
- `PATCH /api/jobs/{id}/rating` — Update job priority rating (1–5)
- `POST /api/jobs/{id}/interviews/{interview_id}/complete` — Mark interview completed

### Resumes (`/api/resumes`)
- `GET /api/resumes` — List all resume versions
- `POST /api/resumes` — Create/update resume version
- `GET /api/resumes/{id}` — Retrieve single resume
- `DELETE /api/resumes/{id}` — Delete resume version
- `POST /api/resumes/upload` — Upload PDF/DOCX/TXT and extract text/skills

### Profile & Goals (`/api`)
- `GET /api/profile` — Get user profile
- `PUT /api/profile` — Update user profile
- `GET /api/goals` — Get user goals
- `PUT /api/goals` — Save user goals
- `POST /api/reset-demo` — Reset database to sample dataset

### ATS Match Engine (`/api/ats`)
- `POST /api/ats/calculate` — Calculate ATS score with keyword taxonomy matching

### Career Coach AI (`/api/ai`)
- `POST /api/ai/draft-email` — Generate personalized email drafts (Thank You, Follow-up, Negotiation, Withdrawal)
