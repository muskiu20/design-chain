/**
 * Guess the Word — voice input for AR mode.
 *
 * Small, self-contained interface mirroring face.js's shape: supported(),
 * start(), stop(), onResult(callback), onError(callback). Nothing else in
 * the app reaches into this file's internals — ui.js decides what to do
 * with a recognized phrase or an error; this module only wraps the
 * browser's SpeechRecognition API and keeps it listening continuously.
 *
 * Only used while AR mode is active: when the camera is on, the player
 * speaks their answer instead of typing it. Typing remains the only input
 * method outside AR mode, and is also the automatic fallback inside AR mode
 * if speech recognition isn't supported in this browser or the player
 * denies microphone access — ui.js re-shows the text input bar in both
 * cases. Nothing here ever throws synchronously; supported() lets a caller
 * check first, and start() reports failures only through onError(),
 * consistent with how face.js reports camera failures through a rejected
 * promise instead of a thrown error.
 *
 * onResult(callback) delivers the final recognized transcript (a plain
 * string, e.g. "drop shadow") for each phrase the player finishes saying —
 * this is the one that actually gets judged right or wrong. A second
 * argument holds every alternative transcript the engine offered (top one
 * first), when it offers more than one.
 *
 * onInterimResult(callback) delivers the browser's best-guess-so-far
 * transcript *while the player is still talking*, updated repeatedly before
 * any final result lands. Never used for scoring — only for letting ui.js
 * preview letters live in the slots, so the player gets some visible
 * response immediately instead of a silent wait (originally omitted
 * entirely, which read as "no feedback on what is being listened" and made
 * the real decision delay feel even longer than it is).
 *
 * onListeningChange(callback) delivers a plain `true`/`false`: true once a
 * session has genuinely confirmed it started (the browser's own `onstart`
 * fired — not just "we called start()"), false the moment it stops for any
 * reason (ends, errors out, is intentionally stopped). This exists because
 * reacquiring the microphone can take a long time in practice — observed on
 * a real iPhone taking ~20 seconds to recover after the tab was
 * backgrounded, with a `audio-capture` error the whole time — and until
 * now ui.js had no way to know "we're still waiting," only "we asked it
 * to start." ui.js uses this to pause the round timer and show a
 * "Reconnecting microphone…" message for exactly as long as this stays
 * false, instead of letting the timer run blind through a gap the player
 * has no way to do anything about.
 *
 * Watchdog: a real-world SpeechRecognition session can silently stop
 * producing anything — no result, no error, no `onend` — and just sit
 * there dead for the rest of the game ("hanging in the middle", per a
 * real-device report). Relying on `onend` alone to trigger a restart
 * doesn't help when `onend` itself never fires. A periodic check instead
 * tracks how long it's been since any sign of life (a session starting, a
 * result, or the browser detecting speech/sound at all) and force-tears-down
 * and restarts the recognizer if that gap gets too long — independent of
 * whether the dead session ever reports its own death.
 */
