/**
 * Guess the Word — on-device speech recognition (Vosk).
 *
 * The default voice engine in camera mode where the browser supports it.
 * Defines window.VoiceVosk, which voice.js combines with the browser's
 * SpeechRecognition wrapper (see its facade): Vosk is used first, and the
 * browser recognizer is the backup if Vosk can't start. Same interface as
 * voice.js — supported, start, stop, warmUp, onResult, onInterimResult,
 * onError, onListeningChange, onSleepChange, onDebugEvent — plus prime(),
 * preload(), onModelState().
 *
 * Why: on iPhone, Safari's speech recognizer stays deaf for ~20s after the
 * player leaves the app, while the raw getUserMedia microphone comes back
 * within a second. Vosk runs a Kaldi model in a WebAssembly worker on the
 * raw microphone, so it survives an app switch. It also never plays
 * Chrome's start sound on Android, since there are no recognizer restarts.
 *
 * Pieces: vendor/vosk.js (vosk-browser 0.0.8, which bundles its worker) and
 * models/vosk-model-small-en-us-0.15.tar.gz (~41MB, the official small
 * English model repacked as tar.gz). The model downloads lazily — on
 * preload(), which ui.js calls once camera mode is on — through the page's
 * own fetch, so it goes via the service worker's cache (works offline
 * afterwards) and reports progress. It's handed to Vosk as a blob URL.
 *
 * Recognition is restricted to the game's own vocabulary (every word of
 * every non-AI term, plus "[unk]" for anything else): far more accurate for
 * a word game than free dictation, which turned "line" into "elaine".
 * URL flags for debugging: ?vosk=plain (free dictation), ?vosk=off (use
 * the browser recognizer only).
 *
 * Self-check: iOS can leave a freshly connected audio graph silently dead,
 * so each connection is watched and rebuilt if no audio arrives — see
 * connectPipeline().
 */
