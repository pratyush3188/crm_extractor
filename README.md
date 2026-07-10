# 🚀 GrowEasy AI CSV Importer

An enterprise-grade, high-performance CSV importer built for **GrowEasy**. This application takes raw, unstructured CSV data, uploads it, and streams it to Google's Gemini AI to automatically map and standardize the columns into a strict CRM schema (Name, Email, Phone, Company) in real-time.

---

## ✨ Key Features

- **🧠 AI-Powered Mapping:** Uses Google Gemini 1.5 Flash to intelligently map messy, unstructured CSV columns to strict schemas.
- **⚡ Real-Time Streaming:** Uses **Server-Sent Events (SSE)** to stream the AI processing results directly to the browser, bypassing strict rate limits and avoiding long HTTP timeouts.
- **🚀 Virtualized UI:** Built with `@tanstack/react-virtual` to instantly render massive datasets (100,000+ rows) without freezing the browser DOM.
- **🔄 Smart Retry Mechanism:** Automatically traps rate-limit failures (429s) and provides an elegant UI to retry "Skipped Records" directly from the browser.
- **📱 Fully Responsive:** Beautiful Dark/Light mode UI that works flawlessly on desktop and mobile.
- **🐳 Fully Dockerized:** Includes optimized, multi-stage Docker builds for guaranteed identical execution across environments.

---

## 🛠️ Technology Stack

- **Frontend (Vercel):** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, TanStack Virtual, PapaParse.
- **Backend (Render/Railway):** Node.js, Express, TypeScript, Multer, CSV-Parse.
- **AI Integration:** `@google/generative-ai` API.

---

## 💻 Local Development (Non-Docker)

1. **Clone & Install Dependencies**
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

## 🐳 Docker Deployment (Local Testing)

To run the entire stack locally with zero configuration, using the provided `docker-compose.yml`:

1. Ensure your `backend/.env` file is created and contains your `GEMINI_API_KEY`.
2. Run Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
3. Visit `http://localhost:3000`.

*(To stop the application, run `docker-compose down`)*

---

## 🌍 Production Deployment Guide

This project is perfectly configured to be split across **Render** (for the heavy Node.js processing) and **Vercel** (for the blazing-fast React frontend). 

### Step 1: Deploy Backend to Render (Free)
1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Environment:** `Docker` (Render will automatically detect your `backend/Dockerfile`!)
4. Click **Advanced** and add an Environment Variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** *(your Google AI key)*
5. Deploy! Once finished, Render will give you a public URL (e.g., `https://groweasy-api.onrender.com`).

**💡 Pro-Tip for Render's Free Tier:** Render puts free apps to sleep after 15 minutes of inactivity. To prevent the 50-second "wake up" delay, create a free account on [UptimeRobot](https://uptimerobot.com) and set up an HTTP monitor pointing to `https://your-render-url.onrender.com/api/health` to ping it every 5 minutes!

### Step 2: Deploy Frontend to Vercel (Free)
1. Go to [Vercel](https://vercel.com) and create a new Project.
2. Import the same GitHub repo.
3. Settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit this and select the `frontend` folder.
4. Expand **Environment Variables** and add:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-render-url.onrender.com` *(Do NOT include a trailing slash)*
5. Deploy!

That's it! Your browser will now load the frontend from Vercel, and the frontend will securely stream AI data from your Render backend 24/7.

---

## 🧪 Testing

The backend includes a comprehensive Jest testing suite for the AI batching and CSV parsing services.
```bash
cd backend
npm run test
```
