# Le Manager Français v1.0 - Release Notes

## What's Built

### Core Game Loop ✅
- Room creation with 4-digit codes
- Quizlet vocabulary import (hideable)
- Per-student French→English questions
- Euro rewards (€50 base, 2x streak bonus)
- One-click training upgrades
- Transfer market (Mercato) with star players
- Automated match cycle (40s questions → 20s match → loop)

### New Features in v1.0

#### 🎁 Mystery Box (Boîte Mystère)
- €100 to open
- Random rewards: +€50/€150/€300, free upgrades, boosts
- Animated modal with reward reveal
- Must close modal to continue playing

#### ⚽ Penalty Shootout (Tirs au But)
- Teacher selects any 2 teams
- 5 rapid-fire questions
- Winner gets +1 league point + €100
- Real-time score display

#### 👕 Jersey Customization
- 8 colors: Bleu, Rouge, Vert, Jaune, Violet, Orange, Noir, Blanc
- 4 styles: Uni, Rayures H/V, Deux Tons
- Live preview with CSS jerseys
- Jerseys displayed in matches and league table
- Only customizable in lobby (before league starts)

#### ⏱️ League Control System
- Teacher-controlled: "Démarrer la Ligue!" / "Terminer la Ligue"
- 40-second question/training phase
- Auto-starts match when timer hits 0
- Loops until teacher ends league
- Large countdown display for students

### Classroom Features
- Smartboard view for projector
- Hideable vocabulary input
- Kick students
- Teacher dashboard with all controls
- Live league table updates

## Files Structure
```
/server/src/
  index.js          # Express + Socket.io server
  roomStore.js      # Game logic & state management
  quiz.js           # Question generation
  constants.js      # Game balance

/client/src/
  App.jsx           # Main React app with all components
  config.js         # Server URL config
  styles.css        # Tailwind + custom styles

howtouse.md         # User guide
```

## Quick Start

### Local Development
```bash
npm run install:all   # Install dependencies
npm run dev           # Start both servers
```

### Deploy to Railway
1. Push to GitHub
2. Connect repo to Railway
3. Build: `npm run install:all && npm run build`
4. Start: `npm run start`

## Game Flow
1. **Teacher**: Create Room → Import Vocabulary → Start Session
2. **Students**: Join → Customize Jersey (lobby only)
3. **Teacher**: Start League (40s timer begins)
4. **Students**: Answer questions, buy upgrades, open mystery boxes
5. **Auto**: Match starts at 0s, runs 20s, shows results 5s
6. **Loop**: Timer resets to 40s, repeat until teacher ends

## Tech Stack
- Frontend: React + Tailwind CSS + Vite
- Backend: Node.js + Express + Socket.io
- Real-time: WebSockets for live updates
- Deployment: Railway/Render ready

## Credits
Built for French language classrooms to make vocabulary practice exciting!
