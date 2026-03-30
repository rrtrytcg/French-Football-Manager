import {
  BASE_REWARD,
  BASE_UPGRADE_COST,
  BONUS_DURATION_MS,
  BONUS_STREAK,
  COMMENTARY_LINES,
  DEFAULT_STATS,
  MATCH_INTERVAL_MS,
  MATCH_SIM_DURATION_MS,
  MYSTERY_BOX_COST,
  MYSTERY_BOX_REWARDS,
  PENALTY_SHOOTOUT_QUESTIONS,
  PENALTY_REWARD_WINNER,
  POINTS_DRAW,
  POINTS_LOSS,
  POINTS_WIN,
  STATS,
  STAR_PLAYERS,
} from "./constants.js";
import { buildQuestion, parseQuizletText } from "./quiz.js";

const rooms = new Map();

function makeRoomCode() {
  let code = "";
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

function serializeStudent(student) {
  return {
    id: student.id,
    socketId: student.socketId,
    teamName: student.teamName,
    euros: student.euros,
    streak: student.streak,
    bonusActiveUntil: student.bonusActiveUntil,
    stats: student.stats,
    leagueRecord: student.leagueRecord,
    starPlayers: student.starPlayers,
    activeBoosts: student.activeBoosts || {},
  };
}

function getUpgradeCost(level) {
  return Math.round(BASE_UPGRADE_COST * 1.2 ** level);
}

function createQuestionForStudent(room, student) {
  const question = buildQuestion(room.cards, student.askedCardIds);
  if (!question) {
    return null;
  }

  student.currentQuestion = question;
  student.askedCardIds.add(question.cardId);

  return {
    id: question.id,
    cardId: question.cardId,
    prompt: question.prompt,
    options: question.options.map(({ id, label }) => ({ id, label })),
  };
}

function createLeagueRecord() {
  return {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function calculateTeamStrength(stats) {
  return (
    stats.attaque * 2 +
    stats.defense * 1.5 +
    stats.passes * 1 +
    stats.gardien * 2
  );
}

function simulateMatch(homeTeam, awayTeam) {
  const homeStrength = calculateTeamStrength(homeTeam.stats);
  const awayStrength = calculateTeamStrength(awayTeam.stats);

  const totalStrength = homeStrength + awayStrength;
  const homeRoll = Math.random() * totalStrength;
  const awayRoll = totalStrength - homeRoll;

  const homeGoals = Math.floor(homeRoll / (awayStrength || 1) * 3);
  const awayGoals = Math.floor(awayRoll / (homeStrength || 1) * 3);

  const commentary = [];
  const homeName = homeTeam.teamName;
  const awayName = awayTeam.teamName;

  const phases = [
    { type: "attack", team: homeName },
    { type: "save", team: awayName },
    { type: "attack", team: awayName },
    { type: "goal", team: homeGoals > 0 ? homeName : null },
    { type: "miss", team: homeGoals === 0 ? homeName : null },
    { type: "attack", team: homeName },
    { type: "goal", team: awayGoals > 0 ? awayName : null },
    { type: "miss", team: awayGoals === 0 ? awayName : null },
  ];

  for (const phase of phases) {
    if (phase.type === "goal" && !phase.team) continue;
    if (phase.type === "miss" && !phase.team) continue;

    const lines = COMMENTARY_LINES[phase.type];
    let line = lines[Math.floor(Math.random() * lines.length)];
    line = line.replace("{team}", phase.team || (phase.type === "goal" ? homeName : awayName));
    commentary.push(line);
  }

  let result;
  if (homeGoals > awayGoals) {
    result = "win";
    homeTeam.leagueRecord.wins += 1;
    homeTeam.leagueRecord.points += POINTS_WIN;
    awayTeam.leagueRecord.losses += 1;
  } else if (homeGoals < awayGoals) {
    result = "loss";
    homeTeam.leagueRecord.losses += 1;
    awayTeam.leagueRecord.wins += 1;
    awayTeam.leagueRecord.points += POINTS_WIN;
  } else {
    result = "draw";
    homeTeam.leagueRecord.draws += 1;
    homeTeam.leagueRecord.points += POINTS_DRAW;
    awayTeam.leagueRecord.draws += 1;
    awayTeam.leagueRecord.points += POINTS_DRAW;
  }

  homeTeam.leagueRecord.played += 1;
  homeTeam.leagueRecord.goalsFor += homeGoals;
  homeTeam.leagueRecord.goalsAgainst += awayGoals;
  awayTeam.leagueRecord.played += 1;
  awayTeam.leagueRecord.goalsFor += awayGoals;
  awayTeam.leagueRecord.goalsAgainst += homeGoals;

  return {
    homeTeam: homeTeam.teamName,
    awayTeam: awayTeam.teamName,
    homeGoals,
    awayGoals,
    result,
    commentary,
  };
}

function createDummyTeam() {
  return {
    id: `dummy-${Date.now()}`,
    socketId: null,
    teamName: "England",
    euros: 0,
    streak: 0,
    bonusActiveUntil: null,
    stats: { ...DEFAULT_STATS },
    currentQuestion: null,
    askedCardIds: new Set(),
    leagueRecord: createLeagueRecord(),
    starPlayers: [],
    activeBoosts: {},
    isDummy: true,
  };
}

function pairStudents(students) {
  const shuffled = [...students].sort(() => Math.random() - 0.5);
  const pairings = [];

  // If odd number, add dummy team
  if (shuffled.length % 2 === 1) {
    shuffled.push(createDummyTeam());
  }

  for (let i = 0; i < shuffled.length; i += 2) {
    pairings.push([shuffled[i], shuffled[i + 1]]);
  }

  return pairings;
}

export function createRoom(teacherSocketId) {
  const code = makeRoomCode();
  const room = {
    code,
    teacherSocketId,
    status: "lobby",
    cards: [],
    students: new Map(),
    transferMarket: STAR_PLAYERS.map((p) => ({ ...p, purchasedBy: null })),
    matchState: null,
    matchInterval: null,
    sessionDuration: 30,
    sessionStartTime: null,
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code) ?? null;
}

export function importQuizletSet(code, rawText) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }

  const cards = parseQuizletText(rawText);
  if (cards.length < 4) {
    return { error: "At least 4 valid French-English pairs are required." };
  }

  room.cards = cards;
  room.status = "ready";
  for (const student of room.students.values()) {
    student.askedCardIds.clear();
    student.currentQuestion = null;
  }

  return { room };
}

export function addStudent(code, socketId, teamName) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }

  const normalizedName = teamName.trim();
  if (!normalizedName) {
    return { error: "Team name is required." };
  }

  const duplicate = Array.from(room.students.values()).some(
    (student) => student.teamName.toLowerCase() === normalizedName.toLowerCase(),
  );
  if (duplicate) {
    return { error: "Team name already taken in this room." };
  }

  const student = {
    id: `student-${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
    socketId,
    teamName: normalizedName,
    euros: 0,
    streak: 0,
    bonusActiveUntil: null,
    stats: { ...DEFAULT_STATS },
    currentQuestion: null,
    askedCardIds: new Set(),
    leagueRecord: createLeagueRecord(),
    starPlayers: [],
    activeBoosts: {},
  };

  room.students.set(socketId, student);
  return { room, student };
}

export function removeStudentBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.students.delete(socketId)) {
      return room;
    }
  }
  return null;
}

export function getStudentState(code, socketId) {
  const room = getRoom(code);
  const student = room?.students.get(socketId);
  if (!room || !student) {
    return null;
  }

  return { room, student };
}

export function nextQuestion(code, socketId) {
  const room = getRoom(code);
  const student = room?.students.get(socketId);
  if (!room || !student) {
    return { error: "Student not found." };
  }
  if (room.cards.length < 4) {
    return { error: "Teacher must import at least 4 cards first." };
  }
  if (room.matchState?.phase === "simulating") {
    return { error: "Match in progress. Wait for the next round." };
  }

  const question = createQuestionForStudent(room, student);
  if (!question) {
    return { error: "Unable to generate question." };
  }

  return { question };
}

export function answerQuestion(code, socketId, optionId) {
  const room = getRoom(code);
  const student = room?.students.get(socketId);
  if (!room || !student || !student.currentQuestion) {
    return { error: "No active question." };
  }
  if (room.matchState?.phase === "simulating") {
    return { error: "Match in progress. Wait for the next round." };
  }

  const currentQuestion = student.currentQuestion;
  const selected = currentQuestion.options.find((option) => option.id === optionId);
  if (!selected) {
    return { error: "Answer option not found." };
  }

  const now = Date.now();
  const correct = selected.isCorrect;
  let reward = 0;

  if (correct) {
    student.streak += 1;
    const bonusActive = student.bonusActiveUntil && student.bonusActiveUntil > now;
    reward = bonusActive ? BASE_REWARD * 2 : BASE_REWARD;
    student.euros += reward;

    if (student.streak >= BONUS_STREAK) {
      student.bonusActiveUntil = now + BONUS_DURATION_MS;
    }
  } else {
    student.streak = 0;
    student.bonusActiveUntil = null;
  }

  student.currentQuestion = null;

  return {
    correct,
    reward,
    answer: currentQuestion.answer,
    student,
    room,
  };
}

export function buyUpgrade(code, socketId, stat) {
  const room = getRoom(code);
  const student = room?.students.get(socketId);
  if (!room || !student) {
    return { error: "Student not found." };
  }
  if (!STATS.includes(stat)) {
    return { error: "Unknown stat." };
  }
  if (room.matchState?.phase === "simulating") {
    return { error: "Match in progress. Upgrades locked." };
  }

  const currentLevel = student.stats[stat];
  const cost = getUpgradeCost(currentLevel);
  if (student.euros < cost) {
    return { error: "Not enough Euros.", cost };
  }

  student.euros -= cost;
  student.stats[stat] += 1;

  return { cost, student, room };
}

export function buyPlayer(code, socketId, playerId) {
  const room = getRoom(code);
  const student = room?.students.get(socketId);
  if (!room || !student) {
    return { error: "Student not found." };
  }
  if (room.matchState?.phase === "simulating") {
    return { error: "Match in progress. Transfers locked." };
  }

  const player = room.transferMarket.find((p) => p.id === playerId);
  if (!player) {
    return { error: "Player not found." };
  }
  if (player.purchasedBy) {
    return { error: "Player already purchased." };
  }
  if (student.euros < player.cost) {
    return { error: "Not enough Euros." };
  }

  student.euros -= player.cost;
  player.purchasedBy = student.id;

  for (const [stat, boost] of Object.entries(player.statBoosts)) {
    student.stats[stat] = (student.stats[stat] || 1) + boost;
  }
  student.starPlayers.push(player.name);

  return { player, student, room };
}

function getRandomMysteryBoxReward() {
  const totalWeight = MYSTERY_BOX_REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const reward of MYSTERY_BOX_REWARDS) {
    random -= reward.weight;
    if (random <= 0) {
      return reward;
    }
  }
  return MYSTERY_BOX_REWARDS[0];
}

export function buyMysteryBox(code, socketId) {
  const room = getRoom(code);
  const student = room?.students.get(socketId);
  if (!room || !student) {
    return { error: "Student not found." };
  }
  if (room.matchState?.phase === "simulating") {
    return { error: "Match in progress. Boite mystere bloquee." };
  }
  if (student.euros < MYSTERY_BOX_COST) {
    return { error: "Pas assez d'Euros pour la Boite Mystere.", cost: MYSTERY_BOX_COST };
  }

  student.euros -= MYSTERY_BOX_COST;
  const reward = getRandomMysteryBoxReward();
  
  let result = { type: reward.type, message: reward.message };
  
  if (reward.type === "euros") {
    student.euros += reward.value;
    result.value = reward.value;
  } else if (reward.type === "upgrade") {
    student.stats[reward.stat] += 1;
    result.stat = reward.stat;
  } else if (reward.type === "boost") {
    const now = Date.now();
    student.activeBoosts = student.activeBoosts || {};
    student.activeBoosts[reward.stat] = now + reward.duration;
    result.stat = reward.stat;
    result.duration = reward.duration;
  }

  return { reward: result, student, room };
}

export function startPenaltyShootout(code, team1SocketId, team2SocketId) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }
  
  const team1 = room.students.get(team1SocketId);
  const team2 = room.students.get(team2SocketId);
  
  if (!team1 || !team2) {
    return { error: "Both teams must be in the room." };
  }
  
  room.penaltyShootout = {
    phase: "active",
    team1: { socketId: team1SocketId, teamName: team1.teamName, score: 0, answers: [] },
    team2: { socketId: team2SocketId, teamName: team2.teamName, score: 0, answers: [] },
    currentRound: 0,
    questions: [],
    startedAt: Date.now(),
  };
  
  // Generate 5 questions for the shootout
  for (let i = 0; i < PENALTY_SHOOTOUT_QUESTIONS; i++) {
    const question = buildQuestion(room.cards, new Set());
    if (question) {
      room.penaltyShootout.questions.push({
        ...question,
        round: i + 1,
      });
    }
  }
  
  return { room, penaltyShootout: room.penaltyShootout };
}

export function submitPenaltyAnswer(code, socketId, round, optionId, isCorrect) {
  const room = getRoom(code);
  if (!room || !room.penaltyShootout) {
    return { error: "No penalty shootout active." };
  }
  
  const shootout = room.penaltyShootout;
  const isTeam1 = shootout.team1.socketId === socketId;
  const isTeam2 = shootout.team2.socketId === socketId;
  
  if (!isTeam1 && !isTeam2) {
    return { error: "Not a participant in this shootout." };
  }
  
  const team = isTeam1 ? shootout.team1 : shootout.team2;
  
  // Record the answer
  team.answers.push({ round, optionId, isCorrect });
  
  if (isCorrect) {
    team.score += 1;
  }
  
  // Check if shootout is complete
  const totalRounds = shootout.questions.length;
  const team1Done = shootout.team1.answers.length >= totalRounds;
  const team2Done = shootout.team2.answers.length >= totalRounds;
  
  if (team1Done && team2Done) {
    // Determine winner
    let winner = null;
    let isTie = false;
    
    if (shootout.team1.score > shootout.team2.score) {
      winner = shootout.team1;
    } else if (shootout.team2.score > shootout.team1.score) {
      winner = shootout.team2;
    } else {
      isTie = true;
    }
    
    // Award bonus
    if (winner) {
      const winnerStudent = room.students.get(winner.socketId);
      if (winnerStudent) {
        winnerStudent.euros += PENALTY_REWARD_WINNER;
        winnerStudent.leagueRecord.points += 1; // Bonus point
      }
    }
    
    shootout.phase = "complete";
    shootout.winner = winner;
    shootout.isTie = isTie;
    
    // Clear after a delay
    setTimeout(() => {
      room.penaltyShootout = null;
    }, 30000);
  }
  
  return { room, shootout, teamScore: team.score };
}

export function kickStudent(code, studentSocketId) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }

  room.students.delete(studentSocketId);
  return { room };
}

export function startSession(code, duration) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }

  room.sessionDuration = duration || 30;
  room.sessionStartTime = Date.now();
  room.status = "playing";

  return { room };
}

export function startMatch(code, emitState) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }
  if (room.status !== "playing") {
    return { error: "Session not started." };
  }
  if (room.matchState?.phase === "simulating") {
    return { error: "Match already in progress." };
  }

  runMatchCycle(room, emitState);
  return { room };
}

export function stopSession(code) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }

  if (room.matchInterval) {
    clearInterval(room.matchInterval);
    room.matchInterval = null;
  }
  room.status = "ready";
  room.matchState = { phase: "idle", pairings: [], results: [], commentary: [] };

  return { room };
}

function runMatchCycle(room, emitState) {
  const students = Array.from(room.students.values()).filter(s => !s.isDummy);
  if (students.length < 1) {
    return;
  }

  room.matchState = { phase: "simulating", pairings: [], results: [], commentary: [], showScores: false };

  const pairings = pairStudents(students);
  room.matchState.pairings = pairings.map(([home, away]) => [home.teamName, away.teamName]);

  const results = [];
  const commentary = [];

  for (const [home, away] of pairings) {
    const result = simulateMatch(home, away);
    results.push(result);
    commentary.push(...result.commentary);
  }

  room.matchState.results = results.map((r) => ({
    homeTeam: r.homeTeam,
    awayTeam: r.awayTeam,
    homeGoals: r.homeGoals,
    awayGoals: r.awayGoals,
  }));
  room.matchState.commentary = commentary;

  // Emit initial state with match starting
  if (emitState) emitState(room);

  // After match duration, show scores and emit final state
  setTimeout(() => {
    room.matchState.showScores = true;
    if (emitState) emitState(room);
    
    // Then clear after showing scores for a bit
    setTimeout(() => {
      room.matchState = { phase: "idle", pairings: [], results: [], commentary: [], showScores: false };
      room.status = "playing";
      if (emitState) emitState(room);
    }, 5000);
  }, MATCH_SIM_DURATION_MS);
}

export function getUpgradePreview(student) {
  return Object.fromEntries(STATS.map((stat) => [stat, getUpgradeCost(student.stats[stat])]));
}

export function serializeRoom(room) {
  return {
    code: room.code,
    teacherSocketId: room.teacherSocketId,
    status: room.status,
    cardsLoaded: room.cards.length,
    sessionDuration: room.sessionDuration,
    sessionStartTime: room.sessionStartTime,
    students: Array.from(room.students.values())
      .filter((student) => !student.isDummy)
      .map((student) => ({
        ...serializeStudent(student),
        upgradeCosts: getUpgradePreview(student),
      })),
    transferMarket: room.transferMarket.filter((p) => !p.purchasedBy),
    matchState: room.matchState,
    penaltyShootout: room.penaltyShootout,
  };
}

export function serializeStudentWithCosts(student) {
  return {
    ...serializeStudent(student),
    upgradeCosts: getUpgradePreview(student),
  };
}