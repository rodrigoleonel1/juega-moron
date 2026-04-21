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
    <Link
      id={index.toString()}
      href={item.url}
      className={` py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
        isActive ? "text-white" : "text-gray-300"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={ref}
        className="text-sm flex items-center justify-center h-full font-semibold px-2"
      >
        {item.name}
      </div>
    </Link>
  );
}
