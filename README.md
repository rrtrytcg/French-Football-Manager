# Le Manager Français

A real-time multiplayer French vocabulary game for classrooms. Students answer French questions to earn virtual currency, customize their football teams, and compete in an automated league tournament.

![Version](https://img.shields.io/badge/version-1.0-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎮 What is This?

**Le Manager Français** transforms French vocabulary practice into an exciting football management experience. Perfect for classroom use, this game combines language learning with competitive team management.

### Key Features

- **Real-time Multiplayer**: Students join from their devices, teacher controls from the smartboard
- **French Vocabulary Quiz**: Answer questions to earn Euros (in-game currency)
- **Team Customization**: Design your team's jersey with 8 colors and 4 styles
- **Training & Upgrades**: Improve your team's stats (Attaque, Défense, Passes, Gardien)
- **Transfer Market**: Sign famous French footballers to boost your team
- **Mystery Boxes**: Spend 100 EUR for a chance at bonus rewards
- **Automated Matches**: 40-second question rounds followed by automatic match simulations
- **League Table**: Track wins, draws, losses, and points throughout the session

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

### Production Deployment

#### Render (Free Tier - Recommended for Classrooms)

Render offers a **free tier** perfect for classroom use. The only limitation is that the server "sleeps" after 15 minutes of inactivity and takes 30-60 seconds to wake up when someone visits.

**Setup:**
1. Go to [render.com](https://render.com) and create a free account
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `french-football-manager`
   - **Runtime**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Get your public URL (e.g., `https://french-football-manager.onrender.com`)
8. Share with students!

**Note:** If the URL shows "Loading..." for a minute, the server is just waking up from sleep. This only happens after periods of inactivity.

#### Railway (Paid - For 24/7 Uptime)

Railway provides **always-on** hosting but requires payment after the free trial. Use this if you need the game available instantly at any time without sleep delays.

**Setup:**
1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project → "Deploy from GitHub repo"
3. Connect your repository
4. Configure:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm run start`
5. Add a payment method (required for continuous uptime)
6. Deploy and get your URL

**Cost:** ~$5/month for basic uptime (pricing varies by usage)

#### Manual Deployment

```bash
npm run install:all
npm run build
npm run start
```

## 📖 How to Play

### Teacher Setup

1. **Create Room**: Click "Create Room" to generate a 4-digit code
2. **Import Vocabulary**: Paste Quizlet export (French[tab]English format)
3. **Start Session**: Set duration and click "Start Session"
4. **Start League**: When students are ready, click "Démarrer la Ligue!"
5. **Watch the Magic**: The game auto-cycles between 40s question rounds and 20s matches
6. **End League**: Click "Terminer la Ligue" when done

### Student Experience

1. **Join**: Enter the 4-digit room code and team name
2. **Customize**: Choose jersey color and style (only before league starts)
3. **Play**: Answer French questions to earn EUR 50 per correct answer
4. **Train**: Buy upgrades to improve team stats
5. **Mystery Box**: Try your luck with the EUR 100 mystery box for bonus rewards
6. **Compete**: Watch matches automatically run and climb the league table

### Game Flow

```
Lobby (Customize Teams)
    ↓
Teacher Starts League
    ↓
40s Question Round (earn Euros, buy upgrades)
    ↓
20s Match Simulation (auto-played)
    ↓
5s Results Display
    ↓
[Loop back to Question Round]
    ↓
Teacher Ends League
```

## 🎯 Mystery Box Rewards

Spend EUR 100 to open a mystery box and receive:
- **EUR Rewards**: +50, +150, or +300 EUR
- **Free Upgrades**: +1 to any stat (Attaque, Défense, Passes, Gardien)
- **Stat Boosts**: Temporary enhancements

*Note: Mystery boxes are only available during active league rounds*

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **Deployment**: Render (free) or Railway (paid 24/7)

## 📁 Project Structure

```
/server/src/
  index.js          # Express + Socket.io server
  roomStore.js      # Game logic & state management
  quiz.js           # Question generation
  constants.js      # Game balance

/client/src/
  App.jsx           # Main React app
  config.js         # Server configuration
  styles.css        # Tailwind + custom styles

howtouse.md         # Detailed user guide
```

## 🎨 Customization

### Adding Your Own Vocabulary

Import any Quizlet set using tab-separated format:
```
bonjour	hello
chat	cat
chien	dog
```

### Game Balance

Edit `server/src/constants.js` to adjust:
- Reward amounts
- Upgrade costs
- Match timing
- Mystery box odds

## 🤝 Contributing

This project was built for educational purposes. Feel free to fork and customize for your classroom needs!

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built with ❤️ for French language educators and their students.

**Ready to make French class exciting?** Deploy today and watch your students' vocabulary skills grow! 🇫🇷⚽
