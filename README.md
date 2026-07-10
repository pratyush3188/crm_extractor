# 🚀 GrowEasy AI CSV Importer

An enterprise-grade, high-performance CSV importer built for **GrowEasy**. This application takes raw, unstructured CSV data, uploads it, and streams it to Google's Gemini AI to automatically map and standardize the columns into a strict CRM schema (Name, Email, Phone, Company) in real-time.

![CSV Importer](/frontend/public/favicon.ico) *(Add your screenshot here)*

## ✨ Key Features

- **🧠 AI-Powered Mapping:** Uses Google Gemini (via `@google/generative-ai`) to intelligently guess and map messy CSV columns.
- **⚡ Real-Time Streaming:** Uses **Server-Sent Events (SSE)** to stream the AI processing results directly to the browser, bypassing strict rate limits and avoiding long HTTP timeouts.
- **🚀 Virtualized UI:** Built with `@tanstack/react-virtual` to instantly render massive datasets (100,000+ rows) without freezing the browser DOM.
- **🔄 Smart Retry Mechanism:** Automatically traps rate-limit failures (429s) and provides an elegant UI to retry "Skipped Records" directly from the browser.
- **🐳 Fully Dockerized:** Includes optimized, multi-stage Docker builds for guaranteed identical execution across environments.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, TanStack Virtual, PapaParse.
- **Backend:** Node.js, Express, TypeScript, Multer, CSV-Parse.
- **AI Integration:** Google Gemini 1.5 Flash.

---

## 💻 Local Development (Non-Docker)

1. **Clone & Install**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `/backend` directory:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   ```

3. **Start the Servers**
   Open two terminals:
   - Terminal 1: `cd frontend && npm run dev`
   - Terminal 2: `cd backend && npm run dev`
   
   *Visit `http://localhost:3000` in your browser.*

---

## 🐳 Docker Deployment (Recommended)

To run the entire stack locally with zero configuration:

1. Ensure your `backend/.env` file is created and contains your `GEMINI_API_KEY`.
2. Run Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
3. Visit `http://localhost:3000`.

*(To stop the application, run `docker-compose down`)*

---

## 🌍 Production Deployment Guide

When you are ready to put this on the public internet, follow these steps to deploy the backend to **Render** and the frontend to **Vercel**.

### Step 1: Deploy Backend (Render / Railway)
1. Push this repository to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repo.
4. Settings:
   - **Root Directory:** `backend`
   - **Environment:** `Docker` (Render will automatically detect your `backend/Dockerfile`!)
   - **Environment Variables:** Add your `GEMINI_API_KEY`.
5. Deploy! Once finished, Render will give you a public URL (e.g., `https://groweasy-api.onrender.com`).

### Step 2: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and create a new Project.
2. Connect the same GitHub repo.
3. Settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Environment Variables:** Add a new variable called `NEXT_PUBLIC_API_URL` and set its value to the URL Render gave you in Step 1 (e.g., `https://groweasy-api.onrender.com`).
4. Deploy!

That's it! Your browser will now load the frontend from Vercel, and the frontend will securely stream data from your Render backend.

---

## 🧪 Testing

The backend includes a comprehensive Jest testing suite for the AI batching and CSV parsing services.
```bash
cd backend
npm run test
```
