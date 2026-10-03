/**
 * Guess the Word — game state & logic.
 *
 * Owns all game state and rules. Knows nothing about the DOM. Relies on
 * the globals exposed by design-terms.js (CHAIN, CONTINUABLE, pick,
 * startTerm, pickTier, checkGuess).
 *
 * ui.js drives the game through submitGuess()'s return value (immediate,
 * needed to trigger correct/wrong animations synchronously) and listens
 * for 'round', 'tick' and 'gameover' events for state changes that can
 * happen independently of a guess (a fresh round after an animation, a
 * timer tick, a timeout).
 *
 * Round flow:
 *  1. advanceRound() asks the dataset for the next term and makes it the
 *     active round (new main word, fresh tries, fresh timer), then emits
 *     'round'.
 *  2. submitGuess() checks the typed word against the active round.
 *     - Correct: score/history update immediately, but the NEXT
 *       round is not requested yet — the timer is frozen so ui.js can run
 *       its merge/next-round animation at its own pace, then call
 *       proceedToNextRound() when ready.
 *     - Wrong: a try is spent. If that was the last one, the game ends
 *       ('gameover' fires); otherwise the same round continues (timer
 *       keeps running).
 *
 * Timer reset: a plain correct answer resets the next round to the full
 * TIMER_SECONDS. If the hint was opened during that round, the next round
 * instead gets this round's leftover time + TIME_BONUS_SECONDS, capped at
 * TIMER_SECONDS (see handleCorrect()).
 *
 * Chain continuation: picking the next word never lets difficulty break an
 * otherwise-valid chain. findContinuation() looks across ALL difficulties
 * for an unused term starting with the current main word — easy, moderate
 * and hard are one mixed pool — so the chain only ever ends at a genuine
 * dead end (a word nothing in the dataset starts with, once AI-category and
 * already-used terms are excluded), never just because the one available
 * continuation happened to be the "wrong" tier for the round number. Only
 * when there's a genuine dead end (or no main word yet, i.e. a fresh game)
 * does pickNextTerm() fall back to startTerm() for a new random chain.
 *
 * Continuity across games: start() tries to resume from lastAnsweredWord —
 * the second word of the most recent correct guess, from this game or an
 * earlier one this session — instead of always picking a fresh random
 * opener. Falls back to random when there's no prior word yet, or it's a
 * dead end with no unused continuation.
 *
 * pauseTimer()/resumeTimer(): freezes/resumes the countdown without
 * touching anything else about the round — used by ui.js's AR mode (face.js)
 * while the player's face isn't detected, and while the tab is hidden.
 * resumeTimer() picks up from the exact time left when paused.
 */

