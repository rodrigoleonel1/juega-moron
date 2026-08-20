let navigating = false;

export function isNavigating(): boolean {
  return navigating;
}

export function installNavigationGuard(): () => void {
  if (typeof window === "undefined") return () => {};

  const onStart = () => {
    navigating = true;
  };
  const onEnd = () => {
    navigating = false;
  };

  const nav = (window as unknown as {
    navigation?: {
      addEventListener: (type: string, listener: (event: {
        canIntercept?: boolean;
        finished?: Promise<void>;
      }) => void) => void;
      removeEventListener: (type: string, listener: (event: {
        canIntercept?: boolean;
        finished?: Promise<void>;
      }) => void) => void;
    };
  }).navigation;

  if (nav && typeof nav.addEventListener === "function") {
    const handler = (event: { canIntercept?: boolean; finished?: Promise<void> }) => {
      if (event.canIntercept === false) return;
      onStart();
      event.finished?.then(onEnd, onEnd);
    };

    nav.addEventListener("navigate", handler);
    return () => {
      nav.removeEventListener("navigate", handler);
    };
  }

  const onClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const anchor = target?.closest?.("a");
    if (anchor && anchor.getAttribute("href")) {
      onStart();
      setTimeout(onEnd, 10_000);
    }
  };

  document.addEventListener("click", onClick, true);
  return () => {
    document.removeEventListener("click", onClick, true);
  };
}