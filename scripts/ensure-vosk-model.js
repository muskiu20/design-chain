#!/usr/bin/env node
/**
 * Guess the Word — makes sure models/vosk-model-small-en-us-0.15.tar.gz
 * exists before a deploy, since it's gitignored (~41MB, too big for the
 * repo) and vercel deploy only uploads what's actually on disk. Without
 * it, camera mode silently falls back to the less reliable browser speech
 * recognizer in production (see CLAUDE.md for the real incident this
 * came from) with no error anywhere obvious.
 *
 * Run automatically on `npm install` (postinstall) and again right before
 * `npm run deploy` (predeploy), so a fresh machine or a stale/corrupt file
 * can't silently ship a 404. Safe to run anytime — it's a no-op once a
 * correctly-sized file is already there.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip";
const MODEL_DIR_NAME = "vosk-model-small-en-us-0.15";
const OUTPUT_PATH = path.join(__dirname, "..", "models", "vosk-model-small-en-us-0.15.tar.gz");
// The real file is ~41MB; anything much smaller is a partial/corrupt
// download (or a 404 page saved as if it were the file), not a good copy.
const MIN_VALID_SIZE_BYTES = 30 * 1024 * 1024;

function isValid(filePath) {
  try {
    return fs.statSync(filePath).size >= MIN_VALID_SIZE_BYTES;
  } catch {
    return false;
  }
}

if (isValid(OUTPUT_PATH)) {
  console.log(`[ensure-vosk-model] ${OUTPUT_PATH} already present (${fs.statSync(OUTPUT_PATH).size} bytes) — skipping.`);
  process.exit(0);
}

console.log("[ensure-vosk-model] Model missing or looks corrupt — downloading and rebuilding it…");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vosk-model-"));
const zipPath = path.join(tmpDir, "model.zip");

try {
  execSync(`curl -fL -o "${zipPath}" "${MODEL_URL}"`, { stdio: "inherit" });
  execSync(`unzip -q "${zipPath}" -d "${tmpDir}"`, { stdio: "inherit" });
  fs.renameSync(path.join(tmpDir, MODEL_DIR_NAME), path.join(tmpDir, "model"));
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  // tar from inside tmpDir so the archive's paths start with "model/",
  // exactly what voice-vosk.js / vosk-browser expects.
  execSync(`tar czf "${OUTPUT_PATH}" model`, { cwd: tmpDir, stdio: "inherit" });

  if (!isValid(OUTPUT_PATH)) {
    throw new Error(`Rebuilt file is smaller than expected (${fs.statSync(OUTPUT_PATH).size} bytes) — something went wrong.`);
  }
  console.log(`[ensure-vosk-model] Wrote ${OUTPUT_PATH} (${fs.statSync(OUTPUT_PATH).size} bytes).`);
} catch (err) {
  // Deliberately non-fatal: a failure here (no network, no curl/unzip/tar,
  // alphacephei.com down) shouldn't block `npm install` or a deploy of
  // everything else — it should just leave camera mode on the browser-
  // recognizer fallback, exactly as it already degrades today, with a
  // loud warning instead of a silent 404 discovered later on a real phone.
  console.warn(`[ensure-vosk-model] FAILED to prepare the Vosk model: ${err.message}`);
  console.warn("[ensure-vosk-model] Camera mode will fall back to the browser's built-in speech recognizer until this is fixed and re-run.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
