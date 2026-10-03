/**
 * Guess the Word — camera & face tracking (AR mode).
 *
 * Small, self-contained interface: startCamera(videoElement), stopCamera(),
 * onFacePosition(callback). Nothing else in the app reaches into this file's
 * internals, and nothing in here touches the DOM beyond the <video> element
 * it's given — all AR rendering (positioning the word card, drawing the face
 * box, the "move into frame" hint, pausing the timer) lives in ui.js.
 *
 * The game must still work if this file fails to load at all — every call
 * site in ui.js guards with `typeof Face !== "undefined"` — and startCamera()
 * rejects cleanly (never throws synchronously) if the camera itself can't be
 * opened: no camera, permission denied, insecure context.
 *
 * Important: startCamera() resolves as soon as the camera STREAM is playing
 * — it does NOT wait for the face-detection model to finish loading. That
 * model is a multi-hundred-KB download plus GPU/WASM init that can be slow
 * or occasionally hang on some devices, and gating the whole camera view on
 * it meant a flaky model load looked exactly like "the camera never showed
 * up" even though permission was granted and the stream was fine. Now the
 * model loads in the background (loadDetector(), with its own timeout); if
 * it fails, the video keeps playing and face tracking just never kicks in —
 * ui.js's existing "no face detected" handling (fade the card, show "move
 * into frame", pause the timer after 3s) degrades into that state on its
 * own, no special-casing needed.
 *
 * MediaPipe Tasks Vision and the face model are self-hosted (Phase 4) —
 * `vendor/vision_bundle.mjs` + `vendor/wasm/` (copied from the
 * @mediapipe/tasks-vision npm package) and `models/blaze_face_short_range.tflite`
 * (downloaded from Google's model storage). Nothing here fetches from a
 * third-party CDN anymore, so AR mode works fully offline once those files
 * are cached (see sw.js). A plain <script> tag loads this file, same as the
 * rest of the app; dynamic import() of a local .mjs still works fine in a
 * classic (non-module) script, so nothing here needs type="module". Uses
 * the CPU delegate rather than GPU — GPU init is the single most common
 * real-world failure/hang point for MediaPipe Tasks Vision across
 * devices/browsers, and detection doesn't need to be fast here, just
 * roughly tracking a face position every frame or two.
 *
 * onModelLoadProgress(callback) delivers a 0–1 fraction as the model file
 * downloads (fetched manually with a streaming reader instead of just
 * handing MediaPipe a URL, specifically so this progress can be reported —
 * the brief asks for "a small progress indicator" during this download).
 * Falls back to firing once at 1 if the response doesn't expose a
 * Content-Length (some servers/caches omit it) — there's no way to show
 * partial progress without a known total size, so it isn't guessed at.
 *
 * onFacePosition(callback) delivers, on every new video frame once the
 * model is ready:
 *   { x, y, width, height, videoWidth, videoHeight } — the largest detected
 *     face's bounding box in RAW (unmirrored) video-pixel coordinates, or
 *   null — when no face is currently detected.
 * Mirroring (the video is shown flipped via CSS) and converting to screen
 * coordinates are deliberately left to ui.js, since both depend on how the
 * <video> element is laid out (object-fit: cover, its rendered size), which
 * this module has no reason to know about.
 */
