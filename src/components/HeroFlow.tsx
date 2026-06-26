import { useEffect, useRef } from "react";

/**
 * Two-panel "antes / después" diagram inspired by clinical-data cards.
 * Left: scattered chaotic dots (twinkle) — la conversación dispersa.
 * Right: rhythmic ECG-like wave flowing horizontally — la conversación enfocada.
 */
export function HeroFlow() {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-10">
      <Panel
        eyebrow="Antes"
        title="Ruido disperso"
        body="Mensajes sueltos, audiencias distraídas, ideas que no cuajan."
      >
        <ScatterDots />
      </Panel>
      <Panel
        eyebrow="Después"
        title="Conversación con ritmo"
        body="Un mensaje claro que pulsa, conecta y se queda en la memoria."
        accent
      >
        <WaveDots />
      </Panel>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  body,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-[28px] border border-foreground/10 bg-background p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] md:p-8">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            accent ? "bg-brand" : "bg-foreground/40"
          }`}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {eyebrow}
        </span>
      </div>
      <div className="mt-6 h-[140px] w-full md:h-[160px]">{children}</div>
      <h3 className="mt-6 font-display text-3xl uppercase leading-none md:text-4xl">
        {title}
      </h3>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground md:text-base">
        {body}
      </p>
    </div>
  );
}

/* ---------- LEFT: scattered chaotic twinkling dots ---------- */
function ScatterDots() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Dot = {
      x: number;
      y: number;
      r: number;
      color: string;
      phase: number;
      speed: number;
    };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const colors = ["#9CA3AF", "#0A0A0A", "#E63946"];

    const seed = () => {
      dots = [];
      const cols = 26;
      const rows = 4;
      const cellW = w / cols;
      const cellH = h / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (Math.random() < 0.55) {
            const cx = i * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.6;
            const cy = j * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.6;
            const roll = Math.random();
            const color =
              roll < 0.65 ? colors[0] : roll < 0.85 ? colors[1] : colors[2];
            dots.push({
              x: cx,
              y: cy,
              r: 1.8 + Math.random() * 1.4,
              color,
              phase: Math.random() * Math.PI * 2,
              speed: 0.6 + Math.random() * 1.4,
            });
          }
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    let t0 = performance.now();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const a = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * d.speed + d.phase));
        ctx.globalAlpha = a;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="h-full w-full" />;
}

/* ---------- RIGHT: ECG-like rhythmic wave of dots ---------- */
function WaveDots() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const BRAND = "#FFD400";
    const BRAND_DEEP = "#E8A800";

    let t0 = performance.now();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cy = h * 0.55;
      const amp = h * 0.32;
      const step = 9; // distance between dots along x
      const speed = 1.1; // wave speed

      for (let x = 0; x <= w; x += step) {
        // Compound wave for ECG-ish irregularity
        const phase = (x / w) * Math.PI * 4 - t * speed * Math.PI;
        const beat = Math.sin(phase) * 0.7 + Math.sin(phase * 2.3) * 0.25;
        // Add an occasional sharp pulse
        const pulseX = (x / w) * 6 - t * 0.6;
        const pulse = Math.exp(-Math.pow((pulseX % 2) - 1, 2) * 18) * 0.9;
        const y = cy + (beat + pulse) * amp * 0.7;

        // Some dots become short dashes (like the reference)
        const isDash = Math.sin(x * 0.5 + t * 0.4) > 0.78;

        ctx.fillStyle = isDash ? BRAND_DEEP : BRAND;
        if (isDash) {
          const dashW = 14;
          const dashH = 3;
          roundRect(ctx, x - dashW / 2, y - dashH / 2, dashW, dashH, dashH / 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="h-full w-full" />;
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
