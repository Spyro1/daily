#!/bin/bash
# Start Backend
echo "Starting Backend (Uvicorn)..."
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &