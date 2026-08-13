# PrepAxis

An AI-powered placement preparation platform for college students. Practice mock interviews with real-time AI feedback, get questions generated around your own resume, and browse a searchable interview question bank.

🔗 **Live demo:** [prepaxis-pi.vercel.app](https://prepaxis-pi.vercel.app)

> The backend runs on Render's free tier and spins down after periods of inactivity — the first request after idle time can take up to ~50 seconds to wake up. Subsequent requests are fast.

### Try it instantly — no signup required

| Email | Password |
|---|---|
| `test1@example.com` | `password123` |

---

## Features

- 🎯 **Resume-aware mock interviews** — upload a PDF/DOCX resume and get interview questions generated around your actual experience, or practice without one
- 💬 **Real-time AI feedback** — each answer is scored and critiqued as you go, powered by Google Gemini
- 📊 **Dashboard** — track past interview attempts, scores, and recurring weak topics over time
- 📚 **Question bank** — browse interview questions by topic and difficulty; generate new AI questions and save your own personal additions alongside the shared bank
- 🔐 **Authentication** — JWT-based signup/login with hashed passwords

## Architecture

<img width="826" height="642" alt="Screenshot 2026-08-14 010054" src="https://github.com/user-attachments/assets/ab089613-eb31-43fc-beb2-31e872a52613" />




A React/TypeScript frontend sends JWT-authenticated API calls to a Node.js/Express backend. The backend is organized into five modules — Auth, Interview, Resume, Question bank, and Dashboard — which read and write to MongoDB and call Google Gemini for question generation and feedback.

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7 |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose) |
| **AI** | Google Gemini (Flash) |
| **Auth** | JWT, bcrypt |
| **File parsing** | pdf-parse, mammoth (résumé text extraction) |
| **Deployment** | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

## Project Structure

**backend/**
- `controllers/` — Request handlers (auth, interview, question, resume, dashboard)
- `models/` — Mongoose schemas (User, InterviewSession, Question, Resume, SavedQuestion)
- `routes/` — Express route definitions
- `middleware/` — Auth guard, file upload, AI rate limiting
- `services/` — Gemini API integration, resume text extraction
- `prompts/` — AI prompt templates
- `scripts/` — Demo user seed script
- `server.js`

**frontend/src/**
- `pages/` — Login, Signup, Dashboard, Interview, QuestionBank, Resume
- `context/` — Auth context
- `api/` — Axios client

## Running Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB connection string free tier works fine, or a local instance
- A Google Gemini Key

### 1. Clone the repo

```bash
git clone https://github.com/anushka12060/Prepaxis.git
cd Prepaxis
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` with your real values:
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
GEMINI_API_KEY=your-gemini-api-key
PORT=5000

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in `.env`:
VITE_API_URL=http://localhost:5000/api

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. (Optional) Seed a demo account

```bash
cd backend
npm run seed:demo
```

Creates/resets a demo user you can log in with — `test1@example.com` / `password123`.

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/signup` · `/api/auth/login` | Authentication |
| `POST /api/resume/upload` | Upload and parse a resume (PDF/DOCX) |
| `GET /api/resume` | Retrieve latest resume |
| `POST /api/interview/start` | Start a new mock interview session |
| `POST /api/interview/:id/answer` | Submit an answer, get AI feedback + next question |
| `POST /api/interview/:id/complete` | Finish the interview, get an overall score and summary |
| `GET /api/questions` | Browse the question bank |
| `POST /api/questions/generate` | Generate a new AI question |
| `GET /api/dashboard` | User's interview stats and history |

All routes except signup/login require a `Bearer` JWT token.

## License

MIT
