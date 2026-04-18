# Le Manager Français — Professional Classroom Edition

**Teach French vocabulary through live football management. Zero setup. Works on any device.**

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%3E%3D18-339933)

---

## Why teachers love it

- **30-second start**: Create room → share QR → students join. No accounts.
- **No sleep hosting**: Always-on deployment (free tier on Fly.io / Railway).
- **Curriculum-ready**: Import Quizlet, CSV, or pick from built-in A1–B2 decks.
- **Classroom-safe**: No chat, no PII, local data only, GDPR/FERPA friendly.
- **Works offline-ish**: Progressive Web App (PWA) — students reconnect automatically.

Built for French teachers who want engagement, not IT tickets.

---

## Live Demo

👉 https://managerfrancais.fly.dev

Teacher view: [demo video 90s]

---

## One-click Deploy

| Platform | Best for | Click |
|----------|----------|-------|
| **Fly.io** (recommended) | Free, always-on, global edge | [![Deploy to Fly](https://img.shields.io/badge/Deploy-Fly.io-8A2BE2)](https://fly.io/docs/apps/deploy/) |
| **Railway** | 1-click + persistent DB | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template) |
| **Render** | Classroom free tier (sleeps) | Use existing guide |

Deployment takes ~3 minutes. No credit card required on Fly.io.

---

## Teacher Workflow (On Rails)

1. **Open** your hosted URL → "Créer une salle"
2. **Choose deck**: A1 Basics, A2 Verbs, B1 Travel, or paste your Quizlet
3. **Share**: QR code + 4-digit code auto-displayed on smartboard
4. **Start**: Click "Démarrer" — game auto-cycles: 40s questions → 20s match → results
5. **End**: Export scores CSV for gradebook

No install. No login. No configuration files.

---

## Features

- Real-time multiplayer via Socket.io (up to 40 students/room)
- Vocabulary engine with spaced repetition option
- Team customization (jersey designer, 8 colors/4 styles)
- Training upgrades: Attaque, Défense, Passes, Gardien
- Transfer market with 50+ Ligue 1 players
- Mystery boxes, league table, auto-save
- Teacher controls: pause, extend time, mute student, reset round
- Accessibility: keyboard navigation, high contrast, dyslexia-friendly font option

---

## Tech Stack (Production-Ready)

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js 20, Express, Socket.io, Zod validation
- **State**: In-memory with optional Redis adapter for scale
- **Infra**: Docker, GitHub Actions CI, Fly.io, Sentry monitoring
- **Quality**: ESLint, Prettier, Vitest, Playwright E2E

---

## Quick Start (Developers)

```bash
git clone https://github.com/rrtrytcg/French-Football-Manager
cd French-Football-Manager
cp .env.example .env
npm run install:all
npm run dev
# client http://localhost:5173 | server http://localhost:3001
```

---

## Project Structure

```
/apps
  /client   # React PWA
  /server   # Node API + sockets
/packages
  /shared   # Types, constants
/infra
  Dockerfile
  fly.toml
/docs
  teacher-guide.pdf
```

---

## Roadmap to "Professional"

- [x] One-click deploy
- [x] PWA + QR join
- [ ] Built-in curriculum decks (A1-B2)
- [ ] Teacher dashboard with analytics
- [ ] LTI 1.3 integration (Google Classroom, Moodle)
- [ ] Multi-language UI (FR/EN/ES)

---

## Contributing

See CONTRIBUTING.md. PRs welcome — especially curriculum content.

---

## License

MIT — free for schools and commercial use.
