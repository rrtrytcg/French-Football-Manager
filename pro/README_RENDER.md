# Le Manager Français — Classroom Edition

**Teach French vocabulary through live football management. Free hosting, zero setup.**

![Version](https://img.shields.io/badge/version-1.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%3E%3D18-339933)

> Real-time multiplayer game for French teachers. Students answer questions to earn euros, upgrade teams, and compete in an automated league.

---

## ⚠️ Hosting Note

This runs on **Render's free tier** (no credit card required). The server sleeps after 15 minutes of inactivity and takes **30-60 seconds to wake up** on first load. This is normal — see "For Teachers" below for how we handle it.

---

## For Teachers: Use It Now

**Option 1 — Use the public demo:**
https://french-football-manager.onrender.com

1. Open link 1 minute before class (let it wake up)
2. Click **"Créer une salle"**
3. Paste Quizlet or click **"Use Sample A1"**
4. Share QR code — students join

**First load shows "Waking server..." — wait 30s, then it works perfectly.**

**Option 2 — Deploy your own (free):**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rrtrytcg/French-Football-Manager)

1. Click button → connect GitHub → Create
2. Wait 3 minutes for build
3. Get your `*.onrender.com` URL

No credit card. No CLI. Free forever.

---

## Keep It Awake During School (Optional)

Render sleeps, but you can prevent it during class hours:

1. Create free account at uptimerobot.com
2. Add monitor: `https://YOUR-APP.onrender.com/health`
3. Set interval: 5 minutes, 7:00-16:00 SGT
4. Done — server stays warm

---

## Teacher Workflow (30 seconds)

1. **Create Room** → 4-digit code + QR appears automatically
2. **Import** → paste Quizlet export (any format) or use built-in decks
3. **Start** → game auto-cycles: 40s questions → 20s match
4. **End** → export CSV scores

Import accepts:
```
bonjour	hello
bonjour - hello
bonjour, hello
bonjour  hello
```

---

## Features

- Real-time multiplayer (Socket.io, up to 40 students)
- 10-second Quizlet import with live preview
- Sample A1-B2 decks built-in
- Team customization, upgrades, transfer market
- Mystery boxes, league table
- Teacher controls: pause, extend, export
- PWA — works on Chromebooks/iPads
- No student accounts, no PII stored

---

## Quick Start (Developers)

```bash
git clone https://github.com/rrtrytcg/French-Football-Manager
cd French-Football-Manager
cp .env.example .env
npm run install:all
npm run dev
```

Client: http://localhost:5173
Server: http://localhost:3001

---

## Deploy to Render

Render auto-detects settings from `render.yaml`:

- **Build:** `npm run install:all && npm run build`
- **Start:** `npm run start`
- **Plan:** Free
- **Health check:** `/health`

---

## Project Structure

```
/client/src/components/QuizletImporter.jsx
/server/src/
  index.js (with /health)
  quiz.js (parseQuizletText)
/server/data/sample-a1.json
render.yaml
Dockerfile
```

---

## Environment

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*
ROOM_TTL_MINUTES=120
MAX_PLAYERS_PER_ROOM=40
```

---

## License

MIT — free for schools
