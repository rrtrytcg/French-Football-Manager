# CODING AGENT INSTRUCTIONS — French Football Manager v1.1

Implement the Koyeb-ready professional upgrade. Work from repo: https://github.com/rrtrytcg/French-Football-Manager

## Phase 1: Infrastructure (Priority 1)

1. **Add Dockerfile** (root)
   - Use /mnt/data/Dockerfile content (already provided)
   - Multi-stage: builder (node:20-alpine) builds client, copies to server/public
   - Expose 3001, CMD ["node", "server/src/index.js"]

2. **Add .env.example** (root)
   - PORT=3001
   - NODE_ENV=production
   - CORS_ORIGIN=*
   - ROOM_TTL_MINUTES=120
   - MAX_PLAYERS_PER_ROOM=40
   - SENTRY_DSN=

3. **Add health endpoint** in server/src/index.js
   ```javascript
   app.get('/health', (req, res) => res.status(200).send('ok'))
   ```

4. **Update package.json scripts**
   - Root: "install:all": "npm install --prefix server && npm install --prefix client"
   - Root: "build": "npm run build --prefix client"
   - Root: "start": "npm start --prefix server"

## Phase 2: Quizlet Import (Priority 1)

5. **Create client/src/components/QuizletImporter.jsx**
   - Use file /mnt/data/QuizletImporter.jsx
   - Features: textarea, auto-parse on paste, preview first 5, "Use sample" button
   - Save to localStorage: lastDeck

6. **Update server/src/quiz.js**
   - Add parseQuizletText function from /mnt/data/quiz-parser.js
   - Use Zod for validation (npm install zod)
   - Export function

7. **Update socket handler** in server/src/index.js or roomStore.js
   - Listen for 'teacher:setVocab'
   - Accept string or array
   - Parse, validate, store in room.vocab
   - Return {ok, count}

8. **Add sample deck** server/data/sample-a1.json
   - Use /mnt/data/sample-a1.json

## Phase 3: Teacher UX

9. **Integrate importer in App.jsx**
   - Replace current import UI with <QuizletImporter onImport={...} />
   - On import, emit 'teacher:setVocab' and close modal
   - If onImport(null), load sample-a1.json

10. **Add QR code**
    - npm install qrcode.react --prefix client
    - In lobby, display <QRCode value={roomUrl} size={128} />

11. **Add recent decks**
    - Read localStorage.getItem('recentDecks')
    - Show 3 buttons below importer

## Phase 4: Documentation

12. **Replace README.md** with readme_koyeb content
    - Include Koyeb deploy button
    - Remove Render/Railway instructions
    - Add "For Teachers: Use It Now" section

13. **Add koyeb.yaml** (optional)
    ```yaml
    name: french-football-manager
    regions: [sin]
    ports:
      - port: 3001
        protocol: http
    ```

14. **Update server/src/index.js CORS**
    ```javascript
    import cors from 'cors'
    app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
    ```

## Phase 5: Polish

15. **Add .dockerignore**
    ```
    node_modules
    .git
    client/node_modules
    server/node_modules
    ```

16. **Test locally**
    - npm run install:all && npm run build && npm start
    - Visit /health → should return ok
    - Test Quizlet paste with tab, dash, comma formats

17. **Commit message**
    "feat: Koyeb deployment, 10s Quizlet import, professional README"

## Acceptance Criteria
- [ ] One-click Koyeb deploy works from README button
- [ ] Teacher can paste Quizlet in any format, see preview, import in <10s
- [ ] Sample deck loads instantly
- [ ] QR code displays in lobby
- [ ] /health endpoint returns 200
- [ ] No credit card required for deployment
