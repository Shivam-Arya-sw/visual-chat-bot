# Visual Chatbot — Auto-deploy (React frontend + FastAPI backend)

This repository is pre-configured for a free deployment flow:
- Frontend: Vercel (static site) — built with Create React App
- Backend: Render (free) or any Python host — forwards image+question to Hugging Face Inference API
- Model: `microsoft/phi-3-vision-128k-instruct` (Hugging Face Inference API)

## What you get
- React frontend (frontend/)
- FastAPI backend (backend/) that forwards to Hugging Face inference API
- Procfile and Dockerfile for easy deploy
- Instructions to deploy to Render and Vercel

## Quick steps

1. Push this project to a GitHub repository.

2. Create a Hugging Face token:
   - https://huggingface.co/settings/tokens
   - Create a token (read access) and copy it.

3. Deploy backend (Render):
   - Create a Render account and 'New Web Service'.
   - Connect GitHub and select the `backend` folder.
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app:app --host 0.0.0.0 --port 8000`
   - Add Environment variables in Render's dashboard:
     - `HF_TOKEN` = your token
     - `HF_MODEL` = `microsoft/phi-3-vision-128k-instruct` (default)
   - Finish deploy and note the public URL (e.g. https://your-backend.onrender.com).

4. Deploy frontend (Vercel):
   - Import the `frontend` folder in Vercel.
   - In Project Settings -> Environment Variables add:
     - `REACT_APP_BACKEND_URL` = https://your-backend.onrender.com
   - Deploy and get your frontend URL.

## Local testing
Backend:
```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export HF_TOKEN="your_token_here"
uvicorn app:app --reload
```

Frontend:
```
cd frontend
npm install
REACT_APP_BACKEND_URL=http://localhost:8000 npm start
```

## Notes
- HF free tier has usage/rate limits. For demos it's fine.
- Render free plan sleeps after inactivity.
