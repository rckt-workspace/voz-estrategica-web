interface LogoProps {
  className?: string;
  variant?: "default" | "white";
}

export function Logo({ className = "h-12 w-auto", variant = "default" }: LogoProps) {
  const dark = variant === "default" ? "#0F0F0F" : "#F5F2E3";
  const yellow = "#EAC945";
  return (
    <svg
      viewBox="0 0 220 110"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Voz Estratégica"
    >
      {/* burbuja negra VOZ */}
      <g>
        <path
          d="M14 8 H120 a18 18 0 0 1 18 18 V40 a18 18 0 0 1 -18 18 H46 L26 78 V58 H14 a18 18 0 0 1 -18 -18 V26 A18 18 0 0 1 14 8 Z"
          transform="translate(20 0)"
          fill={dark}
        />
        <text
          x="92"
          y="46"
          textAnchor="middle"
          fontFamily="Mada Variable, Mada, sans-serif"
          fontWeight="900"
          fontSize="34"
          fill={yellow}
          letterSpacing="2"
        >
          VOZ
        </text>
      </g>
      {/* burbuja amarilla Estratégica */}
      <g transform="translate(0 52)">
        <path
          d="M14 8 H190 a14 14 0 0 1 14 14 V36 a14 14 0 0 1 -14 14 H44 L28 64 V50 H14 A14 14 0 0 1 0 36 V22 A14 14 0 0 1 14 8 Z"
          transform="translate(8 0)"
          fill={yellow}
        />
        <text
          x="110"
          y="36"
          textAnchor="middle"
          fontFamily="Mada Variable, Mada, sans-serif"
          fontWeight="900"
          fontSize="22"
          fill={dark}
          letterSpacing="0.5"
        >
          Estratégica
        </text>
      </g>
    </svg>
  );
}
