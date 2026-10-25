# AI Project Builder

A React + Vite frontend and FastAPI backend for generating project codebases from a specification, downloading ZIPs, and publishing to GitHub.

## Features
- Topic/specification input and document upload (PDF, DOCX, TXT, PNG/JPG/WEBP).
- Server-side AI generation via OpenAI-compatible chat completions API (configurable endpoint/model).
- Generated file tree and code preview.
- Secure ZIP creation with secret/build/cache exclusions.
- GitHub OAuth login and GitHub REST API publishing to a new or existing repository.
- Confirmation before publishing, session-bound project ownership, path and file validation.

## Requirements
- Python 3.11+
- Node.js 20+
- An AI provider API key compatible with the OpenAI Chat Completions API (optional for demo fallback)
- GitHub OAuth App credentials for publishing (optional until GitHub integration is used)

## Setup

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set SECRET_KEY, AI_API_KEY, and GitHub OAuth credentials.
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown (normally http://localhost:5173). Vite proxies `/api` to `http://localhost:8000`.

## Configuration
See `backend/.env.example`. Keep `.env` out of source control. Set `FRONTEND_URL` and `BACKEND_URL` to your deployed origins in production. Use HTTPS in production and configure secure cookies. The OAuth callback URL must exactly match `GITHUB_CALLBACK_URL` in your GitHub OAuth App.

## API
- `POST /api/projects/analyze`
- `POST /api/projects/generate`
- `GET /api/projects/{project_id}/files`
- `GET /api/projects/{project_id}/download`
- `GET /api/github/login`
- `GET /api/github/callback`
- `GET /api/github/repositories`
- `POST /api/github/publish`

## Notes and limitations
- If `AI_API_KEY` is not configured, generation uses a clearly labeled deterministic starter template so the app remains testable; set a provider key for AI-generated code.
- PDF/DOCX/text extraction is implemented. Images are OCR-processed when Tesseract is installed; otherwise image upload returns a clear error.
- OAuth access tokens are stored server-side in process memory, not in the signed browser cookie. Restarting the backend clears tokens and requires reconnecting. For production, use a persistent encrypted server-side token/session store, CSRF protection appropriate to your deployment, HTTPS, secure cookie settings, rate limiting, and a secret manager.
- GitHub publishing requires an authorized GitHub OAuth App. The app creates or updates repository contents using the Git Trees/Commits API; GitHub API errors are returned to the user. A new repository can be created with the authenticated user's repository endpoint.
- This is a functional starter suitable for local development. Review threat model, provider terms, quotas, and deployment security before exposing it publicly.
