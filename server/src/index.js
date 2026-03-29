import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  addStudent,
  answerQuestion,
  buyUpgrade,
  createRoom,
  getStudentState,
  importQuizletSet,
  kickStudent,
  nextQuestion,
  removeStudentBySocket,
  serializeRoom,
  serializeStudentWithCosts,
} from "./roomStore.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

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
