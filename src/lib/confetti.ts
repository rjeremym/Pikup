/**
 * A short confetti burst from the bottom-right corner — where the "Session saved"
 * toast lands — so the eye follows the celebration to the confirmation.
 * No third-party lib: a tiny canvas burst using the sketchbook palette.
 */

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

const COLORS = [
  "oklch(0.55 0.09 50)", // primary brown
  "oklch(0.75 0.09 165)", // accent mint
  "oklch(0.9 0.06 100)", // washi yellow
  "oklch(0.62 0.1 50)", // ring
  "oklch(0.45 0.08 30)", // deeper ink
];

export function celebrateSave() {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9999",
  } as CSSStyleDeclaration);
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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const originX = window.innerWidth - 48;
  const originY = window.innerHeight - 36;
  const pieces: Piece[] = [];
  const count = 70;
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // mostly up-left
    const speed = 6 + Math.random() * 9;
    pieces.push({
      x: originX + (Math.random() - 0.5) * 20,
      y: originY + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed - 2 - Math.random() * 3, // pull left toward toast
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      color: COLORS[i % COLORS.length]!,
      life: 1,
    });
  }

  const gravity = 0.18;
  const drag = 0.988;
  let frame = 0;
  const maxFrames = 90; // ~1.5s at 60fps

  const tick = () => {
    frame++;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of pieces) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - frame / maxFrames);
      if (p.life <= 0) continue;
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive > 0 && frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
      window.removeEventListener("resize", resize);
    }
  };

  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
}
