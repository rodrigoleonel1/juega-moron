"use client";

import { useEffect } from "react";
import { installNavigationGuard } from "@/lib/navigation-guard";

export function NavigationGuard() {
  useEffect(() => installNavigationGuard(), []);

  return null;
}