const Face = (() => {
  const VISION_MODULE_URL = "./vendor/vision_bundle.mjs";
  const WASM_BASE_URL = "./vendor/wasm";
  const MODEL_URL = "./models/blaze_face_short_range.tflite";
  const MODEL_LOAD_TIMEOUT_MS = 10000;

  let videoEl = null;
  let stream = null;
  let detector = null;
  let detectorLoadPromise = null;
  let rafId = null;
  let lastVideoTime = -1;
  let callbacks = [];
  let progressCallbacks = [];
  let modelLoadErrorCallbacks = [];

  function onFacePosition(callback) {
    callbacks.push(callback);
    return () => {
      callbacks = callbacks.filter((cb) => cb !== callback);
    };
  }

  function onModelLoadProgress(callback) {
    progressCallbacks.push(callback);
    return () => {
      progressCallbacks = progressCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Fires once if the model never finishes loading — timeout, fetch
  // failure, anything. Separate from onFacePosition/onModelLoadProgress:
  // ui.js uses this specifically to tell the player face tracking itself
  // didn't come up, without implying anything about the camera, which
  // keeps working regardless (see the file-level comment above).
  function onModelLoadError(callback) {
    modelLoadErrorCallbacks.push(callback);
    return () => {
      modelLoadErrorCallbacks = modelLoadErrorCallbacks.filter((cb) => cb !== callback);
    };
  }

  function emit(position) {
    callbacks.forEach((cb) => {
      try {
        cb(position);
      } catch (err) {
        console.error("Face: onFacePosition callback threw", err);
      }
    });
  }

  function emitProgress(fraction) {
    progressCallbacks.forEach((cb) => {
      try {
        cb(fraction);
      } catch (err) {
        console.error("Face: onModelLoadProgress callback threw", err);
      }
    });
  }

  function emitModelLoadError(err) {
    modelLoadErrorCallbacks.forEach((cb) => {
      try {
        cb(err);
      } catch (callbackErr) {
        console.error("Face: onModelLoadError callback threw", callbackErr);
      }
    });
  }

  async function fetchModelWithProgress(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Model fetch failed: ${response.status}`);

    const total = Number(response.headers.get("content-length")) || 0;
    if (!response.body || !total) {
      const buffer = new Uint8Array(await response.arrayBuffer());
      emitProgress(1);
      return buffer;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      emitProgress(Math.min(1, received / total));
    }
    const buffer = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return buffer;
  }

  function loadDetector() {
    if (detector) return Promise.resolve(detector);
    if (!detectorLoadPromise) {
      const build = (async () => {
        const vision = await import(VISION_MODULE_URL);
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE_URL);
        const modelAssetBuffer = await fetchModelWithProgress(MODEL_URL);
        detector = await vision.FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetBuffer, delegate: "CPU" },
          runningMode: "VIDEO",
        });
        return detector;
      })();
      const timeout = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Face model load timed out")),
          MODEL_LOAD_TIMEOUT_MS
        );
      });
      detectorLoadPromise = Promise.race([build, timeout]).catch((err) => {
        detectorLoadPromise = null; // allow a retry on the next startCamera()
        throw err;
      });
    }
    return detectorLoadPromise;
  }

  async function startCamera(videoElement) {
    // getUserMedia (and navigator.mediaDevices itself) only exists on a
    // secure context — https, or specifically localhost/127.0.0.1 — so this
    // is the first thing to check: on plain http over a LAN/Tailscale/other
    // non-localhost address, mediaDevices is simply undefined and no
    // permission prompt ever appears, which otherwise looks identical to a
    // generic "camera not supported" failure. Checking isSecureContext
    // directly (rather than just the mediaDevices existence check below)
    // lets ui.js show a specific, actionable message instead of a generic
    // one in this case.
    if (!window.isSecureContext) {
      throw new Error("Camera requires a secure connection (https, or localhost) — this page was opened over plain http.");
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera is not supported in this browser");
    }
    videoEl = videoElement;
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    videoEl.srcObject = stream;
    await videoEl.play();

    // The video is visible and playing now — resolve so ui.js shows the
    // camera immediately. The face model loads in the background; detectLoop()
    // just no-ops (keeps looping) until `detector` is ready, and if the load
    // fails or times out, tracking simply never starts — the video stays up
    // and ui.js's existing "no face detected" handling takes it from there.
    loadDetector().catch((err) => {
      console.error("Face: model load failed, continuing without face tracking", err);
      emitModelLoadError(err);
    });

    lastVideoTime = -1;
    detectLoop();
  }

  function stopCamera() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
    videoEl = null;
    lastVideoTime = -1;
  }

  function areaOf(detection) {
    return detection.boundingBox.width * detection.boundingBox.height;
  }

  function pickLargestFace(detections) {
    if (!detections || !detections.length) return null;
    let largest = detections[0];
    for (let i = 1; i < detections.length; i++) {
      if (areaOf(detections[i]) > areaOf(largest)) largest = detections[i];
    }
    const box = largest.boundingBox;
    return {
      x: box.originX,
      y: box.originY,
      width: box.width,
      height: box.height,
      videoWidth: videoEl.videoWidth,
      videoHeight: videoEl.videoHeight,
    };
  }

  function detectLoop() {
    if (!videoEl || !stream) return; // stopCamera() was called — stop looping
    if (detector && videoEl.readyState >= 2 && videoEl.currentTime !== lastVideoTime) {
      lastVideoTime = videoEl.currentTime;
      try {
        const result = detector.detectForVideo(videoEl, performance.now());
        emit(pickLargestFace(result.detections));
      } catch (err) {
        console.error("Face: detection error", err);
      }
    }
    rafId = requestAnimationFrame(detectLoop);
  }

  return { startCamera, stopCamera, onFacePosition, onModelLoadProgress, onModelLoadError };
})();
