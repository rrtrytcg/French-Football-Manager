import {
  BASE_REWARD,
  BASE_UPGRADE_COST,
  BONUS_DURATION_MS,
  BONUS_STREAK,
  DEFAULT_STATS,
  STATS,
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
    prompt: question.prompt,
    options: question.options.map(({ id, label }) => ({ id, label })),
  };
}

export function createRoom(teacherSocketId) {
  const code = makeRoomCode();
  const room = {
    code,
    teacherSocketId,
    status: "lobby",
    cards: [],
    students: new Map(),
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

  const currentLevel = student.stats[stat];
  const cost = getUpgradeCost(currentLevel);
  if (student.euros < cost) {
    return { error: "Not enough Euros.", cost };
  }

  student.euros -= cost;
  student.stats[stat] += 1;

  return { cost, student, room };
}

export function kickStudent(code, studentSocketId) {
  const room = getRoom(code);
  if (!room) {
    return { error: "Room not found." };
  }

  room.students.delete(studentSocketId);
  return { room };
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
    students: Array.from(room.students.values()).map((student) => ({
      ...serializeStudent(student),
      upgradeCosts: getUpgradePreview(student),
    })),
  };
}

export function serializeStudentWithCosts(student) {
  return {
    ...serializeStudent(student),
    upgradeCosts: getUpgradePreview(student),
  };
}
