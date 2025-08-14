"use client";

import Link from "next/link";

interface NavItemProps {
  item: { name: string; url: string };
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  ref: (el: HTMLDivElement | null) => void;
}

export function NavItem({
  item,
  index,
  isActive,
  onMouseEnter,
  onMouseLeave,
  ref,
}: NavItemProps) {
  return (
    <div
      ref={ref}
      className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
        isActive ? "text-white" : "text-gray-300"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={item.url}
        className="text-sm flex items-center justify-center h-full font-semibold"
      >
        {item.name}
      </Link>
    </div>
  );
}
