import { useEffect } from "react";

const URL = "https://vozestrategica.com/masterclass-de-clientes-a-fans";
const HEIGHT = 60;

export function BottomBar() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bottombar-h", `${HEIGHT}px`);
    return () => {
      root.style.setProperty("--bottombar-h", "0px");
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[65] flex items-center gap-3 bg-black px-3 py-2 text-white sm:px-6"
      style={{ minHeight: HEIGHT }}
    >
      <span className="inline-flex items-center rounded-full bg-[#EAC945] px-3 py-1 font-display text-sm font-black uppercase text-black">
        VOZ
      </span>
      <span className="flex-1 truncate text-xs font-medium sm:text-sm">
        Masterclass · 25 jul · $20 USD
      </span>
      <a
        href={URL}
        className="inline-flex shrink-0 items-center rounded-full bg-[#EAC945] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 sm:text-sm"
      >
        Reservar →
      </a>
    </div>
  );
}
