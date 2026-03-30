import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SERVER_URL } from "./config";

const socket = io(SERVER_URL, { autoConnect: true });

const defaultRoom = {
  code: "",
  cardsLoaded: 0,
  students: [],
  transferMarket: [],
  matchState: null,
  status: "lobby",
};

const statLabels = {
  attaque: "Attaque",
  defense: "Defense",
  passes: "Passes",
  gardien: "Gardien",
};

function Panel({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-teal-400/20 bg-slate-900/70 p-6 shadow-neon backdrop-blur ${className}`}>
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

function LeagueTable({ students }) {
  const sorted = [...students].sort((a, b) => {
    if (b.leagueRecord.points !== a.leagueRecord.points) {
      return b.leagueRecord.points - a.leagueRecord.points;
    }
    const aGD = a.leagueRecord.goalsFor - a.leagueRecord.goalsAgainst;
    const bGD = b.leagueRecord.goalsFor - b.leagueRecord.goalsAgainst;
    if (bGD !== aGD) return bGD - aGD;
    return b.leagueRecord.goalsFor - a.leagueRecord.goalsFor;
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[40px_1fr_50px_50px_50px_60px_60px] gap-2 px-3 py-2 text-xs uppercase tracking-[0.15em] text-slate-500">
        <div>#</div>
        <div>Club</div>
        <div>J</div>
        <div>G</div>
        <div>P</div>
        <div>GA</div>
        <div>Pts</div>
      </div>
      {sorted.map((student, index) => {
        const gd = student.leagueRecord.goalsFor - student.leagueRecord.goalsAgainst;
        return (
          <div
            key={student.socketId}
            className="grid grid-cols-[40px_1fr_50px_50px_50px_60px_60px] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3"
          >
            <div className="font-display text-2xl font-bold text-teal-300">{index + 1}</div>
            <div>
              <div className="font-display text-xl uppercase tracking-[0.1em] text-white">
                {student.teamName}
              </div>
              {student.starPlayers.length > 0 && (
                <div className="text-xs text-gold">{student.starPlayers.join(", ")}</div>
              )}
            </div>
            <div className="text-center font-display text-lg text-slate-300">
              {student.leagueRecord.played}
            </div>
            <div className="text-center font-display text-lg text-slate-300">
              {student.leagueRecord.goalsFor}
            </div>
            <div className="text-center font-display text-lg text-slate-300">
              {gd >= 0 ? `+${gd}` : gd}
            </div>
            <div className="text-center font-display text-xl font-bold text-white">
              {student.leagueRecord.points}
            </div>
          </div>
        );
      })}
      {sorted.length === 0 && (
        <p className="text-center text-slate-400">En attente des equipes...</p>
      )}
    </div>
  );
}

function SmartboardView({ room }) {
  const [commentaryIndex, setCommentaryIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [matchScores, setMatchScores] = useState([]);

  useEffect(() => {
    if (room.matchState?.commentary?.length > 0) {
      setCommentaryIndex(0);
      setDisplayedLines([]);
      const interval = setInterval(() => {
        setCommentaryIndex((prev) => {
          if (prev < room.matchState.commentary.length) {
            setDisplayedLines((lines) => [...lines, room.matchState.commentary[prev]]);
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [room.matchState?.commentary]);

  useEffect(() => {
    if (room.matchState?.results?.length > 0) {
      setMatchScores(room.matchState.results);
    }
  }, [room.matchState?.results]);

  const isSimulating = room.matchState?.phase === "simulating";

  return (
    <div className="min-h-screen bg-pitch px-8 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <p className="font-display text-lg uppercase tracking-[0.5em] text-teal-300">
            Classement de la Ligue
          </p>
          <h1 className="font-display text-7xl font-bold uppercase tracking-[0.15em] text-white">
            Le Manager Francais
          </h1>
          {isSimulating && (
            <div className="mt-6 inline-block rounded-full border border-gold/40 bg-slate-950/80 px-8 py-4">
              <p className="font-display text-3xl uppercase tracking-[0.3em] text-gold animate-pulse">
                Match en cours...
              </p>
            </div>
          )}
        </header>

        <div className="mb-12">
          <LeagueTable students={room.students} />
        </div>

        {isSimulating && displayedLines.length > 0 && (
          <div className="rounded-3xl border border-gold/30 bg-slate-950/90 p-10 text-center backdrop-blur">
            <div className="space-y-4">
              {displayedLines.map((line, i) => (
                <p
                  key={i}
                  className="font-display text-5xl font-bold uppercase tracking-[0.1em] text-gold"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {matchScores.length > 0 && !isSimulating && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {room.matchState?.pairings?.map(([home, away], i) => {
              const result = matchScores[i];
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-center"
                >
                  <div className="mb-4 font-display text-2xl uppercase tracking-[0.15em] text-slate-400">
                    Journee {i + 1}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-display text-3xl uppercase tracking-[0.1em] text-white">
                        {home}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-slate-900/80 px-6 py-4 font-display text-5xl font-bold text-gold">
                      {result?.homeGoals ?? 0} - {result?.awayGoals ?? 0}
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-3xl uppercase tracking-[0.1em] text-white">
                        {away}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {room.matchState?.byeTeam && (
              <div className="rounded-3xl border border-teal-400/30 bg-slate-950/80 p-6 text-center">
                <div className="mb-4 font-display text-2xl uppercase tracking-[0.15em] text-slate-400">
                  Bye
                </div>
                <div className="font-display text-3xl uppercase tracking-[0.1em] text-teal-300">
                  {room.matchState.byeTeam}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-16 text-center">
          <p className="font-display text-xl uppercase tracking-[0.3em] text-slate-500">
            Session Code: {room.code}
          </p>
        </footer>
      </div>
    </div>
  );
}

function TeacherDashboard({ room, onImport, onKick, onStart, onStop, onCreateRoom, onStartMatch }) {
  const [rawQuizlet, setRawQuizlet] = useState(
    "bonjour\thello\nchat\tcat\nchien\tdog\nmerci\tthanks\nbonsoir\tgood evening\noui\tyes\nnon\tno\nmaison\thouse"
  );
  const [duration, setDuration] = useState(30);
  const [message, setMessage] = useState("");
  const [showQuizlet, setShowQuizlet] = useState(true);
  const [penaltyTeam1, setPenaltyTeam1] = useState("");
  const [penaltyTeam2, setPenaltyTeam2] = useState("");

  const handleImport = () => {
    if (!room.code) {
      setMessage("Create a room first.");
      return;
    }
    onImport(rawQuizlet, setMessage);
  };

  const handleStart = () => {
    if (!room.code) {
      setMessage("Create a room first.");
      return;
    }
    onStart(duration, setMessage);
  };

  const isPlaying = room.status === "playing";
  const isSimulating = room.matchState?.phase === "simulating";

  return (
    <div className="space-y-6">
      <Panel title="Teacher Room" subtitle="Create session, load vocabulary, control the game.">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onCreateRoom}
            className="rounded-full bg-teal-400 px-5 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950"
          >
            Create Room
          </button>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Room Code</div>
            <div className="font-display text-3xl font-bold text-white">{room.code || "----"}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cards</div>
            <div className="font-display text-3xl font-bold text-white">{room.cardsLoaded}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Teams</div>
            <div className="font-display text-3xl font-bold text-white">{room.students.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</div>
            <div className={`font-display text-3xl font-bold ${isPlaying ? "text-green-400" : "text-slate-400"}`}>
              {isSimulating ? "MATCH" : isPlaying ? "LIVE" : room.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowQuizlet(!showQuizlet)}
            className="mb-2 text-sm uppercase tracking-[0.15em] text-slate-400 hover:text-white"
          >
            {showQuizlet ? "Hide Vocabulary Input" : "Show Vocabulary Input"}
          </button>
          {showQuizlet && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-slate-400">
                  Quizlet Paste (Tab-separated: French[TAB]English)
                </span>
                <textarea
                  value={rawQuizlet}
                  onChange={(e) => setRawQuizlet(e.target.value)}
                  className="h-32 w-full rounded-3xl border border-teal-400/20 bg-slate-950/80 p-4 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </label>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleImport}
                  className="rounded-full border border-teal-400/40 px-5 py-3 font-display text-lg uppercase tracking-[0.16em] text-teal-200"
                >
                  Import Vocabulary
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm uppercase tracking-[0.15em] text-slate-400">
              Duration (min):
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-center text-white"
            />
          </div>
          {isPlaying && !isSimulating && (
            <>
              <button
                type="button"
                onClick={() => onStartMatch(setMessage)}
                className="rounded-full bg-gold px-6 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950"
              >
                Start Match
              </button>
              {room.students.length >= 2 && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <select
                      value={penaltyTeam1}
                      onChange={(e) => setPenaltyTeam1(e.target.value)}
                      className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm"
                    >
                      <option value="">Equipe 1</option>
                      {room.students.map((s) => (
                        <option key={s.socketId} value={s.socketId}>{s.teamName}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 self-center">VS</span>
                    <select
                      value={penaltyTeam2}
                      onChange={(e) => setPenaltyTeam2(e.target.value)}
                      className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm"
                    >
                      <option value="">Equipe 2</option>
                      {room.students.map((s) => (
                        <option key={s.socketId} value={s.socketId}>{s.teamName}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={!penaltyTeam1 || !penaltyTeam2 || penaltyTeam1 === penaltyTeam2}
                    onClick={() => {
                      socket.emit("teacher:start-penalty-shootout", {
                        code: room.code,
                        team1SocketId: penaltyTeam1,
                        team2SocketId: penaltyTeam2
                      }, (response) => {
                        if (response?.ok) {
                          setMessage("Tirs au but demarres!");
                          setPenaltyTeam1("");
                          setPenaltyTeam2("");
                        } else {
                          setMessage(response?.error || "Erreur");
                        }
                      });
                    }}
                    className="rounded-full bg-orange-500 px-6 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-white disabled:opacity-50"
                  >
                    Demarrer Tirs au But
                  </button>
                </div>
              )}
            </>
          )}
          {isSimulating && (
            <div className="rounded-full bg-gold/20 px-6 py-3 font-display text-lg uppercase tracking-[0.14em] text-gold animate-pulse">
              Match in Progress...
            </div>
          )}
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStart}
              className="rounded-full bg-green-500 px-6 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-white"
            >
              Start Session
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="rounded-full bg-rose-500 px-6 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-white"
            >
              Stop Session
            </button>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-teal-200">{message}</p>}
      </Panel>

      <Panel title="Live Teams" subtitle="Monitor and moderate connected teams.">
        <div className="space-y-3">
          {room.students.length === 0 ? (
            <p className="text-slate-400">No students connected yet.</p>
          ) : (
            room.students.map((entry) => (
              <div
                key={entry.socketId}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-display text-2xl uppercase tracking-[0.12em] text-white">
                    {entry.teamName}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-slate-400">
                    <span>EUR {entry.euros}</span>
                    <span>
                      A {entry.stats.attaque} D {entry.stats.defense} P {entry.stats.passes} G{" "}
                      {entry.stats.gardien}
                    </span>
                    <span>Pts: {entry.leagueRecord.points}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onKick(entry.socketId)}
                  className="rounded-full border border-rose-400/40 px-4 py-2 font-display uppercase tracking-[0.14em] text-rose-200"
                >
                  Kick
                </button>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

function StudentDashboard({ student, room, onJoin, onGetQuestion, onAnswer, onUpgrade, onBuyPlayer }) {
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const handleJoin = () => {
    onJoin(joinCode, teamName, setStudentMessage);
  };

  const handleGetQuestion = () => {
    setLoadingQuestion(true);
    onGetQuestion(setLoadingQuestion, setStudentMessage);
  };

  const handleAnswer = (optionId) => {
    onAnswer(optionId, setStudentMessage, setStudentMessage);
  };

  const handleUpgrade = (stat) => {
    onUpgrade(stat, setStudentMessage);
  };

  const handleBuyPlayer = (playerId) => {
    onBuyPlayer(playerId, setStudentMessage);
  };

  if (!student) {
    return (
      <Panel title="Join Room" subtitle="Enter the code, claim a team, and start climbing the table.">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="4-digit room code"
            className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500"
          />
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={handleJoin}
          className="mt-4 rounded-full bg-gold px-5 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-slate-950"
        >
          Join Room
        </button>
        {studentMessage && <p className="mt-4 text-sm text-teal-200">{studentMessage}</p>}
      </Panel>
    );
  }

  const isSimulating = room.matchState?.phase === "simulating";

  return (
    <div className="space-y-6">
      <Panel title="Club Office" subtitle="Answer prompts, earn Euros, and train your squad.">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Club</div>
            <div className="font-display text-2xl font-bold uppercase text-white">{student.teamName}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Euros</div>
            <div className="font-display text-2xl font-bold text-gold">EUR {student.euros}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Streak</div>
            <div className="font-display text-2xl font-bold text-white">
              {student.streak}
              {student.streak >= 5 && student.bonusActiveUntil > Date.now() && (
                <span className="ml-2 text-xs text-gold">2X!</span>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Points</div>
            <div className="font-display text-2xl font-bold text-teal-300">
              {student.leagueRecord.points}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-teal-400/20 bg-slate-950/80 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-display text-2xl uppercase tracking-[0.14em] text-white">
              Question Engine
            </h3>
            <button
              type="button"
              onClick={handleGetQuestion}
              disabled={loadingQuestion || isSimulating}
              className="rounded-full border border-teal-400/40 px-4 py-2 font-display uppercase tracking-[0.14em] text-teal-200 disabled:opacity-50"
            >
              {loadingQuestion ? "Loading..." : isSimulating ? "Match..." : room.question ? "Refresh" : "New Question"}
            </button>
          </div>

          {room.question ? (
            <div>
              <p className="mb-4 font-display text-4xl font-bold uppercase tracking-[0.1em] text-white">
                {room.question.prompt}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {room.question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAnswer(option.id)}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-left text-white transition hover:border-teal-300/60 hover:bg-slate-800"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400">
              {isSimulating
                ? "Match en cours. Attendez la prochaine manche."
                : "Cliquez sur New Question quand le professeur a charge le vocabulaire."}
            </p>
          )}
        </div>

        {studentMessage && (
          <p className={`mt-4 text-sm ${studentMessage.includes("Incorrect") || studentMessage.includes("Erreur") ? "text-rose-300" : "text-teal-200"}`}>
            {studentMessage}
          </p>
        )}
      </Panel>

      {room.penaltyShootout?.phase === "active" && (
        <Panel title="⚽ TIRS AU BUT!" subtitle="5 questions rapides - le gagnant remporte un point bonus!">
          <div className="space-y-6">
            {/* Score Display */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="font-display text-2xl uppercase tracking-[0.1em] text-white">
                  {room.penaltyShootout.team1.teamName}
                </div>
                <div className="font-display text-5xl font-bold text-gold">
                  {room.penaltyShootout.team1.score}
                </div>
              </div>
              <div className="font-display text-4xl text-slate-500">-</div>
              <div className="text-center">
                <div className="font-display text-2xl uppercase tracking-[0.1em] text-white">
                  {room.penaltyShootout.team2.teamName}
                </div>
                <div className="font-display text-5xl font-bold text-gold">
                  {room.penaltyShootout.team2.score}
                </div>
              </div>
            </div>

            {/* Current Question */}
            {(() => {
              const isParticipant = room.penaltyShootout.team1.socketId === socket.id || 
                                   room.penaltyShootout.team2.socketId === socket.id;
              const myTeam = room.penaltyShootout.team1.socketId === socket.id ? room.penaltyShootout.team1 : 
                            room.penaltyShootout.team2.socketId === socket.id ? room.penaltyShootout.team2 : null;
              
              if (!isParticipant) {
                return (
                  <div className="text-center text-slate-400">
                    <p>Regardez les tirs au but en cours...</p>
                  </div>
                );
              }

              const currentRound = myTeam.answers.length + 1;
              const question = room.penaltyShootout.questions[currentRound - 1];
              
              if (!question || currentRound > 5) {
                return (
                  <div className="text-center">
                    <p className="text-teal-300 font-display text-2xl">
                      {room.penaltyShootout.phase === "complete" 
                        ? "Tirs au but termines!" 
                        : "En attente des autres joueurs..."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="rounded-3xl border border-orange-500/30 bg-slate-950/90 p-6">
                  <div className="mb-4 text-center">
                    <span className="font-display text-xl uppercase tracking-[0.2em] text-orange-400">
                      Tir {currentRound}/5
                    </span>
                  </div>
                  <p className="mb-6 font-display text-4xl font-bold uppercase tracking-[0.1em] text-white text-center">
                    {question.prompt}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {question.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          console.log("Submitting penalty answer, room code:", room.code, "round:", currentRound);
                          socket.emit("student:submit-penalty-answer", {
                            code: room.code,
                            round: currentRound,
                            optionId: option.id,
                            isCorrect: option.isCorrect
                          }, (response) => {
                            console.log("Penalty answer response:", response);
                            if (response?.ok) {
                              if (option.isCorrect) {
                                alert("✅ BUT!");
                              } else {
                                alert("❌ Rate!");
                              }
                            } else {
                              alert(response?.error || "Erreur");
                            }
                          });
                        }}
                        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-left text-white transition hover:border-orange-400/60 hover:bg-slate-800"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </Panel>
      )}

      {room.penaltyShootout?.phase === "complete" && (
        <Panel title="🏆 Resultat Tirs au But" subtitle="Le gagnant remporte 1 point bonus + 100 EUR!">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="font-display text-2xl uppercase tracking-[0.1em] text-white">
                  {room.penaltyShootout.team1.teamName}
                </div>
                <div className="font-display text-6xl font-bold text-gold">
                  {room.penaltyShootout.team1.score}
                </div>
              </div>
              <div className="font-display text-4xl text-slate-500">-</div>
              <div className="text-center">
                <div className="font-display text-2xl uppercase tracking-[0.1em] text-white">
                  {room.penaltyShootout.team2.teamName}
                </div>
                <div className="font-display text-6xl font-bold text-gold">
                  {room.penaltyShootout.team2.score}
                </div>
              </div>
            </div>
            
            {room.penaltyShootout.winner ? (
              <div className="rounded-3xl bg-green-500/20 border border-green-500/50 p-6">
                <div className="font-display text-4xl mb-2">🎉</div>
                <div className="font-display text-3xl uppercase tracking-[0.15em] text-green-400">
                  {room.penaltyShootout.winner.teamName} GAGNE!
                </div>
                <p className="mt-2 text-slate-300">+1 point bonus et +100 EUR!</p>
              </div>
            ) : room.penaltyShootout.isTie ? (
              <div className="rounded-3xl bg-yellow-500/20 border border-yellow-500/50 p-6">
                <div className="font-display text-4xl mb-2">⚖️</div>
                <div className="font-display text-3xl uppercase tracking-[0.15em] text-yellow-400">
                  MATCH NUL!
                </div>
                <p className="mt-2 text-slate-300">Aucun point bonus</p>
              </div>
            ) : null}
          </div>
        </Panel>
      )}

      {isSimulating && room.matchState?.pairings && (
        <Panel title="Match en Cours" subtitle="Votre match en direct">
          <div className="space-y-4">
            {room.matchState.pairings
              .filter(([home, away]) => home === student.teamName || away === student.teamName)
              .map(([home, away], i) => {
                const result = room.matchState.results?.find(
                  r => (r.homeTeam === home && r.awayTeam === away) ||
                       (r.homeTeam === away && r.awayTeam === home)
                );
                const isHome = home === student.teamName;
                const opponent = isHome ? away : home;
                const showScores = room.matchState.showScores;
                
                return (
                  <div key={i} className="rounded-3xl border border-gold/30 bg-slate-950/90 p-6 text-center">
                    <div className="mb-4 font-display text-xl uppercase tracking-[0.15em] text-slate-400">
                      Votre Match
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className={`font-display text-3xl uppercase tracking-[0.1em] ${isHome ? 'text-gold' : 'text-white'}`}>
                          {student.teamName}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-slate-900/80 px-6 py-4 font-display text-5xl font-bold text-gold">
                        {showScores ? (
                          `${isHome ? result?.homeGoals ?? 0 : result?.awayGoals ?? 0} - ${isHome ? result?.awayGoals ?? 0 : result?.homeGoals ?? 0}`
                        ) : (
                          "? - ?"
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-display text-3xl uppercase tracking-[0.1em] ${!isHome ? 'text-gold' : 'text-white'}`}>
                          {opponent}
                        </div>
                      </div>
                    </div>
                    {showScores && result && (
                      <div className="mt-4 font-display text-2xl text-teal-300">
                        {result.homeGoals > result.awayGoals 
                          ? (isHome ? "VICTOIRE !" : "DEFAITE")
                          : result.homeGoals < result.awayGoals
                          ? (isHome ? "DEFAITE" : "VICTOIRE !")
                          : "MATCH NUL"}
                      </div>
                    )}
                  </div>
                );
              })}
            
            {room.matchState.commentary?.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                <h4 className="mb-3 font-display text-xl uppercase tracking-[0.14em] text-white">Commentaire</h4>
                <div className="space-y-2">
                  {room.matchState.commentary.slice(-4).map((line, i) => (
                    <p key={i} className="font-display text-lg text-teal-300">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      <Panel title="One-Click Training" subtitle="Upgrade your team stats.">
        {isSimulating ? (
          <p className="text-slate-400">Entrainement bloque pendant le match.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(statLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleUpgrade(key)}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-gold/40"
              >
                <div className="font-display text-2xl font-bold uppercase tracking-[0.14em] text-white">
                  {label}
                </div>
                <div className="mt-2 text-slate-400">Niveau actuel: {student.stats[key]}</div>
                <div className="mt-1 text-gold">
                  Cout: EUR {student.upgradeCosts?.[key] ?? "-"}
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Mercato" subtitle="Sign star players to boost your team.">
        {isSimulating ? (
          <p className="text-slate-400">Mercato ferme pendant le match.</p>
        ) : room.transferMarket.length === 0 ? (
          <p className="text-slate-400">Tous les joueurs ont ete signs.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {room.transferMarket.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => handleBuyPlayer(player.id)}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-left transition hover:border-gold/40"
              >
                <div className="font-display text-xl font-bold uppercase tracking-[0.1em] text-white">
                  {player.name}
                </div>
                <div className="mt-2 space-y-1 text-sm text-slate-400">
                  {Object.entries(player.statBoosts).map(([stat, boost]) => (
                    <div key={stat}>
                      {statLabels[stat]}: +{boost}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-gold">EUR {player.cost}</div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Boite Mystere" subtitle="Tentez votre chance!">
        {isSimulating ? (
          <p className="text-slate-400">Boite Mystere fermee pendant le match.</p>
        ) : (
          <div className="rounded-3xl border border-purple-500/30 bg-slate-950/80 p-6 text-center">
            <div className="mb-4 font-display text-4xl">🎁</div>
            <p className="mb-4 text-slate-300">
              Gagnez des Euros, des ameliorations gratuites ou des boosts!
            </p>
            <div className="mb-4 space-y-2 text-sm text-slate-400">
              <div>Prix: EUR 100</div>
              <div className="text-xs">Recompenses possibles: +50 EUR, +150 EUR, +300 EUR, stats gratuites...</div>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log("Opening mystery box, room code:", room.code);
                socket.emit("student:buy-mystery-box", { code: room.code }, (response) => {
                  console.log("Mystery box response:", response);
                  if (response?.ok) {
                    setStudent(response.student);
                    alert(`🎁 ${response.reward.message}`);
                  } else {
                    alert(response?.error || "Erreur");
                  }
                });
              }}
              disabled={student.euros < 100 || !room.code}
              className="rounded-full bg-purple-500 px-6 py-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-white transition hover:bg-purple-400 disabled:opacity-50"
            >
              Ouvrir la Boite (EUR 100)
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState("student");
  const [view, setView] = useState("main");
  const [room, setRoom] = useState(defaultRoom);
  const [student, setStudent] = useState(null);
  const [question, setQuestion] = useState(null);
  const joinedCodeRef = useRef("");

  useEffect(() => {
    const handleRoomState = (newRoom) => {
      setRoom(newRoom);
      if (joinedCodeRef.current && joinedCodeRef.current === newRoom.code) {
        const me = newRoom.students.find((entry) => entry.socketId === socket.id);
        if (me) {
          setStudent((current) => ({ ...current, ...me, upgradeCosts: me.upgradeCosts }));
        }
        if (newRoom.question) {
          setQuestion(newRoom.question);
        }
      }
    };

    const handleKicked = () => {
      setStudent(null);
      setQuestion(null);
      joinedCodeRef.current = "";
    };

    socket.on("room:state", handleRoomState);
    socket.on("student:kicked", handleKicked);

    return () => {
      socket.off("room:state", handleRoomState);
      socket.off("student:kicked", handleKicked);
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socket.connected) return;
    socket.emit("teacher:create-room", {}, (response) => {
      if (response?.ok) {
        setRoom(response.room);
      }
    });
  };

  const handleImport = (rawText, setMessage) => {
    socket.emit("teacher:import-quizlet", { code: room.code, rawText }, (response) => {
      setMessage(response?.ok ? "Vocabulaire importe. Les eleves peuvent jouer." : response?.error);
    });
  };

  const handleKick = (studentSocketId) => {
    socket.emit("teacher:kick-student", { code: room.code, studentSocketId }, (response) => {
      if (!response?.ok) {
        console.error(response?.error);
      }
    });
  };

  const handleStart = (duration, setMessage) => {
    socket.emit("teacher:start-session", { code: room.code, duration }, (response) => {
      setMessage(response?.ok ? "Session demarree !" : response?.error);
    });
  };

  const handleStop = (setMessage) => {
    socket.emit("teacher:stop-session", { code: room.code }, (response) => {
      setMessage(response?.ok ? "Session arretee." : response?.error);
    });
  };

  const handleStartMatch = (setMessage) => {
    socket.emit("teacher:start-match", { code: room.code }, (response) => {
      setMessage(response?.ok ? "Match demarre !" : response?.error);
    });
  };

  const handleJoin = (joinCode, teamName, setMessage) => {
    socket.emit("student:join-room", { code: joinCode, teamName }, (response) => {
      if (!response?.ok) {
        setMessage(response?.error ?? "Impossible de rejoindre.");
        return;
      }
      joinedCodeRef.current = joinCode;
      setStudent(response.student);
      setMessage(`Rejoignez la salle ${joinCode} !`);
      setQuestion(null);
    });
  };

  const handleGetQuestion = (setLoading, setMessage) => {
    socket.emit("student:get-question", { code: joinedCodeRef.current }, (response) => {
      setLoading(false);
      if (!response?.ok) {
        setMessage(response?.error ?? "Erreur.");
        return;
      }
      setQuestion(response.question);
      setMessage("");
    });
  };

  const handleAnswer = (optionId, setMessage, setGlobalMessage) => {
    socket.emit("student:answer-question", { code: joinedCodeRef.current, optionId }, (response) => {
      if (!response?.ok) {
        setMessage(response?.error ?? "Erreur.");
        return;
      }
      setStudent(response.student);
      setQuestion(null);
      const msg = response.correct
        ? `Correct ! +EUR ${response.reward}`
        : `Incorrect. Reponse: ${response.answer}`;
      setMessage(msg);
      setGlobalMessage(msg);
    });
  };

  const handleUpgrade = (stat, setMessage) => {
    socket.emit("student:buy-upgrade", { code: joinedCodeRef.current, stat }, (response) => {
      if (!response?.ok) {
        setMessage(response?.error ?? "Erreur.");
        return;
      }
      setStudent(response.student);
      setMessage(`${statLabels[stat]} ameliore pour EUR ${response.cost}.`);
    });
  };

  const handleBuyPlayer = (playerId, setMessage) => {
    socket.emit("student:buy-player", { code: joinedCodeRef.current, playerId }, (response) => {
      if (!response?.ok) {
        setMessage(response?.error ?? "Erreur.");
        return;
      }
      setStudent(response.student);
      setMessage(`${response.player.name} signe !`);
    });
  };

  if (view === "smartboard") {
    return (
      <>
        <button
          type="button"
          onClick={() => setView("main")}
          className="fixed left-4 top-4 z-50 rounded-full border border-white/20 bg-slate-950/80 px-4 py-2 font-display text-sm uppercase tracking-[0.15em] text-white backdrop-blur"
        >
          Exit Smartboard
        </button>
        <SmartboardView room={room} />
      </>
    );
  }

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

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-teal-400/20 bg-slate-900/80 p-1">
              {["student", "teacher"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-full px-5 py-2 font-display text-lg uppercase tracking-[0.16em] transition ${
                    mode === value ? "bg-teal-400 text-slate-950" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setView("smartboard")}
              className="rounded-full border border-gold/40 bg-slate-900/80 px-4 py-2 font-display text-lg uppercase tracking-[0.14em] text-gold"
            >
              Smartboard
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {mode === "teacher" ? (
              <TeacherDashboard
                room={room}
                onImport={handleImport}
                onKick={handleKick}
                onStart={handleStart}
                onStop={handleStop}
                onCreateRoom={handleCreateRoom}
                onStartMatch={handleStartMatch}
              />
            ) : (
              <StudentDashboard
                student={student}
                room={{ ...room, question }}
                onJoin={handleJoin}
                onGetQuestion={handleGetQuestion}
                onAnswer={handleAnswer}
                onUpgrade={handleUpgrade}
                onBuyPlayer={handleBuyPlayer}
              />
            )}
          </div>

          <Panel title="League Table" subtitle="Classement en temps reel.">
            <LeagueTable students={room.students} />
          </Panel>
        </div>
      </div>
    </main>
  );
}

export default App;