# How to Use Le Manager Francais

## Playing Locally (Testing)

If you're testing the game on your own computer:

### Starting the Game

1. Open a terminal in the game folder
2. Type: `npm run dev`
3. Wait a few seconds - two windows will open automatically

### Using the Game

**On the Teacher Computer (Smartboard):**
1. Click **Teacher** at the top right
2. Click **Create Room**
3. Write down the 4-digit room code (e.g. "4821")
4. Paste your Quizlet vocabulary (see below)
5. Click **Import Vocabulary**
6. Set how many minutes you want the game to last
7. Click **Start Session**
8. Click the **Smartboard** button for the big display

**On Student Phones/Tablets:**
1. Students go to the same web address as the teacher
2. Click **Student**
3. Enter the room code (e.g. "4821")
4. Enter a team name
5. Click **Join Room**
6. Answer questions to earn Euros!
7. Buy upgrades and star players

### Importing Vocabulary

Your Quizlet export should look like this (one French word per line, tab between French and English):

```
bonjour    hello
chat    cat
chien    dog
merci    thanks
```

Copy your vocabulary from Quizlet (make sure it's the "export" or "print" view with tabs between words) and paste it into the Quizlet box.

---

## Playing with the Whole Class (Internet)

If you want students to join from their own phones/tablets at home or elsewhere, you need to put the game on the internet.

### Option 1: Railway (Recommended)

Railway gives you a free web address so anyone can play from anywhere.

**Step 1: Get the code onto GitHub**
1. Go to [github.com](https://github.com) and create a free account
2. Create a new "repository" (like a folder for your project)
3. Upload all the game files to that repository

**Step 2: Put it on Railway**
1. Go to [railway.app](https://railway.app) and click "Login with GitHub"
2. Click **New Project** → **Deploy from GitHub**
3. Find and select your repository
4. Railway will automatically figure out how to build it

**Step 3: Get your game link**
1. Wait a minute for Railway to build your game
2. You'll see a web address like `https://french-manager.up.railway.app`
3. That's your game link - share it with students!

**Restarting for a new class:**
- Railway keeps your game running 24/7
- When you want to start a new session, just open the link and create a new room

---

### Option 2: Render

Similar to Railway but with a slightly different interface.

**Step 1: Get the code onto GitHub** (same as above)

**Step 2: Put it on Render**
1. Go to [render.com](https://render.com) and click "Login with GitHub"
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Render will build automatically

**Step 3: Get your game link**
1. Wait a minute for Render to build your game
2. You'll see a web address like `https://french-manager.onrender.com`
3. Share that link with students!

---

## Troubleshooting

**Students can't join:**
- Make sure you're in "Student" mode on their devices
- Check the room code was entered correctly (4 digits)
- If using the internet version, make sure the teacher started the session

**The game isn't working:**
- Make sure the teacher clicked **Start Session**
- Check that vocabulary was imported (should say "Cards: 8" or similar)

**Want to change vocabulary mid-game:**
- Just paste new vocabulary and click **Import Vocabulary** again
- Students will keep their Euros and upgrades

---

## How the Game Works

- Answer French vocabulary questions correctly to earn **Euros** (EUR 50 each)
- Get **5 in a row** correct to activate **2x bonus** for 30 seconds
- Spend Euros on **upgrades** to improve your team's stats
- Sign **star players** from the Mercato for big stat boosts
- The **League Table** ranks teams by points (wins = 3 points, draws = 1 point)
- **Matches** happen automatically every 5 minutes during a session
