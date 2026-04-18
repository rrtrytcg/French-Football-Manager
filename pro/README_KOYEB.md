# Le Manager Français — Classroom Edition

**Teach French vocabulary through live football management. Zero setup. Works on any device.**

![Version](https://img.shields.io/badge/version-1.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%3E%3D18-339933)

> 🇫🇷 Real-time multiplayer game for French teachers. Students answer vocabulary questions to earn euros, upgrade their teams, and compete in an automated league.

---

## For Teachers: Use It Now (No Install)

**Just open:** https://manager-francais.koyeb.app

1. Click **"Créer une salle"**
2. Paste your Quizlet export or click **"Use Sample A1"**
3. Share the QR code — students join instantly

No accounts. No deployment. Works on Chromebooks, iPads, phones.

---

## Deploy Your Own (Free, 3 Minutes)

Host your own version for your school — free on Koyeb, no credit card, no CLI.

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/rrtrytcg/French-Football-Manager&branch=main&name=french-football-manager&ports=3001;http;/)

**Steps:**
1. Click the button above
2. Connect your GitHub account (fork the repo if prompted)
3. Choose **Singapore** region for best performance
4. Click **Deploy** — wait 2 minutes
5. Share your `*.koyeb.app` URL with students

Koyeb free tier includes 512MB RAM, always-on during class, and native WebSocket support for Socket.io.

### Manual Koyeb Setup
- Build: Node.js 20, `npm run install:all && npm run build`
- Run: `npm run start`
- Port: 3001
- Health check: `/health`

---

## Quick Start (Developers)

```bash
git clone https://github.com/rrtrytcg/French-Football-Manager
cd French-Football-Manager
cp .env.example .env
npm run install:all
npm run dev
```
- Client: http://localhost:5173
- Server: http://localhost:3001

---

## Teacher Workflow

1. **Create Room** → 4-digit code + QR appears
2. **Import Vocabulary** → paste Quizlet export (any format: tab, comma, dash) or use built-in A1-B2 decks
3. **Start** → game auto-cycles: 40s questions → 20s match → results
4. **End** → export CSV scores

Import is forgiving — handles:
```
bonjour	hello
bonjour - hello
bonjour, hello
```

---

## Features

- Real-time multiplayer (Socket.io, up to 40 students)
- 10-second Quizlet import with live preview
- Team customization, training upgrades, transfer market
- Mystery boxes, league table, auto-save
- Teacher controls: pause, extend, export scores
- PWA support — works offline, auto-reconnects
- No student PII stored

---

## Tech Stack

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js 20, Express, Socket.io
- Deployment: Docker, Koyeb Serverless
- Quality: ESLint, Prettier, Zod validation

---

## Project Structure

```
/client/src/
  components/QuizletImporter.jsx
/server/src/
  index.js
  roomStore.js
  quiz.js
/infra/
  Dockerfile
  koyeb.yaml
```

---

## Environment Variables

See `.env.example`:
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*
ROOM_TTL_MINUTES=120
MAX_PLAYERS_PER_ROOM=40
```

---

## Contributing

PRs welcome! See CONTRIBUTING.md

## License

MIT — free for schools
