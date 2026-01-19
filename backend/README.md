# EpiPredict Kenya AI - Backend

FastAPI backend for disease surveillance and outbreak prediction.

## 🚀 Quick Start

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
# Copy example and fill in your values
cp .env.example .env
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs (Swagger)**: http://localhost:8000/docs
- **Docs (ReDoc)**: http://localhost:8000/redoc

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI entry point
│   ├── config.py         # Environment config
│   ├── database.py       # Supabase client
│   ├── models/           # Pydantic data models
│   ├── routers/          # API route handlers
│   └── services/         # Business logic
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/diseases` | List diseases |
| GET | `/api/counties` | List counties |
| GET | `/api/predictions/{county}` | Get predictions |
| POST | `/api/auth/login` | User login |

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon/service key |
| `FRONTEND_URL` | Frontend URL for CORS |