const Game = (() => {
  const TIMER_SECONDS = 30; // normal reset value, and the cap on a hint-bonus round
  const TIME_BONUS_SECONDS = 10; // added to the leftover time when the hint was used

  // Difficulty climbs with the round (round = correct answers so far + 1).
  // Each level caps the length of the ANSWER word — the word the player has
  // to say or type — so the early rounds only use short, easy-to-say words
  // and longer ones arrive as the player climbs. The cap applies to every
  // pick (continuing a chain and starting a new one), on top of the existing
  // round-paced easy/moderate/hard mix for new chains. Edit this table to
  // retune: about 78% of the playable terms have answers of 6 letters or
  // fewer and 92% of 8 or fewer.
  const LEVELS = [
    { level: 1, throughRound: 8, maxAnswerLength: 6 },
    { level: 2, throughRound: 16, maxAnswerLength: 8 },
    { level: 3, throughRound: Infinity, maxAnswerLength: Infinity },
  ];

  function levelFor(round) {
    return LEVELS.find((entry) => round <= entry.throughRound) || LEVELS[LEVELS.length - 1];
  }
  const MAX_TRIES = 3;
  const TICK_MS = 100;
  const BEST_SCORE_KEY = "guessTheWordBestScore";
  const RECENT_STARTS_KEY = "guessTheWordRecentStarts";
  const RECENT_STARTS_LIMIT = 30; // don't repeat an opening word within this many games

  // AI-category terms are kept out of the game entirely: pre-marking them as
  // "used" stops getNextRound/startTerm from ever picking one as a round's
  // target, and the checkGuess() guard below covers the rare case where an
  // AI term is a same-shape alternate answer to a non-AI target.
  const EXCLUDED_TERMS = new Set(
    DESIGN_TERMS.filter((t) => t.category === "AI").map((t) => t.term)
  );

  // Every game's opening word is otherwise picked fresh each time (round 1's
  // usedTerms only ever contains EXCLUDED_TERMS), so playing several short
  // games in a row kept surfacing the same handful of easy openers. This
  // remembers recent openers across games (a simple "no repeat until the
  // cycle's been through RECENT_STARTS_LIMIT games" shuffle-bag) so each new
  // game starts with a word you haven't just seen.
  function loadRecentStarts() {
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_STARTS_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function saveRecentStarts(terms) {
    try {
      localStorage.setItem(RECENT_STARTS_KEY, JSON.stringify(terms.slice(-RECENT_STARTS_LIMIT)));
    } catch {
      /* ignore — just means cross-game variety isn't persisted this session */
    }
  }

  let state = null;
  let timerHandle = null;
  let timerDeadline = null; // ms timestamp when timer would hit 0
  let timerPaused = false; // true while paused (e.g. no face detected in AR mode)
  let pendingNextMainWord = null; // set on correct guess, consumed by proceedToNextRound()
  let pendingRoundSeconds = TIMER_SECONDS; // seconds the next round should start with
  let lastAnsweredWord = null; // second word of the most recent correct guess, across games this session

  // Finds any unused term starting with mainWord, regardless of difficulty —
  // easy/moderate/hard are a single mixed pool here, unlike getNextRound's
  // round-based tier restriction. Prefers "alive" (further-continuable)
  // options, same preference startTerm() uses for fresh chains, to keep the
  // chain going as long as possible. Returns null only on a genuine dead end.
  function findContinuation(mainWord, used, maxAnswerLength = Infinity) {
    const options = (CHAIN[mainWord] || []).filter((t) => !used.has(t.term) && t.second.length <= maxAnswerLength);
    if (!options.length) return null;
    const alive = options.filter((t) => CONTINUABLE.has(t.second));
    return pick(alive.length ? alive : options);
  }

  // The next round's term: continue the current chain at any difficulty if
  // possible, otherwise start a fresh one (round-paced difficulty, same as
  // the original design) — only reached on a genuine dead end or game start.
  function pickNextTerm(round, used) {
    const maxAnswerLength = levelFor(round).maxAnswerLength;
    if (state.currentMainWord) {
      const continuation = findContinuation(state.currentMainWord, used, maxAnswerLength);
      if (continuation) return continuation;
    }
    return startTermWithin(pickTier(round), used, maxAnswerLength);
  }

  // startTerm() (design-terms.js) with the level's answer-length cap. If
  // nothing short enough is left it falls back to the uncapped pick, so a
  // game can never stall on an empty pool.
  function startTermWithin(tier, used, maxAnswerLength) {
    if (maxAnswerLength === Infinity) return startTerm(tier, used);
    for (const t of fallbackTiers(tier)) {
      const pool = DESIGN_TERMS.filter((x) => x.difficulty === t && !used.has(x.term) && x.second.length <= maxAnswerLength);
      const alive = pool.filter((x) => CONTINUABLE.has(x.second));
      if (alive.length) return { ...pick(alive), newChain: true };
      if (pool.length) return { ...pick(pool), newChain: true };
    }
    return startTerm(tier, used);
  }

  const listeners = {};
  function on(event, cb) {
    (listeners[event] ||= []).push(cb);
  }
  function emit(event, payload) {
    (listeners[event] || []).forEach((cb) => cb(payload));
  }

  function loadBestScore() {
    try {
      return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  function saveBestScoreIfHigher(score) {
    try {
      const best = loadBestScore();
      if (score > best) {
        localStorage.setItem(BEST_SCORE_KEY, String(score));
        return score;
      }
      return best;
    } catch {
      return score;
    }
  }

  function newGameState() {
    return {
      score: 0,
      round: 1,
      tries: MAX_TRIES,
      timeRemaining: TIMER_SECONDS,
      hintUsed: false, // whether the hint was opened during the active round
      usedTerms: new Set(EXCLUDED_TERMS),
      history: [], // completed term objects, in order
      currentTarget: null, // term object for the active round
      currentMainWord: null,
      missedTerm: null,
      over: false,
    };
  }

  function getPublicState() {
    if (!state) return null;
    return {
      score: state.score,
      round: state.round,
      level: state.level,
      tries: state.tries,
      timeRemaining: state.timeRemaining,
      currentTarget: state.currentTarget,
      currentMainWord: state.currentMainWord,
      history: state.history.slice(),
      missedTerm: state.missedTerm,
      over: state.over,
      paused: timerPaused,
      bestScore: loadBestScore(),
    };
  }

  function stopTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function startTimer() {
    stopTimer();
    timerDeadline = Date.now() + state.timeRemaining * 1000;
    timerHandle = setInterval(tick, TICK_MS);
  }

  // Pausing freezes the countdown at its current value (e.g. while ui.js's
  // AR mode has lost sight of the player's face) without touching anything
  // else about the round. resumeTimer() picks up from exactly where it left
  // off — startTimer() recomputes the deadline from the preserved
  // state.timeRemaining, same as a normal round start.
  function pauseTimer() {
    if (!state || state.over || timerPaused) return;
    stopTimer();
    timerPaused = true;
    emit("pause", { state: getPublicState() });
  }

  function resumeTimer() {
    if (!state || state.over || !timerPaused) return;
    timerPaused = false;
    startTimer();
    emit("resume", { state: getPublicState() });
  }

  function tick() {
    if (!state || state.over) {
      stopTimer();
      return;
    }
    const remaining = Math.max(0, (timerDeadline - Date.now()) / 1000);
    state.timeRemaining = remaining;
    emit("tick", { timeRemaining: remaining });
    if (remaining <= 0) {
      endGame("timeout");
    }
  }

  function advanceRound(forcedNext) {
    const next = forcedNext || pickNextTerm(state.round, state.usedTerms);
    state.usedTerms.add(next.term);
    const isFirstRound = state.currentTarget === null;
    const level = levelFor(state.round).level;
    const levelUp = !isFirstRound && level > state.level;
    state.level = level;
    state.currentTarget = next;
    state.currentMainWord = next.first;
    state.tries = MAX_TRIES;
    state.timeRemaining = pendingRoundSeconds;
    state.hintUsed = false;
    timerPaused = false;
    startTimer();
    emit("round", {
      term: next,
      showNewChainMessage: !!next.newChain && !isFirstRound,
      level,
      levelUp,
      state: getPublicState(),
    });
  }

  // options.skipTerms: term strings this game must never pick (they go
  // into usedTerms, which the picker already avoids). ui.js uses it for
  // terms the current voice engine can't recognize — see voice-vosk.js.
  function start(options = {}) {
    stopTimer();
    state = newGameState();
    (options.skipTerms || []).forEach((term) => state.usedTerms.add(term));
    const recentStarts = loadRecentStarts();
    recentStarts.forEach((term) => state.usedTerms.add(term));
    pendingNextMainWord = null;
    pendingRoundSeconds = TIMER_SECONDS;

    // Continue from the last word correctly answered (in this or an earlier
    // game this session), so a new game doesn't just start somewhere random.
    // Falls back to the normal random opener if there's no prior word yet,
    // or that word happens to be a dead end with no unused continuation.
    const resumeTerm = lastAnsweredWord ? findContinuation(lastAnsweredWord, state.usedTerms, levelFor(1).maxAnswerLength) : null;
    advanceRound(resumeTerm || undefined);

    if (state.currentTarget) {
      saveRecentStarts([...recentStarts, state.currentTarget.term]);
    }
  }

  // Called by ui.js when the player opens the hint on the active round.
  function useHint() {
    if (state && !state.over) state.hintUsed = true;
  }

  // Same case/space/hyphen-insensitive normalization checkGuess() itself
  // uses, reused here so "WIREFRAME", "wire frame" and "wire-frame" all
  // compare equal to the dataset's "wireframe".
  function normalizeForMatch(s) {
    return (s || "").toLowerCase().replace(/[\s-]+/g, "");
  }

  // Shared by submitGuess() (which scores/advances the round) and
  // wouldAccept() (a side-effect-free dry run ui.js uses to test a spoken
  // fragment the instant it arrives, before deciding whether to commit to
  // it as a full guess — see wouldAccept()'s own comment for why that
  // matters). Returns the matched term object, or null.
  function resolveMatch(guess) {
    let match = checkGuess(state.currentTarget, guess);
    // checkGuess() only matches the connecting word alone (e.g. "frame").
    // Accept the complete merged term too (e.g. "wireframe") — the player
    // sees the full word forming on the card, and especially when speaking
    // the answer, saying the whole word rather than just the piece being
    // filled in is natural and shouldn't be marked wrong.
    if (!match && normalizeForMatch(guess) === normalizeForMatch(state.currentTarget.term)) {
      match = state.currentTarget;
    }
    return match && !EXCLUDED_TERMS.has(match.term) ? match : null;
  }

  function submitGuess(rawGuess) {
    if (!state || state.over) return null;
    const guess = (rawGuess || "").trim();
    if (!guess) return null;

    const match = resolveMatch(guess);
    if (match) return handleCorrect(match);
    return handleWrong();
  }

  // Side-effect-free: does NOT score, spend a try, or advance anything —
  // just answers "would this guess be accepted right now?" Used by ui.js's
  // voice-input handling to test each recognized fragment the instant it
  // arrives, so a cleanly recognized correct word is accepted immediately
  // instead of waiting to see if more (possibly irrelevant) speech follows.
  function wouldAccept(rawGuess) {
    if (!state || state.over) return false;
    const guess = (rawGuess || "").trim();
    if (!guess) return false;
    return !!resolveMatch(guess);
  }

  function handleCorrect(matchedTerm) {
    stopTimer();
    const speedBonus = Math.max(0, Math.round(state.timeRemaining));
    const points = 10 + speedBonus;

    state.score += points;
    state.history.push(matchedTerm);
    state.usedTerms.add(matchedTerm.term);
    state.round += 1;

    pendingNextMainWord = matchedTerm.second;
    lastAnsweredWord = matchedTerm.second;
    // Plain correct answer: full reset to the max. Hint was used this round:
    // leftover time + bonus instead, still capped at the max.
    pendingRoundSeconds = state.hintUsed
      ? Math.min(state.timeRemaining + TIME_BONUS_SECONDS, TIMER_SECONDS)
      : TIMER_SECONDS;

    const payload = {
      term: matchedTerm,
      points,
      speedBonus,
      state: getPublicState(),
    };
    return { result: "correct", ...payload };
  }

  // Called by ui.js once its correct-answer animation has finished.
  function proceedToNextRound() {
    if (!state || state.over) return;
    state.currentMainWord = pendingNextMainWord;
    pendingNextMainWord = null;
    advanceRound();
  }

  function handleWrong() {
    state.tries -= 1;
    const payload = { triesLeft: state.tries, state: getPublicState() };
    if (state.tries <= 0) {
      endGame("tries");
    }
    return { result: "wrong", ...payload };
  }

  function endGame(reason) {
    if (!state || state.over) return;
    stopTimer();
    state.over = true;
    state.missedTerm = state.currentTarget;
    const bestScore = saveBestScoreIfHigher(state.score);
    emit("gameover", { reason, bestScore, state: getPublicState() });
  }

  return {
    SETTINGS: { TIMER_SECONDS, TIME_BONUS_SECONDS, MAX_TRIES },
    on,
    start,
    submitGuess,
    wouldAccept,
    proceedToNextRound,
    useHint,
    pauseTimer,
    resumeTimer,
    getState: getPublicState,
    getBestScore: loadBestScore,
  };
})();
