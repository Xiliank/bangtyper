/** Tiny Web Audio blips — no asset files. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beep(freq: number, durMs: number, type: OscillatorType, gain = 0.04) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durMs / 1000);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + durMs / 1000);
}

export function playKeyClick() {
  beep(580, 22, "triangle", 0.018);
}

export function playErrorBlip() {
  beep(180, 70, "triangle", 0.045);
}
