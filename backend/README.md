# FinMate Backend

This is the FastAPI backend for FinMate.

## Features
- `/health` endpoint returns `{ "status": "ok" }` for health checks.

## Running the Server

1. Install dependencies:
   ```zsh
   pip install fastapi uvicorn
   ```
2. Start the server:
   ```zsh
   uvicorn main:app --reload
   ```
3. Visit [http://localhost:8000/health](http://localhost:8000/health) to check the health endpoint.
