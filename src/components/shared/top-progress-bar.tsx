"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TopProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start animated progress
  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsVisible(true);
    setProgress(20);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + Math.random() * 18;
        if (prev < 85) return prev + Math.random() * 6;
        if (prev < 93) return prev + 1;
        return prev;
      });
    }, 180);
  };

  // Complete and fade out
  const finishProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 200);
    return () => clearTimeout(timeout);
  };

  // Intercept internal link clicks to trigger progress instantly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, etc.) or non-left clicks
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      if (
        !href ||
        target === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) return;

        const currentFull = window.location.pathname + window.location.search;
        const targetFull = targetUrl.pathname + targetUrl.search;

        if (currentFull === targetFull) return;

        startProgress();
      } catch {
        // Ignore unparseable URLs
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When route finishes transitioning (pathname/searchParams change), complete progress bar
  useEffect(() => {
    if (isVisible) {
      finishProgress();
    }
  }, [pathname, searchParams]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300 ease-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="h-[2.5px] bg-gradient-to-r from-primary via-[#FF3154] to-primary shadow-[0_0_12px_#FF3154,0_0_6px_#FF3154] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <TopProgressBarContent />
    </Suspense>
  );
}

export default TopProgressBar;
