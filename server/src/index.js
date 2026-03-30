import cors from "cors";
import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import {
  addStudent,
  answerQuestion,
  buyUpgrade,
  buyPlayer,
  buyMysteryBox,
  createRoom,
  getStudentState,
  importQuizletSet,
  kickStudent,
  nextQuestion,
  removeStudentBySocket,
  serializeRoom,
  serializeStudentWithCosts,
  startSession,
  stopSession,
  startMatch,
  startPenaltyShootout,
  submitPenaltyAnswer,
} from "./roomStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  const clientDist = join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

function emitRoomState(room) {
  io.to(room.code).emit("room:state", serializeRoom(room));
}

io.on("connection", (socket) => {
  socket.on("teacher:create-room", (_, callback) => {
    const room = createRoom(socket.id);
    socket.join(room.code);
    emitRoomState(room);
    callback?.({ ok: true, room: serializeRoom(room) });
  });

  socket.on("teacher:import-quizlet", ({ code, rawText }, callback) => {
    const result = importQuizletSet(code, rawText);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({ ok: true });
  });

  socket.on("teacher:kick-student", ({ code, studentSocketId }, callback) => {
    const result = kickStudent(code, studentSocketId);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    io.to(studentSocketId).emit("student:kicked");
    io.sockets.sockets.get(studentSocketId)?.leave(code);
    emitRoomState(result.room);
    callback?.({ ok: true });
  });

  socket.on("teacher:start-session", ({ code, duration }, callback) => {
    const result = startSession(code, duration);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({ ok: true });
  });

  socket.on("teacher:stop-session", ({ code }, callback) => {
    const result = stopSession(code);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({ ok: true });
  });

  socket.on("teacher:start-match", ({ code }, callback) => {
    const result = startMatch(code, emitRoomState);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    callback?.({ ok: true });
  });

  socket.on("student:join-room", ({ code, teamName }, callback) => {
    const result = addStudent(code, socket.id, teamName);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }

    socket.join(code);
    emitRoomState(result.room);
    callback?.({ ok: true, student: serializeStudentWithCosts(result.student) });
  });

  socket.on("student:get-question", ({ code }, callback) => {
    const result = nextQuestion(code, socket.id);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    callback?.({ ok: true, question: result.question });
  });

  socket.on("student:answer-question", ({ code, optionId }, callback) => {
    const result = answerQuestion(code, socket.id, optionId);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({
      ok: true,
      correct: result.correct,
      reward: result.reward,
      answer: result.answer,
      student: serializeStudentWithCosts(result.student),
    });
  });

  socket.on("student:buy-upgrade", ({ code, stat }, callback) => {
    const result = buyUpgrade(code, socket.id, stat);
    if (result.error) {
      callback?.({ ok: false, error: result.error, cost: result.cost });
      return;
    }
    emitRoomState(result.room);
    callback?.({
      ok: true,
      cost: result.cost,
      student: serializeStudentWithCosts(result.student),
    });
  });

  socket.on("student:buy-player", ({ code, playerId }, callback) => {
    const result = buyPlayer(code, socket.id, playerId);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({
      ok: true,
      player: result.player,
      student: serializeStudentWithCosts(result.student),
    });
  });

  socket.on("student:buy-mystery-box", ({ code }, callback) => {
    console.log("Buy mystery box requested:", code, "socket:", socket.id);
    const result = buyMysteryBox(code, socket.id);
    console.log("Buy mystery box result:", result.error || "success");
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({
      ok: true,
      reward: result.reward,
      student: serializeStudentWithCosts(result.student),
    });
  });

  socket.on("teacher:start-penalty-shootout", ({ code, team1SocketId, team2SocketId }, callback) => {
    const result = startPenaltyShootout(code, team1SocketId, team2SocketId);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({
      ok: true,
      penaltyShootout: result.penaltyShootout,
    });
  });

  socket.on("student:submit-penalty-answer", ({ code, round, optionId, isCorrect }, callback) => {
    const result = submitPenaltyAnswer(code, socket.id, round, optionId, isCorrect);
    if (result.error) {
      callback?.({ ok: false, error: result.error });
      return;
    }
    emitRoomState(result.room);
    callback?.({
      ok: true,
      score: result.teamScore,
      shootout: result.shootout,
    });
  });

  socket.on("student:sync", ({ code }, callback) => {
    const state = getStudentState(code, socket.id);
    if (!state) {
      callback?.({ ok: false, error: "Student not found." });
      return;
    }
    callback?.({ ok: true, student: serializeStudentWithCosts(state.student) });
  });

  socket.on("disconnect", () => {
    const room = removeStudentBySocket(socket.id);
    if (room) {
      emitRoomState(room);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});