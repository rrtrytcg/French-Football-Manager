import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SERVER_URL } from "./config";

const socket = io(SERVER_URL, { autoConnect: true });

const defaultRoom = {
  code: "",
  cardsLoaded: 0,
  students: [],
};

const statLabels = {
  attaque: "Attaque",
  defense: "Defense",
  passes: "Passes",
  gardien: "Gardien",
};

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-teal-400/20 bg-slate-900/70 p-6 shadow-neon backdrop-blur">
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold uppercase tracking-[0.2em] text-white">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function App() {
  const [mode, setMode] = useState("student");
  const [teacherRoom, setTeacherRoom] = useState(defaultRoom);
  const [rawQuizlet, setRawQuizlet] = useState("bonjour\thello\nchat\tcat\nchien\tdog\nmerci\tthanks");
  const [teacherMessage, setTeacherMessage] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [student, setStudent] = useState(null);
  const [studentRoom, setStudentRoom] = useState(defaultRoom);
  const [question, setQuestion] = useState(null);
  const [studentMessage, setStudentMessage] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const joinedCodeRef = useRef("");

  useEffect(() => {
    const handleRoomState = (room) => {
      setTeacherRoom(room);
      if (joinedCodeRef.current && joinedCodeRef.current === room.code) {
        setStudentRoom(room);
        const me = room.students.find((entry) => entry.socketId === socket.id);
        if (me) {
          setStudent((current) => ({ ...current, ...me }));
        }
      }
    };

    const handleKicked = () => {
      setStudent(null);
      setQuestion(null);
      setStudentMessage("You were removed from the room by the teacher.");
      setStudentRoom(defaultRoom);
      joinedCodeRef.current = "";
    };

    socket.on("room:state", handleRoomState);
    socket.on("student:kicked", handleKicked);

    return () => {
      socket.off("room:state", handleRoomState);
      socket.off("student:kicked", handleKicked);
    };
  }, []);

  const createTeacherRoom = () => {
    socket.emit("teacher:create-room", {}, (response) => {
      if (!response?.ok) {
        setTeacherMessage(response?.error ?? "Unable to create room.");
        return;
      }

      setTeacherRoom(response.room);
      setTeacherMessage(`Room ${response.room.code} is live.`);
      setJoinCode(response.room.code);
    });
  };

  const importQuizlet = () => {
    if (!teacherRoom.code) {
      setTeacherMessage("Create a room first.");
      return;
    }

    socket.emit(
      "teacher:import-quizlet",
      { code: teacherRoom.code, rawText: rawQuizlet },
      (response) => {
        setTeacherMessage(
          response?.ok ? "Vocabulary imported. Students can now play." : response?.error,
        );
      },
    );
  };

  const joinRoom = () => {
    socket.emit("student:join-room", { code: joinCode, teamName }, (response) => {
      if (!response?.ok) {
        setStudentMessage(response?.error ?? "Unable to join room.");
        return;
      }

      joinedCodeRef.current = joinCode;
      setStudent(response.student);
      setStudentMessage(`Joined room ${joinCode}.`);
      setQuestion(null);
    });
  };

  const requestQuestion = () => {
    if (!joinedCodeRef.current) {
      setStudentMessage("Join a room first.");
      return;
    }

    setLoadingQuestion(true);
    socket.emit("student:get-question", { code: joinedCodeRef.current }, (response) => {
      setLoadingQuestion(false);
      if (!response?.ok) {
        setStudentMessage(response?.error ?? "Unable to load question.");
        return;
      }

      setQuestion(response.question);
      setStudentMessage("");
    });
  };

  const submitAnswer = (optionId) => {
    socket.emit(
      "student:answer-question",
      { code: joinedCodeRef.current, optionId },
      (response) => {
        if (!response?.ok) {
          setStudentMessage(response?.error ?? "Unable to submit answer.");
          return;
        }

        setStudent(response.student);
        setQuestion(null);
        setStudentMessage(
          response.correct
            ? `Correct. You earned EUR ${response.reward}.`
            : `Incorrect. Correct answer: ${response.answer}.`,
        );
      },
    );
  };

  const buyUpgrade = (stat) => {
    socket.emit(
      "student:buy-upgrade",
      { code: joinedCodeRef.current, stat },
      (response) => {
        if (!response?.ok) {
          setStudentMessage(response?.error ?? "Upgrade failed.");
          return;
        }

        setStudent(response.student);
        setStudentMessage(`${statLabels[stat]} upgraded for EUR ${response.cost}.`);
      },
    );
  };

  const kickStudent = (studentSocketId) => {
    socket.emit(
      "teacher:kick-student",
      { code: teacherRoom.code, studentSocketId },
      (response) => {
        if (!response?.ok) {
          setTeacherMessage(response?.error ?? "Kick failed.");
        }
      },
    );
  };

  const liveStudents = mode === "teacher" ? teacherRoom.students : studentRoom.students;

  return (
    <main className="min-h-screen bg-pitch px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.4em] text-teal-300">
              Classroom Match Control
            </p>
            <h1 className="font-display text-5xl font-bold uppercase tracking-[0.16em] text-white">
              Le Manager Francais
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Teacher-hosted realtime football management powered by French vocabulary.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-teal-400/20 bg-slate-900/80 p-1">
            {["student", "teacher"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`rounded-full px-5 py-2 font-display text-lg uppercase tracking-[0.16em] transition ${
                  mode === value
                    ? "bg-teal-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {mode === "teacher" ? (
              <>
                <Panel
                  title="Teacher Room"
                  subtitle="Spin up the room, load Quizlet text, and moderate the class."
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={createTeacherRoom}
                      className="rounded-full bg-teal-400 px-5 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950"
                    >
                      Create Room
                    </button>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Room Code</div>
                      <div className="font-display text-3xl font-bold text-white">
                        {teacherRoom.code || "----"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cards</div>
                      <div className="font-display text-3xl font-bold text-white">
                        {teacherRoom.cardsLoaded}
                      </div>
                    </div>
                  </div>

                  <label className="mt-6 block">
                    <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-slate-400">
                      Quizlet Paste
                    </span>
                    <textarea
                      value={rawQuizlet}
                      onChange={(event) => setRawQuizlet(event.target.value)}
                      className="h-48 w-full rounded-3xl border border-teal-400/20 bg-slate-950/80 p-4 text-slate-100 placeholder:text-slate-500"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={importQuizlet}
                    className="mt-4 rounded-full border border-teal-400/40 px-5 py-3 font-display text-lg uppercase tracking-[0.16em] text-teal-200"
                  >
                    Import Vocabulary
                  </button>

                  {teacherMessage ? <p className="mt-4 text-sm text-teal-200">{teacherMessage}</p> : null}
                </Panel>

                <Panel
                  title="Live Teams"
                  subtitle="See every team live and remove bad names instantly."
                >
                  <div className="space-y-3">
                    {teacherRoom.students.length === 0 ? (
                      <p className="text-slate-400">No students connected yet.</p>
                    ) : (
                      teacherRoom.students.map((entry) => (
                        <div
                          key={entry.socketId}
                          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <div className="font-display text-2xl uppercase tracking-[0.12em] text-white">
                              {entry.teamName}
                            </div>
                            <div className="mt-1 text-sm text-slate-400">
                              EUR {entry.euros} • A {entry.stats.attaque} • D {entry.stats.defense} • P{" "}
                              {entry.stats.passes} • G {entry.stats.gardien}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => kickStudent(entry.socketId)}
                            className="rounded-full border border-rose-400/40 px-4 py-2 font-display uppercase tracking-[0.14em] text-rose-200"
                          >
                            Kick
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </Panel>
              </>
            ) : (
              <>
                <Panel
                  title="Join Room"
                  subtitle="Enter the code, claim a team, and start climbing the table."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={joinCode}
                      onChange={(event) => setJoinCode(event.target.value)}
                      placeholder="4-digit room code"
                      className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500"
                    />
                    <input
                      value={teamName}
                      onChange={(event) => setTeamName(event.target.value)}
                      placeholder="Team name"
                      className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={joinRoom}
                    className="mt-4 rounded-full bg-gold px-5 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950"
                  >
                    Join Room
                  </button>
                  {studentMessage ? <p className="mt-4 text-sm text-teal-200">{studentMessage}</p> : null}
                </Panel>

                <Panel
                  title="Club Office"
                  subtitle="Answer prompts, earn Euros, and train your squad."
                >
                  {!student ? (
                    <p className="text-slate-400">Join a room to unlock questions and training.</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Club</div>
                          <div className="font-display text-3xl font-bold uppercase text-white">
                            {student.teamName}
                          </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Euros</div>
                          <div className="font-display text-3xl font-bold text-gold">EUR {student.euros}</div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Streak</div>
                          <div className="font-display text-3xl font-bold text-white">{student.streak}</div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-teal-400/20 bg-slate-950/80 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <h3 className="font-display text-2xl uppercase tracking-[0.14em] text-white">
                            Question Engine
                          </h3>
                          <button
                            type="button"
                            onClick={requestQuestion}
                            disabled={loadingQuestion}
                            className="rounded-full border border-teal-400/40 px-4 py-2 font-display uppercase tracking-[0.14em] text-teal-200 disabled:opacity-50"
                          >
                            {loadingQuestion ? "Loading..." : question ? "Refresh" : "New Question"}
                          </button>
                        </div>

                        {question ? (
                          <div>
                            <p className="mb-4 font-display text-4xl font-bold uppercase tracking-[0.1em] text-white">
                              {question.prompt}
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                              {question.options.map((option) => (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => submitAnswer(option.id)}
                                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-left text-white transition hover:border-teal-300/60 hover:bg-slate-800"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400">
                            Ask for a question once the teacher has loaded the vocabulary list.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="mb-4 font-display text-2xl uppercase tracking-[0.14em] text-white">
                          One-Click Training
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(statLabels).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => buyUpgrade(key)}
                              className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-gold/40"
                            >
                              <div className="font-display text-2xl font-bold uppercase tracking-[0.14em] text-white">
                                {label}
                              </div>
                              <div className="mt-2 text-slate-400">Current level: {student.stats[key]}</div>
                              <div className="mt-1 text-gold">
                                Upgrade cost: EUR {student.upgradeCosts?.[key] ?? "-"}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Panel>
              </>
            )}
          </div>

          <Panel
            title="Live Table"
            subtitle="Realtime room standings based on current club economy."
          >
            <div className="space-y-3">
              {liveStudents.length === 0 ? (
                <p className="text-slate-400">The shared table will populate as clubs join the room.</p>
              ) : (
                liveStudents
                  .slice()
                  .sort((a, b) => b.euros - a.euros)
                  .map((entry, index) => (
                    <div
                      key={entry.socketId}
                      className="grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4"
                    >
                      <div className="font-display text-3xl font-bold text-teal-300">#{index + 1}</div>
                      <div>
                        <div className="font-display text-2xl uppercase tracking-[0.12em] text-white">
                          {entry.teamName}
                        </div>
                        <div className="text-sm text-slate-400">
                          A {entry.stats.attaque} • D {entry.stats.defense} • P {entry.stats.passes} • G{" "}
                          {entry.stats.gardien}
                        </div>
                      </div>
                      <div className="font-display text-2xl font-bold text-gold">EUR {entry.euros}</div>
                    </div>
                  ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

export default App;
