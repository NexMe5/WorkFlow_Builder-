# VectorShift Pipeline Builder

A full-stack pipeline builder application with a React frontend and a FastAPI backend. Users can visually construct node-based pipelines and validate whether the resulting graph is a Directed Acyclic Graph (DAG).

---

## 📋 Prerequisites

Make sure you have the following installed before running the project:

| Tool | Required Version |
|------|-----------------|
| **Node.js** | v18.x or higher (v20.x recommended) |
| **Python** | 3.10 or higher |
| **pip** | Latest (bundled with Python) |
| **FastAPI** | 0.137.1 (installed via `requirements.txt`) |
| **Uvicorn** | 0.49.0 (installed via `requirements.txt`) |

### Verify your versions

```bash
# Check Node.js version
node --version

# Check Python version
python --version

# Check pip version
pip --version
```

---

## 📁 Project Structure

```
VectorShift_Assessment_Submission/
├── backend/
│   ├── main.py             # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── test_main.py        # Backend unit tests
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json        # Node.js dependencies
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI + Uvicorn)

**Navigate to the backend directory:**
```bash
cd backend
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Start the backend server:**
```bash
uvicorn main:app --reload
```

The backend will start at:
- 🌐 **API Base URL:** `http://127.0.0.1:8000`
- 📄 **Swagger UI (API Docs):** `http://127.0.0.1:8000/docs`
- 📘 **ReDoc:** `http://127.0.0.1:8000/redoc`

> The `--reload` flag enables hot-reloading — the server automatically restarts when you make code changes.

---

### 2. Frontend Setup (React)

**Open a new terminal and navigate to the frontend directory:**
```bash
cd frontend
```

**Install Node.js dependencies:**
```bash
npm install
```

**Start the frontend development server:**
```bash
npm start
```

The frontend will start at:
- 🌐 **App URL:** `http://localhost:3000`

> The React development server also supports hot-reloading — changes to source files will instantly reflect in the browser.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — returns `{ "Ping": "Pong" }` |
| `POST` | `/pipelines/parse` | Parses a pipeline and returns node count, edge count, and DAG validity |

### Example Request — `/pipelines/parse`

```json
POST http://127.0.0.1:8000/pipelines/parse

{
  "nodes": [
    { "id": "node-1" },
    { "id": "node-2" }
  ],
  "edges": [
    { "source": "node-1", "target": "node-2" }
  ]
}
```

### Example Response

```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0
- **ReactFlow** 11.8.3 — node-based pipeline canvas
- **Lucide React** — icon library

### Backend
- **Python** 3.10+
- **FastAPI** 0.137.1
- **Uvicorn** 0.49.0 — ASGI server
- **Pydantic** 2.13.4 — data validation

---

## ✅ Running Tests

### Backend Tests
```bash
cd backend
python -m pytest test_main.py
```

---

## ⚠️ Common Issues

**Port already in use (Backend)**
```bash
# Run on a different port
uvicorn main:app --reload --port 8001
```

**Port already in use (Frontend)**
```bash
# React will prompt you to use another port automatically,
# or set the PORT environment variable:
set PORT=3001 && npm start   # Windows
```

**CORS errors** — Make sure both servers are running simultaneously. The backend is already configured to allow all origins (`*`) for development.

---

## 📜 License

This project was created as part of the technical assessment.

---

## Deployment: Vercel + Render

### Backend on Render

Create a new Render Web Service using Docker with these settings:

- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`
- Health Check Path: `/`

Render supplies the `PORT` environment variable automatically. The backend
Docker image starts Uvicorn on that port, so no separate start command is
required.

You can verify the image locally from the repository root:

```bash
docker build -t pipeline-studio-backend ./backend
docker run --rm -p 8000:8000 pipeline-studio-backend
```

### Frontend on Vercel

Import the same repository into Vercel with these settings:

- Root Directory: `frontend`
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

Add this Vercel environment variable using your deployed Render URL:

```text
REACT_APP_API_URL=https://your-render-service.onrender.com
```

Do not add a trailing slash. Redeploy the frontend after changing this value,
because Create React App embeds environment variables at build time. The
included `vercel.json` rewrite keeps direct visits to `/builder` working.