// The browser's SpeechRecognition wrapper. The `Voice` object the rest of
// the game uses is the facade at the bottom of this file, which prefers the
// on-device Vosk engine (voice-vosk.js) and falls back to this one.
const BuiltinVoice = (() => {
  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const WATCHDOG_CHECK_MS = 2000;
  // Every (re)start of the recognizer plays an audible system sound in
  // Chrome (the same start/stop cue used by Google's own voice features) —
  // there's no JS API to suppress it. A too-short timeout here means a
  // player just quietly thinking for a bit gets treated as "the session
  // died," forcing an unnecessary, audible restart — reported as "clicking
  // sound... quite frustrating." 20s was chosen to stay comfortably under a
  // round's 30s timer while rarely, if ever, firing during normal thinking
  // pauses — this still catches genuinely dead sessions, just less eagerly.
  const WATCHDOG_TIMEOUT_MS = 20000;
  // Minimum gap between stopping the recognizer and starting it again.
  // Was 4000ms on the theory that iOS needs a few seconds to release the
  // microphone, but later iPhone logs showed restarts after a 4s gap going
  // silent too, while one 0.4s restart worked, so the length of the gap
  // isn't what decides it. start() waits
  // out the rest of this gap (onListeningChange stays false, so ui.js
  // keeps the timer paused meanwhile).
  const MIN_RESTART_GAP_MS = 1000;

  let recognition = null;
  let listening = false; // true while we intend to keep listening (drives auto-restart)
  let resultCallbacks = [];
  let interimResultCallbacks = [];
  let errorCallbacks = [];
  let listeningChangeCallbacks = [];
  let debugCallbacks = [];
  let lastActivityAt = 0;
  let watchdogId = null;
  let lastStoppedAt = 0;
  let delayedStartTimer = null;
  let sessionHadSpeech = false; // the current session heard speech (speechstart or any transcript)
  let asleep = false; // a session ended in silence and wasn't restarted — see onend
  let sleepChangeCallbacks = [];
  let sessionId = 0; // bumped on every (re)start, so a stale restart timer can't act on a session that's already gone

  function supported() {
    return !!RecognitionCtor;
  }

  function onResult(callback) {
    resultCallbacks.push(callback);
    return () => {
      resultCallbacks = resultCallbacks.filter((cb) => cb !== callback);
    };
  }

  function onInterimResult(callback) {
    interimResultCallbacks.push(callback);
    return () => {
      interimResultCallbacks = interimResultCallbacks.filter((cb) => cb !== callback);
    };
  }

  function onError(callback) {
    errorCallbacks.push(callback);
    return () => {
      errorCallbacks = errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  function onListeningChange(callback) {
    listeningChangeCallbacks.push(callback);
    return () => {
      listeningChangeCallbacks = listeningChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  function emitResult(transcript, alternatives) {
    resultCallbacks.forEach((cb) => {
      try {
        cb(transcript, alternatives);
      } catch (err) {
        console.error("Voice: onResult callback threw", err);
      }
    });
  }

  function emitInterimResult(transcript) {
    interimResultCallbacks.forEach((cb) => {
      try {
        cb(transcript);
      } catch (err) {
        console.error("Voice: onInterimResult callback threw", err);
      }
    });
  }

  // Debugging only — a raw feed of every lifecycle signal the recognizer
  // produces (session start/end, speech/sound starting and stopping,
  // interim and final transcripts, errors, forced restarts), each as
  // { type, detail }. Timestamps aren't attached here — ui.js stamps every
  // line (including its own, non-voice "round" markers) against one shared
  // clock at log time, so everything lines up on a single timeline
  // regardless of source. Nothing in the game reads this normally; ui.js
  // only wires up a visible log for it behind an explicit debug flag.
  function onDebugEvent(callback) {
    debugCallbacks.push(callback);
    return () => {
      debugCallbacks = debugCallbacks.filter((cb) => cb !== callback);
    };
  }

  function emitDebugEvent(type, detail) {
    if (!debugCallbacks.length) return; // skip building event objects when nobody's listening
    const event = { type, detail };
    debugCallbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Voice: onDebugEvent callback threw", err);
      }
    });
  }

  function emitError(error) {
    errorCallbacks.forEach((cb) => {
      try {
        cb(error);
      } catch (err) {
        console.error("Voice: onError callback threw", err);
      }
    });
  }

  let isListeningNow = false; // only emits onListeningChange when this actually flips, so consumers never see redundant true/true or false/false
  function emitListeningChange(nextIsListening) {
    if (nextIsListening === isListeningNow) return;
    isListeningNow = nextIsListening;
    listeningChangeCallbacks.forEach((cb) => {
      try {
        cb(isListeningNow);
      } catch (err) {
        console.error("Voice: onListeningChange callback threw", err);
      }
    });
  }

  function noteActivity() {
    lastActivityAt = Date.now();
  }

  function createAndStart() {
    const mySession = ++sessionId;
    sessionHadSpeech = false;
    noteActivity();

    recognition = new RecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    // Interim results are still never surfaced to onResult() below (only a
    // final result is ever emitted) — this is purely to keep the underlying
    // session itself more continuously active. Several browsers end a
    // continuous session more eagerly when interimResults is off (e.g.
    // right after every final result rather than staying open), and every
    // such end-then-restart cycle triggers the same audible system sound
    // the watchdog timeout above is also trying to minimize — so this is
    // a second lever on the same "fewer restarts, fewer clicks" goal.
    recognition.interimResults = true;
    // Ask for a few alternative transcripts per phrase — a real iPhone log
    // showed "vote" heard as "Court"/"Abort" and "bleed" as "Blade"; the
    // right word is often one of the engine's runners-up. ui.js checks every
    // alternative, not just the top one. Engines that ignore this just
    // return one, so it's harmless where unsupported.
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      noteActivity();
      emitDebugEvent("start", { session: mySession });
      emitListeningChange(true);
    };
    // Fire on any detected sound/speech, not just a finished result — a
    // session that's actively hearing the player (even mid-utterance, before
    // a final transcript lands) isn't the "hung and dead" case the watchdog
    // is for. Not every engine fires both; either is enough to count.
    recognition.onspeechstart = () => {
      sessionHadSpeech = true;
      noteActivity();
      emitDebugEvent("speechstart");
    };
    recognition.onspeechend = () => emitDebugEvent("speechend");
    recognition.onsoundstart = () => {
      noteActivity();
      emitDebugEvent("soundstart");
    };
    recognition.onsoundend = () => emitDebugEvent("soundend");
    // Debug only: whether the browser says it actually began capturing
    // audio. A real iPhone log showed sessions that fired `onstart` but
    // never heard anything for 20–40s; these show whether the mic itself
    // ever came up in those sessions.
    recognition.onaudiostart = () => emitDebugEvent("audiostart");
    recognition.onaudioend = () => emitDebugEvent("audioend");

    recognition.onresult = (event) => {
      sessionHadSpeech = true;
      noteActivity();
      const last = event.results[event.results.length - 1];
      if (!last) return;
      const transcript = last[0] ? last[0].transcript : "";
      if (!transcript.trim()) return;
      if (last.isFinal) {
        const alternatives = Array.from(last)
          .map((alt) => (alt.transcript || "").trim())
          .filter(Boolean);
        emitDebugEvent("result", transcript.trim());
        if (alternatives.length > 1) emitDebugEvent("alternatives", alternatives.slice(1));
        emitResult(transcript.trim(), alternatives);
      } else {
        emitDebugEvent("interim", transcript.trim());
        emitInterimResult(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      emitDebugEvent("error", event.error || "unknown");
      emitListeningChange(false);
      emitError(event.error || "unknown");
    };

    // Chrome in particular ends a "continuous" session on its own after a
    // stretch of silence, or right after delivering a final result —
    // restart automatically as long as we still intend to be listening.
    // stop() clears `listening` first, so an intentional stop never
    // triggers a restart here.
    //
    // Except a session that ended without hearing any speech: it goes to
    // sleep instead of restarting. Chrome on Android plays its start sound
    // on every (re)start and ends sessions after ~5s of silence, so
    // restarting those produced constant clicking (reported as
    // "disturbing"). ui.js wakes it with start() on a new word or a tap.
    recognition.onend = () => {
      emitDebugEvent("end", { session: mySession });
      emitListeningChange(false);
      if (listening && mySession === sessionId && !sessionHadSpeech) {
        goToSleep();
        return;
      }
      if (listening && mySession === sessionId) {
        emitDebugEvent("auto-restart");
        try {
          createAndStart();
        } catch (err) {
          listening = false;
          stopWatchdog();
          emitError("restart-failed");
        }
      }
    };

    recognition.start();
  }

  // Tears down and restarts the recognizer from scratch when the watchdog
  // decides the current session is silently dead — distinct from onend's
  // own restart path above since this is the one case onend hasn't (and by
  // definition won't) fire on its own.
  function forceRestart() {
    const mySession = sessionId; // snapshot before tearing down, so the stale guard below still works
    emitDebugEvent("watchdog-restart", { session: mySession });
    emitListeningChange(false); // onend is nulled out below for this teardown, so it won't emit this on its own
    noteActivity(); // reset the clock immediately so a slow teardown doesn't trigger a second overlapping restart
    if (recognition) {
      recognition.onend = null; // this teardown is intentional, not a session we want auto-restarted twice
      try {
        recognition.stop();
      } catch {
        /* already stopped/dead — fine, we're replacing it regardless */
      }
      recognition = null;
    }
    setTimeout(async () => {
      if (!listening || mySession !== sessionId) return;
      await warmUp(); // un-mute the page's microphone first — see warmUp()
      if (!listening || mySession !== sessionId) return;
      try {
        createAndStart();
      } catch (err) {
        listening = false;
        stopWatchdog();
        emitError("restart-failed");
      }
    }, MIN_RESTART_GAP_MS); // brief pause so the browser can release the previous session first
  }

  function startWatchdog() {
    stopWatchdog();
    watchdogId = setInterval(() => {
      if (document.hidden) {
        noteActivity(); // a hidden page hears nothing by design; don't count it as a dead session
        return;
      }
      if (listening && Date.now() - lastActivityAt > WATCHDOG_TIMEOUT_MS) {
        forceRestart();
      }
    }, WATCHDOG_CHECK_MS);
  }

  function stopWatchdog() {
    if (watchdogId) {
      clearInterval(watchdogId);
      watchdogId = null;
    }
  }

  function goToSleep() {
    emitDebugEvent("sleep");
    listening = false;
    stopWatchdog();
    recognition = null;
    setAsleep(true);
  }

  function setAsleep(next) {
    if (asleep === next) return;
    asleep = next;
    sleepChangeCallbacks.forEach((cb) => {
      try {
        cb(asleep);
      } catch (err) {
        console.error("Voice: onSleepChange callback threw", err);
      }
    });
  }

  // true when a session ended in silence and is waiting for start() — see
  // onend. ui.js shows a "Tap to speak" button meanwhile.
  function onSleepChange(callback) {
    sleepChangeCallbacks.push(callback);
    return () => {
      sleepChangeCallbacks = sleepChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  function start() {
    if (!supported()) {
      emitError("unsupported");
      return;
    }
    if (listening) return; // already running
    if (asleep) emitDebugEvent("wake");
    setAsleep(false);

    listening = true;
    const wait = MIN_RESTART_GAP_MS - (Date.now() - lastStoppedAt);
    if (wait > 0) {
      emitDebugEvent("start-delayed", { ms: wait });
      delayedStartTimer = setTimeout(() => {
        delayedStartTimer = null;
        if (listening) beginListening();
      }, wait);
      return;
    }
    beginListening();
  }

  function beginListening() {
    try {
      createAndStart();
      startWatchdog();
    } catch (err) {
      listening = false;
      emitError("start-failed");
    }
  }

  // Opens and immediately closes a plain getUserMedia microphone stream.
  // iOS mutes a page's microphone capture shortly after the page goes to
  // the background, and SpeechRecognition doesn't un-mute it on its own —
  // a recognizer started afterwards fires `start`/`audiostart` but gets no
  // audio, which matches every silent session in the real iPhone logs
  // (the camera's own getUserMedia is video-only, so it never un-mutes the
  // microphone). A direct audio request does; this is the "warm up the
  // microphone" workaround documented for iOS WebSpeech. Never throws —
  // a failure is only logged, and recognition is started regardless.
  async function warmUp() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      emitDebugEvent("mic-warmup", "ok");
    } catch (err) {
      emitDebugEvent("mic-warmup", `failed: ${(err && err.name) || err}`);
    }
  }

  function stop() {
    emitDebugEvent("stop");
    setAsleep(false);
    emitListeningChange(false); // onend is nulled out below, so it won't emit this on its own
    listening = false;
    stopWatchdog();
    clearTimeout(delayedStartTimer);
    delayedStartTimer = null;
    if (recognition) {
      lastStoppedAt = Date.now(); // only a recognizer that actually ran needs time to release the mic
      recognition.onend = null; // don't auto-restart on an intentional stop
      try {
        recognition.stop();
      } catch {
        /* already stopped — fine */
      }
      recognition = null;
    }
  }

  return { supported, start, stop, warmUp, onResult, onInterimResult, onError, onListeningChange, onSleepChange, onDebugEvent };
})();

/**
 * The single voice object the game talks to. Prefers the on-device Vosk
 * engine (window.VoiceVosk, from voice-vosk.js) and uses BuiltinVoice (the
 * browser recognizer) when Vosk isn't available or can't start — a failed
 * model download, or an audio pipeline that stays silent through every
 * rebuild. Once Vosk fails, the fallback sticks for the rest of the page's
 * life. Every subscription goes to both engines, so callers never need to
 * know which one is running.
 */
const Voice = (() => {
  const vosk = window.VoiceVosk && window.VoiceVosk.supported() ? window.VoiceVosk : null;
  let active = vosk || BuiltinVoice;
  const errorCallbacks = [];
  const debugCallbacks = [];

  const subscribeBoth = (method) => (callback) => {
    const unsubscribers = [BuiltinVoice[method](callback)];
    if (vosk) unsubscribers.push(vosk[method](callback));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe && unsubscribe());
  };

  function debug(type, detail) {
    debugCallbacks.forEach((callback) => callback({ type, detail }));
  }

  function useFallback(reason) {
    active = BuiltinVoice;
    debug("engine", `browser recognizer (${reason})`);
    BuiltinVoice.start();
  }

  if (vosk) {
    vosk.onError((error) => {
      if ((error === "start-failed" || error === "unsupported") && active === vosk && BuiltinVoice.supported()) {
        useFallback(error);
        return; // handled — the caller never sees Vosk's failure
      }
      errorCallbacks.forEach((callback) => callback(error));
    });
    BuiltinVoice.onError((error) => errorCallbacks.forEach((callback) => callback(error)));
  }

  return {
    supported: () => !!vosk || BuiltinVoice.supported(),
    // Vosk keeps listening after the player leaves and returns to the app
    // (once restarted); the browser recognizer, on iPhone, doesn't recover
    // for ~20s — ui.js uses this to choose between keeping camera mode and
    // switching to typing when the app is left.
    survivesAppSwitch: () => active === vosk,
    engine: () => (active === vosk ? "vosk" : "browser"),
    // Terms this engine can't recognize (the browser recognizer has no such gap).
    unanswerableTerms: () => (active === vosk ? vosk.unanswerableTerms() : []),
    start: () => active.start(),
    stop: () => {
      BuiltinVoice.stop();
      if (vosk) vosk.stop();
    },
    prime: () => {
      if (vosk) vosk.prime();
    },
    preload: () => {
      if (vosk) vosk.preload();
    },
    warmUp: () => (active.warmUp ? active.warmUp() : Promise.resolve()),
    onResult: subscribeBoth("onResult"),
    onInterimResult: subscribeBoth("onInterimResult"),
    onListeningChange: subscribeBoth("onListeningChange"),
    onSleepChange: subscribeBoth("onSleepChange"),
    // (state, fraction): "idle" | "loading" | "ready" | "failed" — Vosk's model download.
    onModelState: (callback) => (vosk ? vosk.onModelState(callback) : (callback("ready", 1), () => {})),
    onError: (callback) => {
      if (!vosk) return BuiltinVoice.onError(callback);
      errorCallbacks.push(callback);
      return () => {
        const index = errorCallbacks.indexOf(callback);
        if (index >= 0) errorCallbacks.splice(index, 1);
      };
    },
    onDebugEvent: (callback) => {
      debugCallbacks.push(callback);
      const unsubscribers = [BuiltinVoice.onDebugEvent(callback)];
      if (vosk) {
        unsubscribers.push(vosk.onDebugEvent(callback));
        callback({ type: "engine", detail: active === vosk ? "vosk" : "browser recognizer" });
      }
      return () => {
        const index = debugCallbacks.indexOf(callback);
        if (index >= 0) debugCallbacks.splice(index, 1);
        unsubscribers.forEach((unsubscribe) => unsubscribe && unsubscribe());
      };
    },
  };
})();
