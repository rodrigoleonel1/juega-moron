"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Inicio", url: "/" },
  { name: "Fixture", url: "/fixture" },
  { name: "Juegos", url: "/juegos" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav
        className={`mt-3 flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
          scrolled
            ? "bg-black/70 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
        aria-label="Navegación principal"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isActive
                  ? "text-white bg-primary/10 backdrop-blur-sm"
                  : scrolled
                  ? "text-white/70 hover:text-white"
                  : "text-white/70 hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
