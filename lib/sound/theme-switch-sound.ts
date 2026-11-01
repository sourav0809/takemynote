/**
 * A soft two-note chime when someone switches the theme: rising into light,
 * falling into dark. Made with Web Audio, so there is no file to load. Besides
 * the onboarding heartbeat, this is the only sound in the app.
 */
const PEAK_VOLUME = 0.12;
/** Second note starts this long after the first. */
const NOTE_GAP_S = 0.075;
const NOTE_LENGTH_S = 0.35;

// Notes in Hz: G5 → C6 for light, C6 → G5 for dark (a gentle fifth either way).
const NOTES = {
  light: [783.99, 1046.5],
  dark: [1046.5, 783.99],
} as const;

let context: AudioContext | null = null;

function playNote(audio: AudioContext, frequency: number, startAt: number): void {
  // A sine with a quiet octave above it: rounder than a bare beep.
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(PEAK_VOLUME, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + NOTE_LENGTH_S);
  gain.connect(audio.destination);

  for (const [multiple, level] of [[1, 1], [2, 0.18]] as const) {
    const oscillator = audio.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency * multiple;
    const partial = audio.createGain();
    partial.gain.value = level;
    oscillator.connect(partial).connect(gain);
    oscillator.start(startAt);
    oscillator.stop(startAt + NOTE_LENGTH_S + 0.02);
  }
}

/** Plays the chime for the theme being switched to. Call from a click or key press. */
export function playThemeSwitchSound(theme: "light" | "dark"): void {
  if (typeof AudioContext === "undefined" || document.hidden) return;
  context ??= new AudioContext();
  const audio = context;
  void audio.resume().then(() => {
    const now = audio.currentTime + 0.01;
    NOTES[theme].forEach((frequency, index) => playNote(audio, frequency, now + index * NOTE_GAP_S));
  });
}
