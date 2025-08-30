"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavItem } from "./nav-item";

const navItems = [
  { name: "Inicio", url: "/" },
  { name: "Fixture", url: "/fixture" },
  { name: "Plantel", url: "/plantel" },
];

export function Header() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathname = usePathname();

  const activeIndex = navItems.findIndex((item) => item.url === pathname);
  const currentActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[currentActiveIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [currentActiveIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const activeElement = tabRefs.current[currentActiveIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, [currentActiveIndex]);

  return (
    <header className="w-full h-12 flex items-center justify-center pt-8">
      <nav className="relative">
        <div
          className="absolute h-[30px] transition-all duration-300 ease-out bg-black/70 rounded-md"
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />
        <div
          className="absolute -bottom-1 h-[2px] bg-white transition-all duration-300 ease-out"
          style={activeStyle}
        />
        <div className="relative flex space-x-4">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              item={item}
              index={index}
              isActive={index === currentActiveIndex}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </nav>
    </header>
  );
}