(() => {
  const params = new URLSearchParams(location.search);
  const voskFlag = params.get("vosk");
  if (voskFlag === "off") return;
  // Needs WebAssembly, workers and the Web Audio API on top of the
  // microphone; otherwise leave voice to the browser recognizer.
  const hasRequirements =
    typeof WebAssembly === "object" &&
    typeof Worker === "function" &&
    !!(window.AudioContext || window.webkitAudioContext) &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (!hasRequirements) return;

  const MODEL_URL = "models/vosk-model-small-en-us-0.15.tar.gz";
  const LIBRARY_URL = "vendor/vosk.js";
  const USE_GRAMMAR = voskFlag !== "plain";

  let resultCallbacks = [];
  let interimCallbacks = [];
  let errorCallbacks = [];
  let listeningCallbacks = [];
  let sleepCallbacks = [];
  let debugCallbacks = [];

  let modelPromise = null;
  let audioContext = null;
  let stream = null;
  let sourceNode = null;
  let processorNode = null;
  let muteNode = null;
  let recognizer = null;
  let listening = false; // we intend to be listening
  let isListeningNow = false; // audio is actually flowing into the recognizer
  let sessionId = 0;

  const subscribe = (list, callback) => {
    list.push(callback);
    return () => {
      const index = list.indexOf(callback);
      if (index >= 0) list.splice(index, 1);
    };
  };
  const emit = (list, ...args) =>
    list.slice().forEach((callback) => {
      try {
        callback(...args);
      } catch (err) {
        console.error("VoiceVosk: callback threw", err);
      }
    });
  // Events from before anything subscribed (the model starts loading at
  // page load, before the debug panel subscribes) are held and replayed to
  // the first subscriber.
  let earlyDebugEvents = [];
  const emitDebugEvent = (type, detail) => {
    if (!debugCallbacks.length && earlyDebugEvents) earlyDebugEvents.push({ type, detail });
    else emit(debugCallbacks, { type, detail });
  };
  const emitListeningChange = (next) => {
    if (next === isListeningNow) return;
    isListeningNow = next;
    emit(listeningCallbacks, next);
  };

  function loadLibrary() {
    if (window.Vosk) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = LIBRARY_URL;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("vosk.js failed to load"));
      document.head.appendChild(script);
    });
  }

  // Terms whose answer word, and whole term, aren't in the Vosk model's
  // vocabulary, so they can never be recognized — the grammar silently
  // drops unknown words ("Ignoring word missing in vocabulary" in the
  // worker's console). ui.js keeps them out of games played by voice.
  // Found by checking every non-AI term against that warning list with the
  // vosk-model-small-en-us-0.15 model (3 of 676); re-check if the model or
  // the dataset changes: start a camera game with a console attached to the
  // worker, collect the warnings, and flag terms whose `second` AND every
  // word of `term` are in that list.
  const UNANSWERABLE_TERMS = ["glassmorphism", "optical kerning", "dogfooding"];

  // "idle" | "loading" | "ready" | "failed", plus a 0–1 download fraction.
  let modelState = "idle";
  let modelFraction = 0;
  let modelStateCallbacks = [];
  function setModelState(state, fraction) {
    modelState = state;
    if (typeof fraction === "number") modelFraction = fraction;
    emit(modelStateCallbacks, modelState, modelFraction);
  }

  // Downloads the model through the page's fetch (so the service worker
  // caches it and reports progress) and returns a blob URL for Vosk.
  async function fetchModelBlobUrl() {
    const response = await fetch(MODEL_URL);
    if (!response.ok) throw new Error(`model download failed (${response.status})`);
    const total = Number(response.headers.get("Content-Length")) || 0;
    if (!response.body || !response.body.getReader) {
      setModelState("loading", 0.5);
      return URL.createObjectURL(await response.blob());
    }
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    let lastReported = -1;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const fraction = total ? Math.min(received / total, 1) : 0;
      if (Math.floor(fraction * 100) !== lastReported) {
        lastReported = Math.floor(fraction * 100);
        setModelState("loading", fraction);
      }
    }
    return URL.createObjectURL(new Blob(chunks));
  }

  function loadModel() {
    if (modelPromise) return modelPromise;
    const startedAt = performance.now();
    emitDebugEvent("vosk-model", "loading");
    setModelState("loading", 0);
    modelPromise = loadLibrary()
      .then(fetchModelBlobUrl)
      .then((blobUrl) => window.Vosk.createModel(blobUrl))
      .then((model) => {
        emitDebugEvent("vosk-model", `ready in ${((performance.now() - startedAt) / 1000).toFixed(1)}s`);
        setModelState("ready", 1);
        return model;
      })
      .catch((err) => {
        emitDebugEvent("vosk-model", `failed: ${(err && err.message) || err}`);
        modelPromise = null; // allow a retry on the next start()
        setModelState("failed");
        throw err;
      });
    return modelPromise;
  }

  // The game's vocabulary (see the header).
  function buildGrammar() {
    const words = new Set();
    (typeof DESIGN_TERMS !== "undefined" ? DESIGN_TERMS : [])
      .filter((term) => term.category !== "AI")
      .forEach((term) => {
        [term.first, term.second, ...term.term.split(/\s+/)].forEach((word) => {
          const clean = String(word || "").toLowerCase().replace(/[^a-z']/g, "");
          if (clean) words.add(clean);
        });
      });
    return JSON.stringify([...words, "[unk]"]);
  }

  // Creates/resumes the AudioContext. iOS only lets an AudioContext start
  // (or resume after the app was in the background) inside a user gesture,
  // so ui.js calls this synchronously from the Play and "Keep playing" taps.
  function prime() {
    try {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
      }
      if (audioContext.state !== "running") audioContext.resume().catch(() => {});
      emitDebugEvent("vosk-audio", `context ${audioContext.state}`);
    } catch (err) {
      emitDebugEvent("vosk-audio", `context failed: ${(err && err.message) || err}`);
    }
  }

  function teardownAudio() {
    if (processorNode) {
      processorNode.onaudioprocess = null;
      processorNode.disconnect();
      processorNode = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (muteNode) {
      muteNode.disconnect();
      muteNode = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (recognizer) {
      try {
        recognizer.remove();
      } catch {
        /* already gone */
      }
      recognizer = null;
    }
  }

  // iOS can leave a freshly connected audio graph silently dead: the
  // pipeline reports "connected" and the context says "running", yet the
  // ScriptProcessor never fires (seen on a real iPhone on some
  // play-again starts — the player was heard by nobody for the whole
  // round). So each connection is watched: if no audio buffer arrives
  // within BUFFER_WATCH_MS, the graph is rebuilt on a fresh stream (attempt
  // 2), then on a brand-new AudioContext (attempt 3), then reported as a
  // failed start.
  const BUFFER_WATCH_MS = 1500;
  const MAX_PIPELINE_ATTEMPTS = 3;
  let bufferWatchTimer = null;

  function failStart(err) {
    clearTimeout(bufferWatchTimer);
    emitDebugEvent("error", (err && err.name) || String(err));
    listening = false;
    teardownAudio();
    emitListeningChange(false);
    emit(errorCallbacks, err && err.name === "NotAllowedError" ? "not-allowed" : "start-failed");
  }

  async function connectPipeline(model, mySession, attempt) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
    if (!listening || mySession !== sessionId) {
      teardownAudio();
      return;
    }
    const track = stream.getAudioTracks()[0];
    track.onmute = () => emitDebugEvent("vosk-audio", "track muted");
    track.onunmute = () => emitDebugEvent("vosk-audio", "track unmuted");

    prime(); // no-op if already running; outside a gesture it may stay suspended on iOS
    recognizer = USE_GRAMMAR
      ? new model.KaldiRecognizer(audioContext.sampleRate, buildGrammar())
      : new model.KaldiRecognizer(audioContext.sampleRate);
    recognizer.on("partialresult", (message) => {
      const partial = message && message.result ? message.result.partial : "";
      if (partial && partial.trim()) {
        emitDebugEvent("interim", partial.trim());
        emit(interimCallbacks, partial.trim());
      }
    });
    recognizer.on("result", (message) => {
      const text = message && message.result ? message.result.text : "";
      if (text && text.trim()) {
        emitDebugEvent("result", text.trim());
        emit(resultCallbacks, text.trim(), [text.trim()]);
      }
    });

    sourceNode = audioContext.createMediaStreamSource(stream);
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    // A ScriptProcessor only runs while connected to the destination;
    // route it through a silent gain so the player never hears themselves.
    muteNode = audioContext.createGain();
    muteNode.gain.value = 0;
    let firstBuffer = true;
    processorNode.onaudioprocess = (event) => {
      if (!recognizer) return;
      if (firstBuffer) {
        firstBuffer = false;
        clearTimeout(bufferWatchTimer);
        emitDebugEvent("audiostart", `context ${audioContext.state}, ${audioContext.sampleRate}Hz`);
        emitListeningChange(true);
      }
      try {
        recognizer.acceptWaveform(event.inputBuffer);
      } catch (err) {
        console.error("VoiceVosk: acceptWaveform failed", err);
      }
    };
    sourceNode.connect(processorNode);
    processorNode.connect(muteNode);
    muteNode.connect(audioContext.destination);
    emitDebugEvent("vosk-audio", `pipeline connected (attempt ${attempt}), context ${audioContext.state}`);

    clearTimeout(bufferWatchTimer);
    bufferWatchTimer = setTimeout(async () => {
      if (!listening || mySession !== sessionId || !firstBuffer) return;
      emitDebugEvent(
        "vosk-audio",
        `no audio after ${BUFFER_WATCH_MS}ms (context ${audioContext && audioContext.state}, track ${track.readyState} muted=${track.muted})`
      );
      teardownAudio();
      if (attempt >= MAX_PIPELINE_ATTEMPTS) {
        failStart(new Error("audio pipeline stayed silent"));
        return;
      }
      if (attempt >= 2 && audioContext) {
        emitDebugEvent("vosk-audio", "replacing the audio context");
        try {
          await audioContext.close();
        } catch {
          /* already closed */
        }
        audioContext = null;
      }
      if (!listening || mySession !== sessionId) return;
      try {
        await connectPipeline(model, mySession, attempt + 1);
      } catch (err) {
        failStart(err);
      }
    }, BUFFER_WATCH_MS);
  }

  async function start() {
    if (listening) return;
    listening = true;
    const mySession = ++sessionId;
    emitDebugEvent("start", { session: mySession, engine: "vosk", grammar: USE_GRAMMAR });
    try {
      const model = await loadModel();
      if (!listening || mySession !== sessionId) return;
      await connectPipeline(model, mySession, 1);
    } catch (err) {
      failStart(err);
    }
  }

  function stop() {
    emitDebugEvent("stop");
    clearTimeout(bufferWatchTimer);
    listening = false;
    sessionId++;
    teardownAudio();
    emitListeningChange(false);
  }

  window.VoiceVosk = {
    supported: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext)),
    start,
    stop,
    prime,
    unanswerableTerms: () => UNANSWERABLE_TERMS.slice(),
    // Starts the model download early (ui.js calls this once camera mode is
    // on) so it's ready, or at least progressing, by the time Play is pressed.
    preload: () => {
      loadModel().catch((err) => console.error("VoiceVosk: model load failed", err));
    },
    // (state, fraction) — called immediately with the current state, then on every change.
    onModelState: (callback) => {
      const unsubscribe = subscribe(modelStateCallbacks, callback);
      callback(modelState, modelFraction);
      return unsubscribe;
    },
    warmUp: async () => {}, // not needed — Vosk reads the raw microphone directly
    onResult: (callback) => subscribe(resultCallbacks, callback),
    onInterimResult: (callback) => subscribe(interimCallbacks, callback),
    onError: (callback) => subscribe(errorCallbacks, callback),
    onListeningChange: (callback) => subscribe(listeningCallbacks, callback),
    onSleepChange: (callback) => subscribe(sleepCallbacks, callback), // Vosk never sleeps
    onDebugEvent: (callback) => {
      const unsubscribe = subscribe(debugCallbacks, callback);
      if (earlyDebugEvents) {
        earlyDebugEvents.forEach((event) => callback(event));
        earlyDebugEvents = null;
      }
      return unsubscribe;
    },
  };

})();
