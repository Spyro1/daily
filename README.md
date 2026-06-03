# Daily

![](./assets/logo/happy-wallet-logo-nobg.png)

Daily is a Kotlin Multiplatform personal finance tracker focused on fast, reliable expense and income management.

## Setup

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

### Quick Start (Recommended)

Run the full stack (PostgreSQL + backend + frontend):

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Local Run (Without Docker)

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run start
```

## Documentation

- [Frontend docs](./docs/frontend-docs.md)
- [Backend docs](./docs/backend-docs.md)
- [Final documentation (Markdown)](./docs/final-documentation.md)
- [Final documentation (HTML)](./docs/final-documentation.html)


## Scope

- Track expenses, income, and internal transfers across multiple accounts.
- Organize transactions with hierarchical categories.
- View daily, weekly, monthly, and yearly summaries with basic charts.
- Import and export data in JSON and CSV formats.
- Support local user usage and optional Google sign-in for cloud sync.
- Process supported payment notifications and queue them when offline.