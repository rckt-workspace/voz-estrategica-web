import { useEffect } from "react";

const URL = "https://vozestrategica.com/masterclass-de-clientes-a-fans";
const HEIGHT = 68;

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
      className="fixed inset-x-0 bottom-0 z-[65] flex items-center gap-4 bg-black px-3 py-2 text-white sm:px-6"
      style={{ minHeight: HEIGHT }}
    >
      <span className="flex flex-1 items-center justify-center truncate text-center text-sm font-medium sm:text-base">
        Masterclass · 25 jul · $20 USD
      </span>
      <a
        href={URL}
        className="inline-flex shrink-0 items-center rounded-full bg-[#EAC945] px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 sm:px-6 sm:py-3 sm:text-base"
      >
        Reservar →
      </a>
    </div>
  );
}
