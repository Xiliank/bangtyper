/** Subtle canvas confetti burst for personal-best — off unless called. */

export function burstConfetti(durationMs = 1600) {
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-layer";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100vw";
    canvas.style.height = "100dvh";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const colors = ["#edc956", "#3dd6c6", "#e85a7a", "#9b7bff", "#5ed4a5", "#f0a020"];
  const pieces = Array.from({ length: 48 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * 80,
    w: 4 + Math.random() * 5,
    h: 6 + Math.random() * 8,
    vx: -2 + Math.random() * 4,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: -0.2 + Math.random() * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)]!,
  }));

  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - t / durationMs);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < durationMs) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
      window.removeEventListener("resize", resize);
    }
  };
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(tick);
}
