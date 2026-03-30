# Agent Guidelines for French Football Manager

## Project Overview

A realtime classroom quiz application where teachers host football-themed French vocabulary games. Built with Express/Socket.io (server) and React/Vite/Tailwind (client).

This is a **single-room, teacher-hosted** MVP. Students join from their own devices; a shared smartboard displays league standings and match simulations.

## Build Commands

```bash
# Install all dependencies
npm run install:all

# Run both client and server in development mode
npm run dev

# Run only the server (port 3001)
npm run dev --workspace server
node --watch server/src/index.js

# Run only the client (port 5173)
npm run dev --workspace client

# Production build
npm run build

# Start server in production
npm start
```

**No test suite is currently configured.** If adding tests, use Vitest for both server and client.

## Architecture

### Data Models

```javascript
// Room
{
  code: string,           // 4-digit room code
  teacherSocketId: string,
  status: "lobby" | "ready" | "playing" | "match",
  cards: Card[],
  students: Map<socketId, Student>,
  matchState: MatchState | null,
  transferMarket: TransferPlayer[],
}

// Student
{
  id: string,
  socketId: string,
  teamName: string,
  euros: number,
  streak: number,
  bonusActiveUntil: number | null,
  stats: { attaque: number, defense: number, passes: number, gardien: number },
  currentQuestion: Question | null,
  askedCardIds: Set<string>,
  leagueRecord: { played: number, wins: number, draws: number, losses: number, goalsFor: number, goalsAgainst: number, points: number },
  starPlayers: string[],
}

// Card (from Quizlet)
{ id: string, term: string, definition: string }

// Question
{
  id: string,
  cardId: string,
  prompt: string,        // French term
  answer: string,       // English definition
  options: [{ id: string, label: string, isCorrect: boolean }],
}

// TransferPlayer
{ id: string, name: string, statBoosts: Partial<Stats>, cost: number, purchasedBy: string | null }

// MatchState
{
  phase: "idle" | "simulating" | "complete",
  pairings: [Student, Student][],
  results: MatchResult[],
  commentary: string[],
}
```

### Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `room:state` | Server→Client | `SerializedRoom` | Full room sync (all students, status, etc.) |
| `teacher:create-room` | Client→Server | `{}` | Create new room |
| `teacher:import-quizlet` | Client→Server | `{ code, rawText }` | Import vocabulary |
| `teacher:kick-student` | Client→Server | `{ code, studentSocketId }` | Remove student |
| `teacher:start-session` | Client→Server | `{ code }` | Start game timer |
| `teacher:stop-session` | Client→Server | `{ code }` | End session |
| `student:join-room` | Client→Server | `{ code, teamName }` | Join room |
| `student:get-question` | Client→Server | `{ code }` | Request next question |
| `student:answer-question` | Client→Server | `{ code, optionId }` | Submit answer |
| `student:buy-upgrade` | Client→Server | `{ code, stat }` | Purchase upgrade |
| `student:buy-player` | Client→Server | `{ code, playerId }` | Purchase star player |
| `student:sync` | Client→Server | `{ code }` | Request full student state |
| `student:kicked` | Server→Client | — | You were removed |
| `match:start` | Server→Client | `{ pairings, duration }` | Match simulation begins |
| `match:commentary` | Server→Client | `{ lines: string[] }` | French commentary tick |
| `match:result` | Server→Client | `{ standings }` | Match complete, new table |
| `mercatto:update` | Server→Client | `{ players }` | Transfer market changed |

All client→server events expect a callback: `(response: { ok: boolean, error?: string, ... }) => void`

## Code Style

### General

- 2-space indentation, no tabs
- No semicolons (ASI style)
- Trailing commas in multi-line objects/arrays
- Max line length: 100 characters (soft limit)

### JavaScript (Server)

- Use ES modules (`import`/`export`), not CommonJS
- File extension: `.js`
- Named exports preferred for utilities
- Error handling: return `{ error: "message" }` objects, never throw
- Early returns for error conditions
- Socket handlers: `callback?.({ ok: false, error: "..." })` on error

```javascript
// Correct
export function getRoom(code) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found." };
  return { room };
}

// Incorrect - never throw
export function getRoom(code) {
  const room = rooms.get(code);
  if (!room) throw new Error("Room not found.");
  return room;
}
```

### React (Client)

- `.jsx` for components, `.js` for utilities
- Functional components only
- Named exports for non-default components; default export for page components
- Destructure props: `function Panel({ title, children })`

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `roomCode`, `studentSocketId` |
| Functions | camelCase | `createRoom`, `buyUpgrade` |
| React Components | PascalCase | `Panel`, `App` |
| Constants | UPPER_SNAKE | `BASE_REWARD`, `STATS` |
| Socket Events | colon:prefixed | `room:state`, `teacher:create-room` |
| Files | kebab-case | `room-store.js`, `quiz.js` |

### Tailwind CSS

- `font-display` for headings (Rajdhani font)
- Custom colors: `text-gold`, `bg-pitch`, `text-teal-*`, `border-rose-*`
- `rounded-3xl` for cards/panels
- `uppercase` + `tracking-[*em]` for display text
- `backdrop-blur` for glassmorphism effects

## File Structure

```
/server/src
  index.js          # Express + Socket.io server, port 3001
  roomStore.js      # Room/student state, all game logic
  quiz.js           # Quizlet parsing, question generation
  constants.js      # Game balance constants

/client/src
  App.jsx           # Main app with teacher/student/smartboard modes
  main.jsx          # React entry point
  config.js        # SERVER_URL = "http://localhost:3001"
  styles.css       # Tailwind base + custom styles
```

## Game Constants

```javascript
BASE_REWARD = 50           // Euros per correct answer
BASE_UPGRADE_COST = 100    // Starting upgrade cost
UPGRADE_MULTIPLIER = 1.2   // cost = floor(BASE_COST * 1.2^level)
BONUS_STREAK = 5           // Correct answers to activate bonus
BONUS_DURATION_MS = 30_000 // 30 seconds
DEFAULT_STATS = { attaque: 1, defense: 1, passes: 1, gardien: 1 }
MATCH_INTERVAL_MS = 300_000 // 5 minutes
MATCH_SIM_DURATION_MS = 20_000 // 20 seconds
POINTS_WIN = 3, DRAW = 1, LOSS = 0
```

## State Management

- Server: In-memory `Map` for rooms, no database
- Client: React `useState` + Socket.io event listeners
- No Redux/MobX/external state library
- Sync via `room:state` socket events; server is authoritative

## Milestone Deliverables

### Phase 1 - Core Loop
- Room creation with 4-digit code
- Student join with unique team name
- Quizlet parser (tab-separated, French→English)
- Per-student multiple-choice questions
- Euro rewards (€50 correct, 2x with streak bonus)
- One-click training upgrades (server-validated)

### Phase 2 - Competition
- Transfer market (shared, one-time purchases)
- League table with points/goal difference
- Teacher dashboard (kick, start/stop)

### Phase 3 - Match Engine
- Automated match cycle at fixed intervals
- Match simulation with French commentary
- Smartboard spectator view
- Bye handling for odd team counts

## Port Configuration

- Server: `process.env.PORT || 3001`
- Client Dev: `5173`
- Client connects to `http://localhost:3001`
