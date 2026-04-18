# CODING AGENT — French Football Manager v1.1 (Render Edition)

Implement professional upgrade for Render free tier. Repo: https://github.com/rrtrytcg/French-Football-Manager

## GOAL
Make teachers able to deploy free on Render (no card), import Quizlet in 10s, and handle sleep gracefully.

## FILES TO CREATE/MODIFY

### 1. render.yaml (root)
```yaml
services:
  - type: web
    name: french-football-manager
    env: node
    plan: free
    buildCommand: npm run install:all && npm run build
    startCommand: npm run start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

### 2. Dockerfile (root) — use existing from /mnt/data/Dockerfile
- Multi-stage node:20-alpine
- Expose 3001
- CMD ["node", "server/src/index.js"]

### 3. .env.example (root)
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*
ROOM_TTL_MINUTES=120
MAX_PLAYERS_PER_ROOM=40
```

### 4. server/src/index.js — ADD
```javascript
// Health check for Render and UptimeRobot
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

// CORS
import cors from 'cors'
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
```

### 5. server/src/quiz.js — REPLACE/ADD
Use content from /mnt/data/quiz-parser.js
- Install: npm install zod --prefix server
- Export parseQuizletText function
- Validates min 3 terms, max 500

### 6. server/data/sample-a1.json
Use /mnt/data/sample-a1.json (10 basic terms)

### 7. client/src/components/QuizletImporter.jsx
Use /mnt/data/QuizletImporter.jsx
- Auto-parse on paste
- Preview first 5 terms
- Buttons: "Use this deck" and "Use Sample A1"
- Save to localStorage 'lastDeck' and 'recentDecks'

### 8. client/src/App.jsx — MODIFY
- Import QuizletImporter
- Replace current vocab input with modal containing <QuizletImporter>
- On onImport:
  ```javascript
  const vocab = data || sampleA1
  socket.emit('teacher:setVocab', vocab)
  ```
- Add wake-up screen:
  ```javascript
  const [connecting, setConnecting] = useState(true)
  useEffect(() => {
    socket.on('connect', () => setConnecting(false))
  }, [])
  
  if (connecting) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <h2>Réveil du serveur...</h2>
      <p className="text-sm text-gray-600 mt-2">Première connexion : 30-60 secondes (Render gratuit)</p>
      <p className="text-xs text-gray-500 mt-1">Le serveur dort après 15 min d'inactivité</p>
    </div>
  )
  ```

### 9. client — ADD QR CODE
```bash
npm install qrcode.react --prefix client
```
In lobby component:
```jsx
import { QRCodeSVG } from 'qrcode.react'
<QRCodeSVG value={window.location.href + '?join=' + roomCode} size={128} />
```

### 10. package.json (root) — ENSURE SCRIPTS
```json
{
  "scripts": {
    "install:all": "npm install --prefix server && npm install --prefix client",
    "build": "npm run build --prefix client",
    "start": "npm start --prefix server",
    "dev": "concurrently "npm run dev --prefix server" "npm run dev --prefix client""
  }
}
```

### 11. .dockerignore (root)
```
node_modules
.git
**/node_modules
dist
```

### 12. README.md — REPLACE
Use content from readme_render (provided). Include honest sleep notice at top.

## TESTING CHECKLIST
- [ ] npm run install:all && npm run build && npm start works locally
- [ ] GET /health returns 200
- [ ] Paste "bonjour	hello
chat	cat" → parses 2 terms
- [ ] Paste "bonjour - hello" → parses correctly
- [ ] Click "Use Sample A1" → loads 10 terms
- [ ] Socket connecting shows wake-up screen for 2-3s
- [ ] Deploy to Render via button succeeds
- [ ] First load after 20min idle shows wake-up screen then connects

## DEPLOYMENT
1. Push to main
2. Go to render.com/deploy?repo=...
3. Select free plan
4. Wait build
5. Test /health
6. Optional: setup UptimeRobot ping every 5 min 7am-4pm

## COMMIT
"feat: Render deployment, 10s Quizlet import, wake-up screen, professional README"
