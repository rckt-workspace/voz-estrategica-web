import { useEffect, useRef } from "react";

/**
 * Animated flowing-dots background inspired by idoven.ai.
 * Particles travel along curved bezier paths from the left edge,
 * converge in the center, then diverge to the right edge.
 */
export function HeroFlow({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Path = {
      p0: [number, number];
      p1: [number, number];
      p2: [number, number];
      p3: [number, number];
      color: string;
      side: "in" | "out";
    };

    let paths: Path[] = [];

    type Particle = {
      pathIndex: number;
      t: number;
      speed: number;
      size: number;
      alpha: number;
    };

    let particles: Particle[] = [];

    // Brand palette
    const COLORS = {
      brand: "#FFD400", // yellow
      ink: "#0A0A0A",
      red: "#E63946",
      teal: "#1FB6A8",
    };

    const buildPaths = () => {
      const cx = width / 2;
      const cy = height * 0.55;
      const inputs: Path[] = [];
      const outputs: Path[] = [];

      // Inflow sources on the left
      const inSources = [
        { y: height * 0.2, color: COLORS.ink },
        { y: height * 0.4, color: COLORS.red },
        { y: height * 0.6, color: COLORS.brand },
        { y: height * 0.8, color: COLORS.ink },
        { y: height * 1.0, color: COLORS.teal },
      ];
      inSources.forEach((s) => {
        inputs.push({
          p0: [-20, s.y],
          p1: [width * 0.28, s.y],
          p2: [cx - width * 0.12, cy],
          p3: [cx, cy],
          color: s.color,
          side: "in",
        });
      });

      // Outflow targets on the right
      const outTargets = [
        { y: height * 0.2, color: COLORS.teal },
        { y: height * 0.45, color: COLORS.teal },
        { y: height * 0.7, color: COLORS.brand },
        { y: height * 0.95, color: COLORS.teal },
      ];
      outTargets.forEach((t) => {
        outputs.push({
          p0: [cx, cy],
          p1: [cx + width * 0.12, cy],
          p2: [width * 0.72, t.y],
          p3: [width + 20, t.y],
          color: t.color,
          side: "out",
        });
      });

      paths = [...inputs, ...outputs];
    };

    const seedParticles = () => {
      particles = [];
      const count = Math.min(260, Math.floor((width * height) / 9000));
      for (let i = 0; i < count; i++) {
        particles.push({
          pathIndex: Math.floor(Math.random() * paths.length),
          t: Math.random(),
          speed: 0.0012 + Math.random() * 0.0022,
          size: 1.2 + Math.random() * 2.2,
          alpha: 0.35 + Math.random() * 0.55,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildPaths();
      seedParticles();
    };

    const bezier = (
      p0: number,
      p1: number,
      p2: number,
      p3: number,
      t: number,
    ) => {
      const u = 1 - t;
      return (
        u * u * u * p0 +
        3 * u * u * t * p1 +
        3 * u * t * t * p2 +
        t * t * t * p3
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Faint path guides
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(10,10,10,0.05)";
      paths.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.p0[0], p.p0[1]);
        ctx.bezierCurveTo(p.p1[0], p.p1[1], p.p2[0], p.p2[1], p.p3[0], p.p3[1]);
        ctx.stroke();
      });

      // Particles
      for (const part of particles) {
        const p = paths[part.pathIndex];
        if (!p) continue;
        part.t += part.speed;
        if (part.t > 1) {
          part.t = 0;
          part.pathIndex = Math.floor(Math.random() * paths.length);
        }
        const x = bezier(p.p0[0], p.p1[0], p.p2[0], p.p3[0], part.t);
        const y = bezier(p.p0[1], p.p1[1], p.p2[1], p.p3[1], part.t);

        // Fade near the center hub
        const distFromCenter = Math.min(part.t, 1 - part.t);
        const fade = Math.min(1, distFromCenter * 4 + 0.2);

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = part.alpha * fade;
        ctx.arc(x, y, part.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Central hub — brand square
      const cx = width / 2;
      const cy = height * 0.55;
      const hub = Math.min(width, height) * 0.07;
      ctx.fillStyle = COLORS.brand;
      const r = hub * 0.22;
      roundRect(ctx, cx - hub / 2, cy - hub / 2, hub, hub, r);
      ctx.fill();

      // Inner mark
      ctx.fillStyle = COLORS.ink;
      ctx.font = `700 ${hub * 0.45}px "Inter", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("V", cx, cy + 1);

      rafRef.current = requestAnimationFrame(draw);
    };

    const roundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
