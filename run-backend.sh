#!/bin/bash
# Start Backend
echo "Starting Backend (Uvicorn)..."
docker compose up --watch backend --build
# cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &