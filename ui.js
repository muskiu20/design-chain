/**
 * Guess the Word — rendering & animations.
 *
 * Owns all DOM interaction. Listens to Game's events and updates the
 * screen; forwards user input (typing, submitting, button clicks) to Game.
 */

(() => {
  const CORRECT_ANIM_MS = 1300;
  const CORRECT_SLOT_REVEAL_MS = 400; // show the fully filled-in slots briefly before merging into the green state
  const WRONG_ANIM_MS = 400;
  const GAMEOVER_DELAY_MS = 900;
  const CHAIN_TOAST_MS = 1200;
  const HINT_REVEAL_SECONDS = 15;

  const TIMER_RADIUS = 26;
  const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;
  const RAMP_START_SECONDS = 10; // ring starts easing from accent toward warning
  const RAMP_MID_SECONDS = 5; // ring is fully warning here, then eases toward danger + pulses

  // ---------- Element refs ----------
  const el = {
    gameScreen: document.getElementById("game-screen"),
    gameoverScreen: document.getElementById("gameover-screen"),

    hud: document.querySelector(".hud"),
    startPanel: document.getElementById("start-panel"),
    playBtn: document.getElementById("play-btn"),
    bestScoreValue: document.getElementById("best-score-value"),

    scoreValue: document.getElementById("score-value"),
    triesIndicator: document.getElementById("tries-indicator"),
    hudTimer: document.querySelector(".hud-timer"),
    timerRingProgress: document.getElementById("timer-ring-progress"),
    timerValue: document.getElementById("timer-value"),

    wordCard: document.getElementById("word-card"),
    chainToast: document.getElementById("chain-toast"),
    hintBtn: document.getElementById("hint-btn"),
    hintText: document.getElementById("hint-text"),
    mainWord: document.getElementById("main-word"),
    guessSlots: document.getElementById("guess-slots"),
    cardMerged: document.getElementById("card-merged"),
    liveRegion: document.getElementById("live-region"),

    guessForm: document.getElementById("guess-form"),
    guessInput: document.getElementById("guess-input"),

    newBestBadge: document.getElementById("new-best-badge"),
    finalScore: document.getElementById("final-score"),
    finalBest: document.getElementById("final-best"),
    playAgainBtn: document.getElementById("play-again-btn"),
    shareResultBtn: document.getElementById("share-result-btn"),
    copyConfirm: document.getElementById("copy-confirm"),
    termsCount: document.getElementById("terms-count"),
    termsList: document.getElementById("terms-list"),

    themeToggle: document.getElementById("theme-toggle"),
    offlineBadge: document.getElementById("offline-badge"),
    offlineReadyStatus: document.getElementById("offline-ready-status"),

    arLayer: document.getElementById("ar-layer"),
    cameraVideo: document.getElementById("camera-video"),
    moveIntoFrameHint: document.getElementById("move-into-frame-hint"),
    resumeCard: document.getElementById("resume-card"),
    resumeBtn: document.getElementById("resume-btn"),
    resumeBody: document.getElementById("resume-body"),
    switchToTypingBtn: document.getElementById("switch-to-typing-btn"),
    tapToSpeakBtn: document.getElementById("tap-to-speak-btn"),
    modelLoadProgress: document.getElementById("model-load-progress"),
    voiceLoadProgress: document.getElementById("voice-load-progress"),
    arHint: document.getElementById("ar-hint"),
    cameraToggleInput: document.getElementById("camera-toggle-input"),
    cameraStatusPanel: document.getElementById("camera-status-panel"),
    cameraStatusMessage: document.getElementById("camera-status-message"),
    playWithoutCameraBtn: document.getElementById("play-without-camera-btn"),
  };

  let activeSecondWord = ""; // second word of the current round, for slot rendering
  let activeTerm = null; // full term object for the current round, for the hint text
  let previousTerm = null; // the round before's term, to ignore late voice echoes of it — see isEchoOfPreviousTerm()
  let toastTimer = null;
  let wrongResetTimer = null;

  // ---------- Small helpers ----------
  function switchScreen(name) {
    el.gameScreen.classList.toggle("hidden", name !== "game");
    el.gameoverScreen.classList.toggle("hidden", name !== "gameover");
  }

  // Inside the game screen: either the pre-game start panel is showing (intro
  // only, no HUD/input) or the actual HUD + word card + input are showing
  // (playing).
  function showStartPanel() {
    el.hud.classList.add("hidden");
    el.startPanel.classList.remove("hidden");
    el.cameraStatusPanel.classList.add("hidden");
    el.wordCard.classList.add("hidden");
    el.guessForm.classList.add("hidden");
  }

  function showPlayingBoard() {
    el.hud.classList.remove("hidden");
    el.startPanel.classList.add("hidden");
    el.cameraStatusPanel.classList.add("hidden");
    el.wordCard.classList.remove("hidden");
    el.guessForm.classList.remove("hidden");
  }

  function announce(message) {
    el.liveRegion.textContent = message;
  }

  // ---------- Theme toggle ----------
  // index.html's inline <head> script already resolved data-theme to "light"
  // or "dark" (saved choice, else system preference) before first paint —
  // this just keeps the button's icon in sync and handles clicks.
  const THEME_KEY = "guessTheWordTheme";

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore — the toggle still works for this tab, just won't persist */
    }
  }

  function reflectThemeIcon(theme) {
    el.themeToggle.textContent = theme === "dark" ? "☀" : "🌙";
    el.themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }

  reflectThemeIcon(document.documentElement.getAttribute("data-theme") || "light");

  el.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    saveTheme(next);
    reflectThemeIcon(next);
    refreshRingColors();
  });

  // ---------- Timer ring ----------
  el.timerRingProgress.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);

  // Colors are read from the CSS variables (not hardcoded) so the ramp
  // automatically follows the light/dark palette in styles.css.
  function readThemeColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  let ringColors = { accent: "", warning: "", danger: "" };
  function refreshRingColors() {
    ringColors = {
      accent: readThemeColor("--accent"),
      warning: readThemeColor("--warning"),
      danger: readThemeColor("--danger"),
    };
  }
  refreshRingColors();

  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = (e) => {
      // Only follow a live system change if the user hasn't explicitly
      // chosen a theme via the toggle — an explicit choice always wins.
      let hasExplicitChoice = false;
      try {
        hasExplicitChoice = !!localStorage.getItem(THEME_KEY);
      } catch {
        /* ignore */
      }
      if (!hasExplicitChoice) {
        const next = e.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        reflectThemeIcon(next);
      }
      refreshRingColors();
    };
    if (darkModeQuery.addEventListener) darkModeQuery.addEventListener("change", onSchemeChange);
    else if (darkModeQuery.addListener) darkModeQuery.addListener(onSchemeChange);
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  // Smoothly blends accent -> warning -> danger over the last RAMP_START_SECONDS,
  // regardless of the round's total duration (so a 10s hint-penalty round is
  // already inside the ramp from the start).
  function timerRingColor(timeRemaining) {
    if (timeRemaining > RAMP_START_SECONDS) return ringColors.accent;
    if (timeRemaining > RAMP_MID_SECONDS) {
      const t = (RAMP_START_SECONDS - timeRemaining) / (RAMP_START_SECONDS - RAMP_MID_SECONDS);
      return lerpColor(ringColors.accent, ringColors.warning, t);
    }
    const t = (RAMP_MID_SECONDS - Math.max(0, timeRemaining)) / RAMP_MID_SECONDS;
    return lerpColor(ringColors.warning, ringColors.danger, t);
  }

  function setTimerRing(timeRemaining) {
    // Always scaled against the full 30s, never the round's actual (possibly
    // shorter, post-hint) duration — otherwise a short round starts with a
    // deceptively "full" ring that then drains much faster than it looks
    // like it should, which reads as the timer malfunctioning.
    const fraction = Math.max(0, Math.min(1, timeRemaining / Game.SETTINGS.TIMER_SECONDS));
    el.timerRingProgress.style.strokeDashoffset = String(TIMER_CIRCUMFERENCE * (1 - fraction));
    el.timerRingProgress.style.stroke = timerRingColor(timeRemaining);
    el.timerValue.textContent = String(Math.ceil(timeRemaining));
    el.hudTimer.classList.toggle("pulse", timeRemaining <= RAMP_MID_SECONDS);
  }

  // ---------- HUD ----------
  function updateHud(state) {
    el.scoreValue.textContent = state.score;
    const swatches = el.triesIndicator.querySelectorAll(".try-swatch");
    swatches.forEach((swatch, i) => {
      swatch.classList.toggle("lost", i >= state.tries);
    });
  }

  // ---------- Word card ----------
  function buildSlots(secondWord, typedValue) {
    el.guessSlots.innerHTML = "";
    for (let i = 0; i < secondWord.length; i++) {
      const slot = document.createElement("span");
      const isFirst = i === 0;
      const typedChar = typedValue[i];
      const char = isFirst ? secondWord[0] : typedChar;

      slot.className = "slot";
      if (isFirst) slot.classList.add("locked", "filled");
      else if (typedChar) slot.classList.add("filled");

      slot.textContent = char ? char.toUpperCase() : "";
      el.guessSlots.appendChild(slot);
    }
  }

  function renderRound(term, showNewChainMessage) {
    activeSecondWord = term.second;
    previousTerm = activeTerm;
    activeTerm = term;

    logVoiceDebugRound(term);
    clearPendingVoiceSubmit(); // a new round starts clean — no leftover fragments from the previous one

    el.wordCard.classList.remove("correct", "wrong");
    el.mainWord.textContent = term.first.toUpperCase();
    el.cardMerged.textContent = "";
    buildSlots(activeSecondWord, "");

    el.hintBtn.classList.add("hidden");
    hideHintText();
    hideArHint();

    el.guessInput.readOnly = false;
    el.guessInput.value = "";
    el.guessInput.maxLength = activeSecondWord.length;
    if (!arModeActive) el.guessInput.focus();
    if (voiceActive && micAsleep) Voice.start(); // a new word wakes the mic — its start sound doubles as a "speak now" cue

    if (showNewChainMessage) showChainToast();
  }

  // ---------- On-screen keyboard (typing mode) ----------
  // The input is locked with readOnly, never disabled, between a guess and
  // the next round: a disabled input loses focus, which closes the phone's
  // keyboard, and it can't be reopened without a tap — so the keyboard used
  // to drop after every word.
  //
  // While the keyboard is up, the page tracks the visible area above it
  // (visualViewport) and switches to a compact layout (html.kb-open in
  // styles.css) so the HUD, the card and the input all fit above the
  // keyboard even on a small phone. iOS and Chrome on Android both shrink
  // the visual viewport (not the layout viewport) when the keyboard opens.
  const KEYBOARD_MIN_HEIGHT_PX = 120; // a smaller shrink is browser chrome, not a keyboard
  const viewport = window.visualViewport;

  function updateKeyboardLayout() {
    if (!viewport) return;
    const root = document.documentElement;
    const keyboardOpen =
      document.activeElement === el.guessInput && window.innerHeight - viewport.height > KEYBOARD_MIN_HEIGHT_PX;
    root.classList.toggle("kb-open", keyboardOpen);
    if (keyboardOpen) {
      root.style.setProperty("--vv-height", `${viewport.height}px`);
      root.style.setProperty("--vv-top", `${viewport.offsetTop}px`);
    }
  }

  if (viewport) {
    viewport.addEventListener("resize", updateKeyboardLayout);
    viewport.addEventListener("scroll", updateKeyboardLayout);
  }
  el.guessInput.addEventListener("focus", updateKeyboardLayout);
  el.guessInput.addEventListener("blur", () => setTimeout(updateKeyboardLayout, 0));

  // Tapping the card or the empty space around it blurs the input on a
  // phone and drops the keyboard. Keep focus on the input for those taps
  // (the hint button still works: this only stops the focus change).
  document.querySelector(".board").addEventListener("mousedown", (e) => {
    if (!arModeActive && document.activeElement === el.guessInput) e.preventDefault();
  });
  // …and if the keyboard was dismissed anyway, a tap on the board brings it back.
  document.querySelector(".board").addEventListener("click", () => {
    if (!arModeActive && !el.guessInput.readOnly && document.activeElement !== el.guessInput && !el.guessForm.classList.contains("hidden")) {
      el.guessInput.focus();
    }
  });

  // ---------- Hint ----------
  // The hint is the term's definition, but in about 1 of 5 terms the
  // definition contains the answer word itself ("Bar containing primary
  // navigation links" for NAV + BAR), which hands the answer over. Those
  // words are blanked out. Answers of one or two letters ("in", "up") are
  // left alone: they're ordinary words that would turn the sentence into
  // gibberish, and revealing them gives little away.
  function hintTextFor(term) {
    const answer = term.second;
    if (answer.length < 3) return term.definition;
    return term.definition.replace(new RegExp(`\\b${answer}(?:s|es)?\\b`, "gi"), "____");
  }

  // In camera mode the answer is spoken, so there's nothing to tap: once
  // HINT_REVEAL_SECONDS remain, the hint is shown automatically in a
  // caption (#ar-hint). It counts as using the hint, exactly like tapping
  // the "i" does (the next round gets this round's leftover time + the
  // bonus instead of a fresh full timer). Typing mode is unchanged.
  let arHintShown = false;

  function showArHint() {
    if (arHintShown || !activeTerm) return;
    arHintShown = true;
    Game.useHint();
    el.arHint.textContent = hintTextFor(activeTerm);
    el.arHint.classList.remove("hidden");
    announce("Hint: " + hintTextFor(activeTerm));
  }

  function hideArHint() {
    arHintShown = false;
    el.arHint.classList.add("hidden");
    el.arHint.textContent = "";
  }

  function hideHintText() {
    el.hintText.classList.add("hidden");
    el.hintText.textContent = "";
  }

  el.hintBtn.addEventListener("click", () => {
    if (el.hintText.classList.contains("hidden")) {
      Game.useHint();
      el.hintText.textContent = activeTerm ? hintTextFor(activeTerm) : "";
      el.hintText.classList.remove("hidden");
      announce("Hint: " + el.hintText.textContent);
    } else {
      hideHintText();
    }
    if (!el.guessInput.readOnly) el.guessInput.focus();
  });

  function showChainToast() {
    clearTimeout(toastTimer);
    el.chainToast.classList.add("show");
    announce("New chain! " + activeSecondWord.charAt(0).toUpperCase() + " blank.");
    toastTimer = setTimeout(() => el.chainToast.classList.remove("show"), CHAIN_TOAST_MS);
  }

  // ---------- Input handling ----------
  // Feedback fires the instant every slot is filled — no need to press Enter.
  el.guessInput.addEventListener("input", () => {
    buildSlots(activeSecondWord, el.guessInput.value);
    if (activeSecondWord && el.guessInput.value.length === activeSecondWord.length) {
      submitCurrentGuess();
    }
  });

  el.guessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    submitCurrentGuess();
  });

  function submitCurrentGuess() {
    const value = el.guessInput.value.trim();
    if (!value) return;
    const result = Game.submitGuess(value);
    if (!result) return;

    if (result.result === "correct") handleCorrectFeedback(result);
    else handleWrongFeedback(result);
  }

  function handleCorrectFeedback(result) {
    updateHud(result.state);
    el.guessInput.readOnly = true;
    announce(`Correct! ${result.term.term}. Plus ${result.points} points.`);

    // The slots are already showing the complete, correct word at this
    // point (filled in live as the player typed or spoke it) — but
    // .word-card.correct hides .card-slots and shows .card-merged via a
    // hard CSS display swap, with no transition, so applying it immediately
    // meant the filled-in word was never actually visible: it went from
    // "typing/speaking" straight to the merged green state in the same
    // instant. This was especially invisible for voice, where the player
    // doesn't control the reveal pace the way typing does. A brief pause
    // here lets the completed word register before it merges.
    setTimeout(() => {
      el.cardMerged.textContent = result.term.term.toUpperCase();
      el.wordCard.classList.remove("wrong");
      el.wordCard.classList.add("correct");
    }, CORRECT_SLOT_REVEAL_MS);

    setTimeout(() => {
      Game.proceedToNextRound();
    }, CORRECT_SLOT_REVEAL_MS + CORRECT_ANIM_MS);
  }

  function handleWrongFeedback(result) {
    updateHud(result.state);
    el.wordCard.classList.remove("correct");
    // Restart the shake animation even if it's still mid-play from a fast retry.
    el.wordCard.classList.remove("wrong");
    void el.wordCard.offsetWidth; // force reflow so the animation restarts
    el.wordCard.classList.add("wrong");

    if (result.state.over) {
      announce("Wrong. Out of tries. Game over.");
      return; // the 'gameover' listener below takes over from here
    }

    announce(`Wrong. ${result.state.tries} ${result.state.tries === 1 ? "try" : "tries"} left.`);
    el.guessInput.value = "";
    el.guessInput.readOnly = true;
    buildSlots(activeSecondWord, "");
    clearTimeout(wrongResetTimer);
    wrongResetTimer = setTimeout(() => {
      el.wordCard.classList.remove("wrong");
      el.guessInput.readOnly = false;
      el.guessInput.focus();
    }, WRONG_ANIM_MS);
  }

  // ---------- Game over screen ----------
  function renderTermsList(history, missedTerm) {
    el.termsList.innerHTML = "";
    const items = history.map((term) => ({ term, missed: false }));
    if (missedTerm) items.push({ term: missedTerm, missed: true });

    items.forEach(({ term, missed }, i) => {
      const li = document.createElement("li");
      li.className = "term-card" + (missed ? " missed" : "");

      const index = document.createElement("span");
      index.className = "term-card-index";
      index.textContent = String(i + 1);
      index.setAttribute("aria-hidden", "true");

      const name = document.createElement("div");
      name.className = "term-card-name";
      name.textContent = term.term;

      const def = document.createElement("div");
      def.className = "term-card-def";
      def.textContent = term.definition;

      li.append(index, name, def);
      el.termsList.appendChild(li);
    });

    el.termsCount.textContent = `${items.length} ${items.length === 1 ? "term" : "terms"}`;
  }

  // The link people land on from a shared result: this page without any
  // query string, hash or index.html (so a shared debug/test URL never
  // leaks into it).
  function gameShareUrl() {
    return location.origin + location.pathname.replace(/index\.html$/, "");
  }

  // The shared text names the game and carries the link, so every shared
  // score doubles as an invitation to play.
  function buildResultSummary(state, bestScore, includeUrl = true) {
    const marks = state.history.map(() => "✅").join("") + (state.missedTerm ? "❌" : "");
    const lines = [`Guess the Word 🔗 — I scored ${state.score}!`, `Best: ${bestScore}`];
    if (marks) lines.push(marks);
    if (includeUrl) lines.push("", `Can you beat it? ${gameShareUrl()}`);
    return lines.join("\n");
  }

  function showGameOverScreen(state, bestScore) {
    el.finalScore.textContent = state.score;
    el.finalBest.textContent = bestScore;
    el.newBestBadge.classList.toggle("hidden", !(state.score > 0 && state.score === bestScore));
    el.copyConfirm.textContent = "";
    renderTermsList(state.history, state.missedTerm);
    switchScreen("gameover");
  }

  // Uses the phone's share sheet where there is one (the link is passed
  // separately, so the text doesn't repeat it); otherwise copies the text
  // with the link to the clipboard.
  el.shareResultBtn.addEventListener("click", async () => {
    const state = Game.getState();
    const bestScore = Game.getBestScore();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Guess the Word",
          text: buildResultSummary(state, bestScore, false),
          url: gameShareUrl(),
        });
        el.copyConfirm.textContent = "";
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return; // closed the share sheet — nothing to report
        // Any other share failure: fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(buildResultSummary(state, bestScore));
      el.copyConfirm.textContent = "Copied — paste it anywhere to challenge a friend!";
    } catch {
      el.copyConfirm.textContent = "Couldn't copy automatically — select and copy the result manually.";
    }
  });

  // ---------- AR mode (camera & face tracking) ----------
  // Everything here is purely additive rendering on top of the normal game —
  // no game rule changes. If face.js fails to load, or the camera/model
  // can't start, startWithCamera()'s catch falls back to the exact same
  // non-AR flow as if the toggle had been off the whole time.
  const CAMERA_KEY = "guessTheWordCameraEnabled";
  const LERP_FACTOR = 0.15; // card-follow smoothing per animation frame (lowered from 0.25 — see POSITION_DEADZONE_PX below)
  const POSITION_DEADZONE_PX = 5; // ignore face-position changes smaller than this — frame-to-frame detector noise, not real head movement
  const NO_FACE_PAUSE_MS = 3000; // pause the timer once no face has been seen this long
  const NO_FACE_FADE_MS = 450; // fade the card / show "move into frame" sooner, so it feels responsive
  const FACE_WIDTH_BASELINE = 160; // video-pixel face width that maps to card scale 1.0
  const CARD_SCALE_MIN = 0.85;
  const CARD_SCALE_MAX = 1.25;
  const AR_CARD_SIZE_FACTOR = 0.6; // AR word card renders at 60% size (reduced 40% per feedback)
  const CARD_GAP_ABOVE_FACE = 18; // px between the card's bottom edge and the top of the face box
  // Wait this long after the last *final* fragment before submitting a
  // spoken guess that didn't already match immediately — protects against
  // one utterance landing as two separate final results (see
  // handleVoiceResult()'s own comment). Lowered from 700ms now that live
  // interim previews (handleVoiceInterimResult) already fill the wait with
  // visible feedback — the number only needs to comfortably span a brief
  // pause between two final fragments, not feel instant on its own anymore.
  const VOICE_SUBMIT_DEBOUNCE_MS = 500;
  // How long to wait after the camera is live before starting the
  // microphone. Two real iPhone logs showed microphone sessions started
  // together with (or just before) the camera reporting themselves as
  // started — even firing `audiostart` — but hearing nothing until iOS
  // raised `audio-capture` 20s later, while sessions started after the
  // camera had been running a moment worked. The timer stays paused for
  // this wait (see startVoiceInputAfterCameraSettles()).
  const CAMERA_SETTLE_MS = 1000;

  let cameraEnabled = false;
  let arModeActive = false;
  let unsubscribeFacePosition = null;
  let unsubscribeModelLoadProgress = null;
  let unsubscribeModelLoadError = null;
  let modelLoadErrorTimer = null;
  let faceTarget = null; // latest {x, y, scale} screen-space target for the card
  let cardCurrent = { x: null, y: null, scale: 1 }; // lerp-smoothed card position
  let lastFaceSeenAt = 0;
  let arRafId = null;
  let pausedByNoFace = false;
  let pausedByVoiceNotListening = false;
  // Set when the player left the app mid-camera-game; the timer stays paused
  // until they tap "Keep playing" on the pause card — see the
  // visibilitychange handler.
  let pausedForResumeCard = false;
  // "Switch to typing" offer — see handleVoiceSilence().
  let voiceSilenceTimer = null;
  let voiceHeardThisSession = false;

  // Voice input (AR mode only — see voice.js). In AR mode the player can
  // only speak their answer, never type it — activateArMode()/
  // deactivateArMode() hide/restore the input bar unconditionally, not
  // startVoiceInput()/stopVoiceInput(), since typing isn't a fallback here.
  let voiceActive = false;
  let unsubscribeVoiceResult = null;
  let unsubscribeVoiceInterim = null;
  let unsubscribeVoiceError = null;
  let unsubscribeVoiceDebug = null;
  let unsubscribeVoiceListening = null;
  let unsubscribeVoiceSleep = null;
  let micAsleep = false; // see handleVoiceSleepChange()
  let pendingVoiceParts = []; // transcript fragments collected since the last submit
  let voiceSubmitTimer = null;
  let voiceSettleTimer = null;
  let interimMatchedGuess = ""; // an interim this utterance that would have been accepted — see handleVoiceResult()

  // ---------- Voice debug overlay (debugging only) ----------
  // Shows every recognition lifecycle signal (session start/end, speech and
  // sound starting/stopping, interim and final transcripts, errors, forced
  // restarts) with a running timestamp — what's being heard, and exactly
  // when listening starts and stops. Opt-in only, via a URL flag
  // (?debugvoice), so regular players never see this: created lazily the
  // first time it's actually needed, never part of the normal page markup.
  const VOICE_DEBUG_ENABLED = new URLSearchParams(location.search).has("debugvoice");
  // Shown in the copied debug log so a pasted log says which code ran.
  // Keep in sync with CACHE_VERSION in sw.js.
  const BUILD_VERSION = "v37";
  const VOICE_DEBUG_VISIBLE_LINES = 60; // how many lines the on-screen panel shows at once
  const VOICE_DEBUG_LOG_CAP = 1000; // how many lines "Copy" can pull from — far more than fits on screen
  const voiceDebugStartTime = performance.now(); // single shared clock for every line, regardless of source
  let voiceDebugEl = null;
  let voiceDebugLogEl = null;
  let voiceDebugCopyBtn = null;
  let voiceDebugCollapseBtn = null;
  let voiceDebugCollapsed = false;
  let voiceDebugFullLog = []; // every line this session, not just what's currently visible
  let voiceDebugCopyResetTimer = null;

  function voiceDebugElapsedSeconds() {
    return ((performance.now() - voiceDebugStartTime) / 1000).toFixed(3);
  }

  // Everything "Copy" needs to actually diagnose an issue without a
  // separate round of "what device/browser were you on" questions —
  // prepended once per copy, not stored per line.
  function buildVoiceDebugHeader() {
    return [
      "Guess the Word voice debug log",
      `Build: ${BUILD_VERSION}`,
      `Captured: ${new Date().toISOString()}`,
      `User agent: ${navigator.userAgent}`,
      `Voice.supported(): ${typeof Voice !== "undefined" ? Voice.supported() : "Voice module not loaded"}`,
      `AR mode active: ${arModeActive}`,
      `Voice active: ${voiceActive}`,
      `Camera mode preference (saved): ${loadCameraPreference()}`,
      "",
      `--- log (${voiceDebugFullLog.length} lines) ---`,
    ].join("\n");
  }

  async function copyVoiceDebugLog() {
    // The closing "copied" line puts the moment of copying on the log's own
    // clock, so a log that ends mid-session shows how long it ran after the
    // last event (e.g. 30s of silence after `audiostart` = a deaf mic).
    const copiedLine = `+${voiceDebugElapsedSeconds()}s  ◇ copied (game ${Game.getState() && !Game.getState().over ? "in progress" : "not running"})`;
    const text = buildVoiceDebugHeader() + "\n" + voiceDebugFullLog.join("\n") + "\n" + copiedLine + "\n";
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Voice debug: copy to clipboard failed", err);
      return false;
    }
  }

  function flashVoiceDebugCopyBtn(label) {
    if (!voiceDebugCopyBtn) return;
    voiceDebugCopyBtn.textContent = label;
    clearTimeout(voiceDebugCopyResetTimer);
    voiceDebugCopyResetTimer = setTimeout(() => {
      voiceDebugCopyBtn.textContent = "Copy debug log";
    }, 1500);
  }

  function ensureVoiceDebugPanel() {
    if (voiceDebugEl || !VOICE_DEBUG_ENABLED) return voiceDebugEl;

    voiceDebugEl = document.createElement("div");
    voiceDebugEl.id = "voice-debug-panel";
    voiceDebugEl.setAttribute("aria-hidden", "true");
    Object.assign(voiceDebugEl.style, {
      position: "fixed",
      left: "0",
      right: "0",
      bottom: "0",
      maxHeight: "40vh",
      display: "flex",
      flexDirection: "column",
      background: "rgba(0, 0, 0, 0.85)",
      font: "11px/1.5 ui-monospace, Menlo, Consolas, monospace",
      zIndex: "99999",
      pointerEvents: "none", // re-enabled per-element below for just the button, so this never blocks gameplay underneath
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.5em",
      padding: "0.4em 0.6em",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      color: "#9a9a9a",
    });
    const title = document.createElement("span");
    title.textContent = `voice debug · ${BUILD_VERSION}`;
    header.appendChild(title);

    voiceDebugCopyBtn = document.createElement("button");
    voiceDebugCopyBtn.type = "button";
    voiceDebugCopyBtn.textContent = "Copy debug log";
    Object.assign(voiceDebugCopyBtn.style, {
      pointerEvents: "auto",
      font: "inherit",
      color: "#fff",
      background: "#2d6cdf",
      border: "none",
      borderRadius: "4px",
      padding: "0.3em 0.7em",
      cursor: "pointer",
    });
    voiceDebugCopyBtn.addEventListener("click", async () => {
      const ok = await copyVoiceDebugLog();
      flashVoiceDebugCopyBtn(ok ? "Copied!" : "Copy failed");
    });

    voiceDebugCollapseBtn = document.createElement("button");
    voiceDebugCollapseBtn.type = "button";
    voiceDebugCollapseBtn.textContent = "▾ Collapse";
    Object.assign(voiceDebugCollapseBtn.style, {
      pointerEvents: "auto",
      font: "inherit",
      color: "#fff",
      background: "rgba(255, 255, 255, 0.15)",
      border: "none",
      borderRadius: "4px",
      padding: "0.3em 0.7em",
      cursor: "pointer",
    });
    voiceDebugCollapseBtn.addEventListener("click", () => {
      voiceDebugCollapsed = !voiceDebugCollapsed;
      voiceDebugLogEl.style.display = voiceDebugCollapsed ? "none" : "block";
      voiceDebugCollapseBtn.textContent = voiceDebugCollapsed ? "▸ Expand" : "▾ Collapse";
    });

    const hardRefreshBtn = document.createElement("button");
    hardRefreshBtn.type = "button";
    hardRefreshBtn.textContent = "Hard refresh";
    Object.assign(hardRefreshBtn.style, {
      pointerEvents: "auto",
      font: "inherit",
      color: "#fff",
      background: "#b5452f",
      border: "none",
      borderRadius: "4px",
      padding: "0.3em 0.7em",
      cursor: "pointer",
    });
    hardRefreshBtn.addEventListener("click", () => {
      hardRefreshBtn.textContent = "Refreshing…";
      hardRefresh();
    });

    const controls = document.createElement("div");
    Object.assign(controls.style, { display: "flex", gap: "0.4em" });
    controls.appendChild(hardRefreshBtn);
    controls.appendChild(voiceDebugCopyBtn);
    controls.appendChild(voiceDebugCollapseBtn);
    header.appendChild(controls);
    voiceDebugEl.appendChild(header);

    voiceDebugLogEl = document.createElement("pre");
    Object.assign(voiceDebugLogEl.style, {
      margin: "0",
      padding: "0.5em 0.75em",
      overflowY: "auto",
      color: "#7CFC00",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    });
    voiceDebugLogEl.textContent = "waiting for voice input to start…\n";
    voiceDebugEl.appendChild(voiceDebugLogEl);

    document.body.appendChild(voiceDebugEl);
    return voiceDebugEl;
  }

  // Debug only: iOS Safari has no hard-reload, and the cache-first service
  // worker otherwise needs two reloads to pick up a new deploy. Unregisters
  // the service worker, deletes its caches, and reloads from the network
  // (keeping ?debugvoice). The fresh page re-registers the service worker
  // and precaches everything again.
  async function hardRefresh() {
    // Release the microphone and camera before reloading — a real iPhone
    // log showed the reloaded page's first mic session silent when the
    // refresh was tapped mid-game with the mic still on.
    stopVoiceInput();
    if (typeof Face !== "undefined") Face.stopCamera();
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (err) {
      console.error("Hard refresh: cleanup failed, reloading anyway", err);
    }
    const url = new URL(location.href);
    url.searchParams.set("refresh", Date.now()); // a new URL, so nothing serves the page from a cache
    location.replace(url.toString());
  }

  function appendVoiceDebugLine(line) {
    ensureVoiceDebugPanel();
    if (!voiceDebugLogEl) return;
    console.log("[voice debug]", line); // also in the real devtools console, for copy/paste or filtering

    voiceDebugFullLog.push(line);
    while (voiceDebugFullLog.length > VOICE_DEBUG_LOG_CAP) voiceDebugFullLog.shift();

    const visible = voiceDebugFullLog.slice(-VOICE_DEBUG_VISIBLE_LINES);
    voiceDebugLogEl.textContent = visible.join("\n") + "\n";
    if (!voiceDebugCollapsed) voiceDebugLogEl.scrollTop = voiceDebugLogEl.scrollHeight;
  }

  // Marks the start of a round with what the round actually expects — so
  // scrolling the log shows "what is being heard" (the interim/result lines
  // below) right alongside "what is expected" (this line), without having
  // to separately ask what the target was at the time.
  function logVoiceDebugRound(term) {
    if (!VOICE_DEBUG_ENABLED || !term) return;
    appendVoiceDebugLine(
      `+${voiceDebugElapsedSeconds()}s  ── round: "${term.first}" + ? → "${term.term}"  (need "${term.second}") ──`
    );
  }

  function logVoiceDebugEvent(event) {
    if (!VOICE_DEBUG_ENABLED) return;
    const detail =
      event.detail === undefined
        ? ""
        : " " + (typeof event.detail === "string" ? JSON.stringify(event.detail) : JSON.stringify(event.detail));

    // For anything that's actually heard speech (interim or final), show
    // right on the same line whether it would currently be accepted —
    // "what was heard" next to "what is expected," per event, not just
    // once per round. wouldAccept() is side-effect-free, safe to call
    // purely for this display even on interim text the game itself never
    // acts on.
    let matchInfo = "";
    if ((event.type === "result" || event.type === "interim") && typeof event.detail === "string") {
      const accepted = !!findAcceptedVoiceGuess([event.detail]);
      matchInfo = accepted ? "  → ✓ matches" : "  → ✗ no match";
    }

    appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ${event.type}${detail}${matchInfo}`);
  }

  function loadCameraPreference() {
    try {
      return localStorage.getItem(CAMERA_KEY) === "true";
    } catch {
      return false;
    }
  }

  function saveCameraPreference(enabled) {
    try {
      localStorage.setItem(CAMERA_KEY, String(enabled));
    } catch {
      /* ignore — the toggle still works for this tab, just won't persist */
    }
  }

  cameraEnabled = loadCameraPreference();
  // On a slow/metered connection, default to no-camera for this session
  // regardless of a previously saved preference — camera mode means
  // downloading the face model (and MediaPipe's WASM runtime, the first
  // time it isn't already cached), which isn't something to kick off
  // silently on 2G/3G or when the browser's own Data Saver is on. The saved
  // preference itself is left untouched, so a later visit on a normal
  // connection goes back to whatever the player last chose.
  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  const isSlowConnection = !!(conn && (conn.saveData || /^2g|3g$/.test(conn.effectiveType || "")));
  if (isSlowConnection) cameraEnabled = false;
  el.cameraToggleInput.checked = cameraEnabled;
  // The on-device voice engine (~40MB, first time only) starts downloading
  // as soon as camera mode is on, so it's usually ready by the time Play is
  // pressed. Typing-only players never download it. If Play comes first,
  // the round waits (timer paused) with a progress note and a "Switch to
  // typing" option — see refreshVoiceLoadUi().
  function preloadVoiceEngine() {
    if (cameraEnabled && typeof Voice !== "undefined") Voice.preload();
  }

  let voiceModelState = "idle";
  let voiceModelFraction = 0;
  let voiceLoadOffered = false; // the typing pill is showing because of the download

  function refreshVoiceLoadUi() {
    const loading = voiceModelState === "loading" && arModeActive;
    el.voiceLoadProgress.textContent = `Loading voice engine… ${Math.round(voiceModelFraction * 100)}%`;
    el.voiceLoadProgress.classList.toggle("hidden", !loading);
    if (loading && voiceActive) {
      voiceLoadOffered = true;
      setSwitchToTypingOffered(true);
    } else if (voiceLoadOffered && !loading) {
      voiceLoadOffered = false;
      if (!voiceHeardThisSession && !voiceSilenceTimer) setSwitchToTypingOffered(false);
    }
  }

  if (typeof Voice !== "undefined") {
    Voice.onModelState((state, fraction) => {
      voiceModelState = state;
      voiceModelFraction = fraction;
      refreshVoiceLoadUi();
    });
  }
  preloadVoiceEngine();

  el.cameraToggleInput.addEventListener("change", () => {
    cameraEnabled = el.cameraToggleInput.checked;
    saveCameraPreference(cameraEnabled);
    preloadVoiceEngine();
  });

  function showCameraStatus(message, { offerFallback = false } = {}) {
    // Needed because "Play again" can trigger this straight from the
    // game-over screen, where #game-screen itself is still hidden — without
    // this, the panel updates invisibly behind the still-showing game-over
    // screen until Face.startCamera() resolves.
    switchScreen("game");
    el.cameraStatusMessage.textContent = message;
    el.playWithoutCameraBtn.classList.toggle("hidden", !offerFallback);
    el.hud.classList.add("hidden");
    el.startPanel.classList.add("hidden");
    el.wordCard.classList.add("hidden");
    el.guessForm.classList.add("hidden");
    el.cameraStatusPanel.classList.remove("hidden");
  }

  function hideCameraStatus() {
    el.cameraStatusPanel.classList.add("hidden");
  }

  // Converts a point in raw (unmirrored) video-pixel space to on-screen
  // pixels, accounting for the <video> element's rendered box and
  // object-fit: cover's scaling + cropping.
  function videoPointToScreen(vx, vy, videoWidth, videoHeight) {
    const rect = el.cameraVideo.getBoundingClientRect();
    const videoAspect = videoWidth / videoHeight;
    const boxAspect = rect.width / rect.height;
    let scale, offsetX, offsetY;
    if (videoAspect > boxAspect) {
      scale = rect.height / videoHeight;
      offsetX = (videoWidth * scale - rect.width) / 2;
      offsetY = 0;
    } else {
      scale = rect.width / videoWidth;
      offsetX = 0;
      offsetY = (videoHeight * scale - rect.height) / 2;
    }
    return { x: rect.left + vx * scale - offsetX, y: rect.top + vy * scale - offsetY };
  }

  function handleFacePosition(pos) {
    if (!pos || !arModeActive) return; // absence is handled by the render loop's own timing
    lastFaceSeenAt = performance.now();

    // Detection runs on the raw (unmirrored) video frame, but the video is
    // shown mirrored — flip the x origin to match what the player sees.
    const mirroredX = pos.videoWidth - (pos.x + pos.width);

    const topLeft = videoPointToScreen(mirroredX, pos.y, pos.videoWidth, pos.videoHeight);
    const bottomRight = videoPointToScreen(
      mirroredX + pos.width,
      pos.y + pos.height,
      pos.videoWidth,
      pos.videoHeight
    );
    const faceScreenWidth = bottomRight.x - topLeft.x;

    const scale = Math.min(
      CARD_SCALE_MAX,
      Math.max(CARD_SCALE_MIN, pos.width / FACE_WIDTH_BASELINE)
    );
    const newTarget = { x: topLeft.x + faceScreenWidth / 2, y: topLeft.y, scale };

    // Face detectors report a slightly different box almost every frame even
    // when the head hasn't actually moved — chasing that noise with the lerp
    // is what reads as the card "wiggling/shaking" even with no wrong-answer
    // animation involved. Below this threshold, treat it as noise and keep
    // the existing target rather than nudging toward it; a real head
    // movement quickly exceeds the threshold and tracks normally.
    if (
      faceTarget &&
      Math.abs(newTarget.x - faceTarget.x) < POSITION_DEADZONE_PX &&
      Math.abs(newTarget.y - faceTarget.y) < POSITION_DEADZONE_PX
    ) {
      return;
    }
    faceTarget = newTarget;
  }

  // Clamped against #game-screen's own box (the mobile-width frame), not
  // window.innerWidth/innerHeight — on a wide desktop window that keeps the
  // card from drifting out past the frame into the grey background either
  // side of it, matching the camera feed (.ar-layer) being contained the
  // same way. On an actual phone .screen already fills the viewport, so
  // this clamps identically to before.
  function applyCardPosition(pos) {
    const rect = el.wordCard.getBoundingClientRect();
    const frame = el.gameScreen.getBoundingClientRect();
    const halfWidth = (rect.width || 280) / 2;
    const height = rect.height || 160;
    const margin = 12;

    const clampedX = Math.min(frame.right - margin - halfWidth, Math.max(frame.left + margin + halfWidth, pos.x));
    const clampedY = Math.min(frame.bottom - margin - height, Math.max(frame.top + margin + height, pos.y));

    el.wordCard.style.left = `${clampedX}px`;
    el.wordCard.style.top = `${clampedY}px`;
    el.wordCard.style.transform = `translate(-50%, calc(-100% - ${CARD_GAP_ABOVE_FACE}px)) scale(${pos.scale * AR_CARD_SIZE_FACTOR})`;
  }

  function updatePauseState() {
    const state = Game.getState();
    if (!state) return;
    const shouldPause = pausedByNoFace || pausedByVoiceNotListening || pausedForResumeCard;
    if (shouldPause && !state.paused) Game.pauseTimer();
    else if (!shouldPause && state.paused) Game.resumeTimer();
  }

  function arRenderLoop() {
    if (!arModeActive) return;

    const now = performance.now();
    const msSinceFace = lastFaceSeenAt ? now - lastFaceSeenAt : Infinity;
    const faceCurrentlyVisible = msSinceFace < NO_FACE_FADE_MS;

    if (faceTarget) {
      if (cardCurrent.x === null) {
        cardCurrent = { ...faceTarget }; // snap on the very first detection, nothing to lerp from yet
      } else {
        cardCurrent.x += (faceTarget.x - cardCurrent.x) * LERP_FACTOR;
        cardCurrent.y += (faceTarget.y - cardCurrent.y) * LERP_FACTOR;
        cardCurrent.scale += (faceTarget.scale - cardCurrent.scale) * LERP_FACTOR;
      }
      applyCardPosition(cardCurrent);
    }

    el.wordCard.classList.toggle("faded", !faceCurrentlyVisible);
    el.moveIntoFrameHint.classList.toggle("hidden", faceCurrentlyVisible);

    pausedByNoFace = msSinceFace > NO_FACE_PAUSE_MS;
    updatePauseState();

    arRafId = requestAnimationFrame(arRenderLoop);
  }

  function activateArMode() {
    arModeActive = true;
    refreshVoiceLoadUi();
    faceTarget = null;
    cardCurrent = { x: null, y: null, scale: 1 };
    lastFaceSeenAt = performance.now(); // grace period before "no face" can trigger
    pausedByNoFace = false;

    el.gameScreen.classList.add("ar-active");
    el.arLayer.classList.remove("hidden");
    el.wordCard.classList.add("ar-tracked");
    el.guessForm.classList.add("hidden"); // AR mode: speak the answer (see switchToTypingMode() for when the mic fails)
    voiceHeardThisSession = false;

    el.modelLoadProgress.classList.add("hidden");
    unsubscribeFacePosition = Face.onFacePosition(handleFacePosition);
    if (typeof Face.onModelLoadProgress === "function") {
      unsubscribeModelLoadProgress = Face.onModelLoadProgress(showModelLoadProgress);
    }
    if (typeof Face.onModelLoadError === "function") {
      unsubscribeModelLoadError = Face.onModelLoadError(handleModelLoadError);
    }
    arRafId = requestAnimationFrame(arRenderLoop);
  }

  // Small, non-blocking note while the face model downloads in the
  // background (Phase 4) — never gates the camera or gameplay, which are
  // both already up and running by the time this ever shows anything.
  function showModelLoadProgress(fraction) {
    if (fraction >= 1) {
      el.modelLoadProgress.classList.add("hidden");
      return;
    }
    el.modelLoadProgress.textContent = `Loading face tracking… ${Math.round(fraction * 100)}%`;
    el.modelLoadProgress.classList.remove("hidden");
  }

  // The model failing/timing out only ever affects face *tracking* — the
  // camera keeps working either way (see face.js's own comment on why
  // camera display was deliberately decoupled from model load). This is
  // just a brief, non-blocking heads-up for why the card won't follow the
  // player's face, not a "camera mode unavailable" fallback.
  function handleModelLoadError() {
    el.modelLoadProgress.textContent = "Face tracking unavailable — camera still works";
    el.modelLoadProgress.classList.remove("hidden");
    clearTimeout(modelLoadErrorTimer);
    modelLoadErrorTimer = setTimeout(() => {
      el.modelLoadProgress.classList.add("hidden");
    }, 4000);
  }

  function deactivateArMode() {
    if (!arModeActive) return;
    arModeActive = false;
    refreshVoiceLoadUi();
    if (arHintShown && activeTerm) {
      // Switching to typing mid-round: keep the hint on screen, in the card.
      el.hintText.textContent = hintTextFor(activeTerm);
      el.hintText.classList.remove("hidden");
      el.hintBtn.classList.remove("hidden");
    }
    hideArHint();
    if (arRafId) {
      cancelAnimationFrame(arRafId);
      arRafId = null;
    }
    if (unsubscribeFacePosition) {
      unsubscribeFacePosition();
      unsubscribeFacePosition = null;
    }
    if (unsubscribeModelLoadProgress) {
      unsubscribeModelLoadProgress();
      unsubscribeModelLoadProgress = null;
    }
    if (unsubscribeModelLoadError) {
      unsubscribeModelLoadError();
      unsubscribeModelLoadError = null;
    }
    clearTimeout(modelLoadErrorTimer);
    if (typeof Face !== "undefined") Face.stopCamera();
    stopVoiceInput();

    el.gameScreen.classList.remove("ar-active");
    el.arLayer.classList.add("hidden");
    el.wordCard.classList.remove("ar-tracked", "faded");
    el.wordCard.style.left = "";
    el.wordCard.style.top = "";
    el.wordCard.style.transform = "";
    el.moveIntoFrameHint.classList.add("hidden");
    el.modelLoadProgress.classList.add("hidden");
    el.guessForm.classList.remove("hidden"); // restore typing for non-AR play
    voiceHeardThisSession = false;
    el.switchToTypingBtn.classList.add("hidden");
    el.tapToSpeakBtn.classList.add("hidden");
    clearTimeout(voiceSettleTimer);
    voiceSettleTimer = null;

    pausedByNoFace = false;
    pausedByVoiceNotListening = false;
    clearVoiceSilenceTimer();
  }

  // ---------- Voice input (AR mode) ----------
  // The only input method while AR mode is active — activateArMode()/
  // deactivateArMode() hide/restore the input bar unconditionally (see
  // above), so there's no typing fallback here if speech recognition isn't
  // supported or the player denies microphone access; see announce() calls
  // below for the (non-visual, screen-reader only) reporting of that case.
  // Starts voice input once the camera has had CAMERA_SETTLE_MS to settle
  // (see that constant), warming up the microphone first (Voice.warmUp()).
  // The timer is held, silently, for the wait — a normal ~1s startup isn't
  // worth a message.
  function startVoiceInputAfterCameraSettles() {
    clearTimeout(voiceSettleTimer);
    pausedByVoiceNotListening = true;
    updatePauseState();
    voiceSettleTimer = setTimeout(async () => {
      voiceSettleTimer = null;
      if (!arModeActive || document.hidden) return;
      if (typeof Voice !== "undefined") await Voice.warmUp();
      if (!arModeActive || document.hidden) return;
      startVoiceInput();
    }, CAMERA_SETTLE_MS);
  }

  function startVoiceInput() {
    if (typeof Voice === "undefined" || !Voice.supported()) return false;

    voiceActive = true;
    refreshVoiceLoadUi();
    unsubscribeVoiceResult = Voice.onResult(handleVoiceResult);
    unsubscribeVoiceInterim = Voice.onInterimResult(handleVoiceInterimResult);
    unsubscribeVoiceError = Voice.onError(handleVoiceError);
    unsubscribeVoiceListening = Voice.onListeningChange(handleVoiceListeningChange);
    if (typeof Voice.onSleepChange === "function") unsubscribeVoiceSleep = Voice.onSleepChange(handleVoiceSleepChange);
    if (VOICE_DEBUG_ENABLED && typeof Voice.onDebugEvent === "function") {
      unsubscribeVoiceDebug = Voice.onDebugEvent(logVoiceDebugEvent);
    }

    // Pessimistic by default: the round timer stays paused, and a
    // "Reconnecting microphone…" message shows, until Voice actually
    // confirms it's listening. Reacquiring the microphone — especially
    // after the tab was backgrounded — can take a long time on iOS
    // (observed ~20s on a real device, twice in one session), and the
    // player shouldn't lose round time to a gap they have no way to do
    // anything about. handleVoiceListeningChange() below clears this the
    // moment Voice confirms it's actually listening.
    pausedByVoiceNotListening = true;
    updatePauseState();

    Voice.start();
    announce("Voice input on. Say your answer.");
    return true;
  }

  // "Switch to typing" is offered — never forced — once the current
  // microphone session has heard nothing for SILENCE_NEW_SESSION_MS. That
  // can mean a silent session (seen on iPhones at game start) or just a
  // player thinking, so the player decides. Hidden again as soon as the
  // microphone hears anything. (Leaving the app is handled separately: it
  // always switches to typing — see the visibilitychange handler.)
  const SILENCE_NEW_SESSION_MS = 8000;

  function setSwitchToTypingOffered(offered) {
    el.switchToTypingBtn.classList.toggle("hidden", !(offered && voiceActive && arModeActive));
  }

  function armVoiceSilenceTimer(ms) {
    clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = setTimeout(handleVoiceSilence, ms);
  }

  function clearVoiceSilenceTimer() {
    clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = null;
  }

  function handleVoiceSilence() {
    voiceSilenceTimer = null;
    if (!voiceActive || !arModeActive || voiceHeardThisSession) return;
    appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ◇ nothing heard for ${SILENCE_NEW_SESSION_MS / 1000}s — offering typing`);
    setSwitchToTypingOffered(true);
  }

  // Any interim or final transcript: this session can hear the player.
  function noteVoiceHeard() {
    clearVoiceSilenceTimer();
    voiceHeardThisSession = true;
    setSwitchToTypingOffered(false);
  }

  // Leaves camera mode for the rest of this game and continues it in the
  // regular typing layout (camera and microphone off, centered card,
  // typing bar) — the same path a camera failure mid-game already takes.
  // The saved camera preference is untouched, so the next game starts in
  // camera mode again.
  function switchToTypingMode() {
    appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ◇ switching to typing mode`);
    deactivateArMode(); // also clears every AR pause reason
    updatePauseState();
  }

  el.switchToTypingBtn.addEventListener("click", () => {
    if (!arModeActive) return;
    switchToTypingMode();
    announce("Switched to typing.");
    el.guessInput.focus(); // inside the tap, so iOS opens the keyboard
  });

  // The microphone sleeps after a silent session instead of restarting —
  // see voice.js's onend (Chrome on Android clicks on every restart). While
  // asleep, the timer runs (the player isn't blocked, just needs to tap)
  // and "Tap to speak" replaces the silence-based "Switch to typing" offer,
  // since an asleep mic isn't a broken one. A new word wakes it on its own
  // (renderRound()).
  function handleVoiceSleepChange(asleep) {
    micAsleep = asleep;
    appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ◇ mic ${asleep ? "asleep (silent session)" : "awake"}`);
    el.tapToSpeakBtn.classList.toggle("hidden", !(asleep && voiceActive && arModeActive));
    if (asleep) {
      pausedByVoiceNotListening = false;
      clearVoiceSilenceTimer();
      setSwitchToTypingOffered(false);
      updatePauseState();
    }
  }

  el.tapToSpeakBtn.addEventListener("click", () => {
    if (!voiceActive || !micAsleep) return;
    Voice.start();
  });

  function handleVoiceListeningChange(isListening) {
    appendVoiceDebugLine(
      `+${voiceDebugElapsedSeconds()}s  ◇ listening: ${isListening} ${isListening ? "(timer resumed)" : "(timer paused)"}`
    );
    pausedByVoiceNotListening = !isListening;
    // The silence clock runs across session restarts, not per session:
    // Chrome on Android ends a session after ~5s of silence and every
    // result, so a per-session 8s clock never fired there. It only resets
    // when speech is heard (noteVoiceHeard()) or voice stops.
    if (isListening) {
      voiceHeardThisSession = false;
      if (!voiceSilenceTimer) armVoiceSilenceTimer(SILENCE_NEW_SESSION_MS);
    }
    updatePauseState();
  }

  function stopVoiceInput() {
    if (!voiceActive) return;
    voiceActive = false;
    clearPendingVoiceSubmit();
    if (typeof Voice !== "undefined") Voice.stop();
    if (unsubscribeVoiceResult) {
      unsubscribeVoiceResult();
      unsubscribeVoiceResult = null;
    }
    if (unsubscribeVoiceInterim) {
      unsubscribeVoiceInterim();
      unsubscribeVoiceInterim = null;
    }
    if (unsubscribeVoiceError) {
      unsubscribeVoiceError();
      unsubscribeVoiceError = null;
    }
    if (unsubscribeVoiceListening) {
      unsubscribeVoiceListening();
      unsubscribeVoiceListening = null;
    }
    if (unsubscribeVoiceSleep) {
      unsubscribeVoiceSleep();
      unsubscribeVoiceSleep = null;
    }
    micAsleep = false;
    el.tapToSpeakBtn.classList.add("hidden");
    if (unsubscribeVoiceDebug) {
      unsubscribeVoiceDebug();
      unsubscribeVoiceDebug = null;
    }
    pausedByVoiceNotListening = false;
    clearVoiceSilenceTimer();
    setSwitchToTypingOffered(false);
  }

  // checkGuess() is already case/space/hyphen-insensitive, so a recognized
  // phrase like "drop shadow" can be handed straight to the same submit
  // path typing uses — no transcript-to-slots mapping needed.
  //
  // Debounced rather than submitted immediately: a single continuous
  // SpeechRecognition session can split one spoken phrase into several
  // separate "final" results — e.g. a brief pause between "drop" and
  // "shadow" can make the engine finalize them as two results instead of
  // one. Submitting each fragment the instant it arrives meant the first
  // (incomplete, wrong) fragment could flash the card red before the real,
  // complete phrase arrived moments later and flashed it green — confusing,
  // and it cost the player a try for nothing. Instead, fragments are
  // collected and only joined + submitted as one guess once
  // VOICE_SUBMIT_DEBOUNCE_MS passes with no further fragment arriving
  // (i.e. once the player has actually stopped talking).
  // Chrome's SpeechRecognition treats recognized phrases like sentences —
  // it commonly capitalizes the first letter and appends trailing
  // punctuation (e.g. speaking "wireframe" can come back as "Wireframe.").
  // checkGuess()/normalizeForMatch() in game.js only strip whitespace and
  // hyphens, not punctuation, so an un-cleaned transcript like "wireframe."
  // would never match "wireframe" — a real, likely-major cause of "the
  // system is still not taking the words properly." Stripped here, at the
  // voice layer, rather than in game.js/design-terms.js, since this is
  // purely a speech-recognition artifact — typed input never has this
  // problem and shouldn't need the same cleanup.
  function sanitizeVoiceTranscript(s) {
    return (s || "").replace(/[^\w\s-]/g, "").trim();
  }

  // buildSlots() expects its guess argument to line up letter-for-letter
  // with the connecting word — true by construction for typing (the player
  // can only type into that one field), but not for voice: a player saying
  // the complete merged term (e.g. "wireframe" instead of just "frame")
  // means `heard` is the main word + connecting word run together, so
  // indexing straight into it put letters from the *main* word into slots
  // meant for the connecting word — "the feedback in blank is not the part
  // that is recognised, but something else." If what's been heard starts
  // with the main word currently on screen, strip that prefix off first so
  // only the actual connecting-word attempt reaches the slots. Cuts after
  // the *last* occurrence, so a repeated attempt run together into one
  // transcript ("full lead full bleed") previews just the latest one
  // ("bleed").
  function extractConnectingWordGuess(heard, mainWord) {
    const normalizedHeard = heard.toLowerCase().replace(/[\s-]+/g, "");
    const normalizedMain = (mainWord || "").toLowerCase();
    const cut = normalizedMain ? normalizedHeard.lastIndexOf(normalizedMain) : -1;
    if (cut >= 0 && normalizedHeard.length > cut + normalizedMain.length) {
      return normalizedHeard.slice(cut + normalizedMain.length);
    }
    return normalizedHeard;
  }

  // A continuous session often runs repeated attempts together into one
  // transcript — a real iPhone log had the player say "full bleed" twice
  // and get "Full lead full bleed" back, which matched nothing as a whole
  // and cost a try even though the correct answer was in it. Each candidate
  // is tried whole first, then by its trailing words ("lead full bleed",
  // "full bleed", "bleed"), since the last thing said is the player's
  // latest attempt. Returns the first accepted string, or null. Uses
  // Game.wouldAccept(), so nothing here spends a try.
  function findAcceptedVoiceGuess(candidates) {
    if (typeof Game === "undefined" || typeof Game.wouldAccept !== "function") return null;
    for (const candidate of candidates) {
      const words = sanitizeVoiceTranscript(candidate).split(/\s+/).filter(Boolean);
      for (let start = 0; start < words.length; start++) {
        const suffix = words.slice(start).join(" ");
        if (Game.wouldAccept(suffix)) return suffix;
      }
    }
    return null;
  }

  function isOnlyMainWord(transcript) {
    const mainWord = ((activeTerm && activeTerm.first) || "").toLowerCase();
    if (!mainWord) return false;
    const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    return words.length > 0 && words.every((word) => word === mainWord);
  }

  // iOS sometimes delivers the just-answered phrase a second time, after the
  // next round has started — real iPhone logs had "Use case" land again in
  // the following "case" round, and "Machine" (the previous answer) in the
  // next round, each costing a try. Neither the previous round's whole term
  // nor its answer word is ever the current round's answer, so a result
  // that's exactly either is ignored.
  function isEchoOfPreviousTerm(transcript) {
    if (!previousTerm) return false;
    const normalize = (text) => text.toLowerCase().replace(/[\s-]+/g, "");
    const heard = normalize(transcript);
    return heard === normalize(previousTerm.term) || heard === normalize(previousTerm.second);
  }

  function handleVoiceResult(rawTranscript, rawAlternatives) {
    if (!voiceActive || el.guessInput.readOnly) return; // ignore during a correct/wrong animation, or while the player is away
    noteVoiceHeard();
    const transcript = sanitizeVoiceTranscript(rawTranscript);
    if (!transcript) return; // nothing left after stripping (e.g. pure punctuation/noise)

    // Accept if the final transcript, any of the engine's runner-up
    // alternatives (a misheard "Blade" often has "bleed" among them), or any
    // interim heard during this utterance matches. The interim case covers
    // the engine "correcting" a right answer into a wrong one between the
    // interim and the final — seen on real iPhones as "Mouse over" →
    // "Mouse" and "Hunk junk" → "Hunk hunk". Checked before the main-word
    // filter below, since the full term ("half tone") starts with it.
    const acceptedGuess = findAcceptedVoiceGuess([transcript, ...(rawAlternatives || []), interimMatchedGuess]);
    if (acceptedGuess) {
      clearPendingVoiceSubmit();
      el.guessInput.value = acceptedGuess;
      submitCurrentGuess();
      return;
    }

    // A result that's only the main word on screen ("Half", "Half half")
    // is the player reading the card aloud or pausing before the second
    // word, not a guess — a real iPhone log had "Half … tone" split into a
    // "Half" result that cost a try, and a late "Tone" result landing in
    // the next round (main word "tone") that cost another. Ignored rather
    // than judged. Same for a late echo of the previous round's term.
    if (isOnlyMainWord(transcript) || isEchoOfPreviousTerm(transcript)) return;

    pendingVoiceParts.push(transcript);

    // Fill the letter slots with what's been heard so far, exactly like
    // typing does — lets the player see which letters landed right or
    // wrong and get a sense of how close the guess is, instead of only
    // finding out once the whole thing resolves to a plain correct/wrong
    // card color. This only updates the letters, not the card's
    // color/state — a guess is still never judged right or wrong until a
    // match is found or the debounce below actually elapses, so this
    // doesn't reintroduce the premature-wrong-flash problem fixed earlier.
    // Matching below (checkGuess()/the full-term fallback) is unaffected by
    // any of this — it still runs against the raw, un-stripped transcript,
    // since it already strips whitespace/hyphens and checks both the
    // connecting word and the complete term on its own.
    const heardSoFar = pendingVoiceParts.join("");
    const slotGuess = extractConnectingWordGuess(heardSoFar, activeTerm && activeTerm.first);
    buildSlots(activeSecondWord, slotGuess);

    // Test this fragment alone first, before waiting on the debounce at
    // all. The connecting word the player needs to say is almost always a
    // single word/short phrase, so a cleanly recognized correct fragment
    // already IS the whole answer — no reason to make the player wait, and
    // critically, this also means a correct answer can never be corrupted
    // by an unrelated fragment (background noise, a filler "um", a second
    // recognized chunk) landing elsewhere in the same debounce window and
    // getting concatenated into a guess that no longer matches anything.

    clearTimeout(voiceSubmitTimer);
    voiceSubmitTimer = setTimeout(() => {
      const combined = pendingVoiceParts.join("");
      pendingVoiceParts = [];
      el.guessInput.value = combined;
      submitCurrentGuess();
    }, VOICE_SUBMIT_DEBOUNCE_MS);
  }

  function clearPendingVoiceSubmit() {
    clearTimeout(voiceSubmitTimer);
    voiceSubmitTimer = null;
    pendingVoiceParts = [];
    interimMatchedGuess = "";
  }

  // Purely visual: previews the in-progress (not-yet-final) transcript in
  // the letter slots as the player is still talking, well before any final
  // result lands — never pushed into pendingVoiceParts, never submitted,
  // never checked against Game.wouldAccept(). Interim transcripts can still
  // change/correct themselves as the recognizer hears more, so treating one
  // as an actual answer would risk committing to a guess (spending a try,
  // or worse, a false "correct") on data that might revise itself a moment
  // later — only a *final* result (handleVoiceResult, above) ever does
  // that. This exists specifically so the player sees something the
  // instant the system starts picking up their voice, rather than a silent
  // wait until a final result resolves — added after real feedback that
  // voice responses felt slow and gave "no feedback on what is being
  // listened."
  function handleVoiceInterimResult(rawTranscript) {
    if (!voiceActive || el.guessInput.readOnly) return;
    noteVoiceHeard();
    const transcript = sanitizeVoiceTranscript(rawTranscript);
    if (!transcript) return;
    const preview = pendingVoiceParts.join("") + transcript;
    const matched = findAcceptedVoiceGuess([preview]);
    if (matched) interimMatchedGuess = matched; // kept until this utterance's final result — see handleVoiceResult()
    const slotGuess = extractConnectingWordGuess(preview, activeTerm && activeTerm.first);
    buildSlots(activeSecondWord, slotGuess);
  }

  function handleVoiceError(error) {
    console.error("Voice: recognition error", error);
    if (document.hidden) return; // errors while leaving the app are expected; camera mode ends anyway
    if (error === "start-failed" && voiceActive && arModeActive) {
      // The microphone couldn't start at all (e.g. the on-device recognizer's
      // audio stayed silent through every rebuild): don't leave the timer
      // frozen waiting for it — run the round and offer typing right away.
      pausedByVoiceNotListening = false;
      updatePauseState();
      setSwitchToTypingOffered(true);
      return;
    }
    if (error === "not-allowed" || error === "service-not-allowed") {
      stopVoiceInput();
      announce("Voice input unavailable. Check microphone permissions to continue.");
    }
    // Other errors (no-speech, network, aborted, restart-failed) are
    // transient — Voice's own onend handler already retries, nothing for
    // ui.js to do here.
  }

  // Leaving the app mid-camera-game. What happens depends on the voice
  // engine (Voice.survivesAppSwitch()):
  //
  // - On-device Vosk: camera mode is kept. The camera is left alone (iOS
  //   interrupts it while away and resumes it on its own), only voice is
  //   stopped, and "Keep playing" restarts it inside the tap — on iPhone the
  //   AudioContext has to be resumed from a gesture. Voice is heard again
  //   within a second.
  // - Browser recognizer (the fallback): on iPhone it stays deaf for ~20s
  //   after the app has been in the background, whatever the page does
  //   (camera-first restarts, restart gaps, keeping the session alive and a
  //   microphone warm-up all failed). So the switch to typing happens the
  //   moment the page is hidden — while the player can't see the layout
  //   change — and they return to a card explaining it.
  //
  // Either way the timer is paused until "Keep playing", and the card is
  // shown on return. Focusing the input inside the tap is what lets iOS
  // open the keyboard in the typing case.
  const RESUME_COPY_KEEP_CAMERA = "Tap to keep going — voice restarts when you do.";
  const RESUME_COPY_TYPING = "Voice answers stop when you leave the app. You can keep playing by typing.";
  let resumeKeepsCamera = false; // set while away: "Keep playing" restarts voice instead of focusing the input

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!arModeActive) return;
      pausedForResumeCard = true; // first, so the timer never runs between leaving and the pause
      clearPendingVoiceSubmit();
      resumeKeepsCamera = typeof Voice !== "undefined" && Voice.survivesAppSwitch();
      appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ◇ tab hidden (${resumeKeepsCamera ? "camera mode kept, voice stopped" : "switching to typing"})`);
      if (resumeKeepsCamera) {
        updatePauseState();
        stopVoiceInput();
      } else {
        switchToTypingMode();
      }
    } else if (pausedForResumeCard) {
      appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ◇ tab visible again — pause card`);
      el.resumeBody.textContent = resumeKeepsCamera ? RESUME_COPY_KEEP_CAMERA : RESUME_COPY_TYPING;
      el.resumeCard.classList.remove("hidden");
      el.resumeBtn.focus();
    }
  });

  el.resumeBtn.addEventListener("click", () => {
    el.resumeCard.classList.add("hidden");
    pausedForResumeCard = false;
    appendVoiceDebugLine(`+${voiceDebugElapsedSeconds()}s  ◇ keep playing tapped`);
    if (resumeKeepsCamera && arModeActive) {
      resumeKeepsCamera = false;
      if (el.cameraVideo.paused) el.cameraVideo.play().catch(() => {}); // in case iOS paused the element
      Voice.prime(); // resume the AudioContext inside the tap
      startVoiceInput();
      updatePauseState();
      return;
    }
    resumeKeepsCamera = false;
    updatePauseState();
    el.guessInput.focus();
  });

  async function startWithCamera() {
    showCameraStatus("Starting camera…");
    try {
      if (typeof Face === "undefined") throw new Error("Camera mode isn't available right now");
      await Face.startCamera(el.cameraVideo);
      hideCameraStatus();
      // beginRound() must come first: it calls showPlayingBoard(), which
      // unconditionally un-hides the input bar — activateArMode() (which
      // hides it again, since AR mode never shows it) has to run after.
      beginRound();
      activateArMode();
      startVoiceInputAfterCameraSettles();
    } catch (err) {
      console.error("Camera start failed", err);
      // Most failures (permission denied, no camera, etc.) get a generic
      // friendly message — but an insecure-context failure (see face.js) is
      // a specific, fixable setup problem, not a one-off denial, so it gets
      // its own message rather than looking like a random camera glitch.
      const insecureContext = err && err.message && err.message.includes("secure connection");
      const message = insecureContext
        ? "Camera needs a secure connection (https, or localhost) — this page was opened over plain http. You can still play without it."
        : "We couldn't access your camera. You can still play without it.";
      showCameraStatus(message, { offerFallback: true });
    }
  }

  el.playWithoutCameraBtn.addEventListener("click", () => {
    hideCameraStatus();
    beginRound();
  });

  function beginRound() {
    switchScreen("game");
    showPlayingBoard();
    // Terms the voice engine can't recognize would be unanswerable by voice,
    // so camera-mode games skip them.
    Game.start({ skipTerms: cameraEnabled ? Voice.unanswerableTerms() : [] });
  }

  function startNewGame() {
    // The on-device recognizer prototype (?vosk) needs its AudioContext
    // started inside this tap on iOS; the browser recognizer doesn't.
    if (cameraEnabled && typeof Voice !== "undefined") Voice.prime();
    if (cameraEnabled) startWithCamera();
    else beginRound();
  }

  el.playBtn.addEventListener("click", startNewGame);
  el.playAgainBtn.addEventListener("click", startNewGame);

  // ---------- Game event wiring ----------
  Game.on("round", (payload) => {
    renderRound(payload.term, payload.showNewChainMessage);
    updateHud(payload.state);
    setTimerRing(payload.state.timeRemaining);
  });

  Game.on("tick", (payload) => {
    setTimerRing(payload.timeRemaining);
    if (payload.timeRemaining <= HINT_REVEAL_SECONDS) {
      if (arModeActive) showArHint();
      else el.hintBtn.classList.remove("hidden");
    }
  });

  Game.on("gameover", (payload) => {
    if (payload.reason === "timeout") {
      el.wordCard.classList.remove("wrong");
      void el.wordCard.offsetWidth;
      el.wordCard.classList.add("wrong");
      announce("Time's up! Game over.");
    }
    el.guessInput.readOnly = true;
    el.guessInput.blur(); // closes the keyboard — the game-over screen has no input
    deactivateArMode(); // stop the camera stream on game over, per the brief
    setTimeout(() => {
      showGameOverScreen(payload.state, payload.bestScore);
    }, GAMEOVER_DELAY_MS);
  });

  // ---------- Offline badge (Phase 4) ----------
  function updateOfflineBadge() {
    el.offlineBadge.classList.toggle("hidden", navigator.onLine);
  }
  window.addEventListener("online", updateOfflineBadge);
  window.addEventListener("offline", updateOfflineBadge);

  // ---------- Service worker (Phase 4 — offline support) ----------
  // Shows a plain, visible confirmation once offline play is actually
  // ready — added after a real-device report where "it says unable to use
  // without internet connection" on an iPhone, most likely because there
  // was previously no way to tell whether the ~19MB background precache
  // (the MediaPipe/AR stack dwarfs everything else in it) had actually
  // finished before switching to airplane mode. Three states:
  //   "preparing" — registered, waiting for install (first visit, or a
  //     cache version bump) to finish downloading everything
  //   "ready"     — navigator.serviceWorker.ready has resolved, which can
  //     only happen after install (the full cache.addAll() precache)
  //     completes successfully — this is the actual "safe to go offline
  //     now" signal, not a guess or a timer
  //   "unavailable" — registration itself failed (unsupported browser,
  //     insecure context, sw.js 404ing) — the game still works fully
  //     online either way, this is purely informational
  function setOfflineReadyStatus(state, message) {
    el.offlineReadyStatus.textContent = message;
    el.offlineReadyStatus.classList.remove("hidden", "preparing", "ready");
    if (state) el.offlineReadyStatus.classList.add(state);
  }

  // In debug mode, show the panel from page load (not just from the first
  // voice event), so the build label and Hard refresh button are reachable
  // on the start screen.
  ensureVoiceDebugPanel();

  if ("serviceWorker" in navigator) {
    setOfflineReadyStatus("preparing", "Preparing offline mode…");
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => {
          setOfflineReadyStatus("ready", "✓ Ready to play offline");
        })
        .catch((err) => {
          console.error("Service worker registration failed", err);
          setOfflineReadyStatus(null, "Offline mode unavailable in this browser");
        });
    });
  } else {
    setOfflineReadyStatus(null, "Offline mode unavailable in this browser");
  }

  // ---------- Init ----------
  el.bestScoreValue.textContent = Game.getBestScore();
  updateOfflineBadge();
  showStartPanel();
})();
