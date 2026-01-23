"use client";

import { useEffect } from "react";

/**
 * Lazy-loaded PostHog provider
 * Only loads PostHog after page is interactive to improve initial load
 * This reduces initial JavaScript bundle size by ~118 KiB
 */
export default function PostHogProvider() {
  useEffect(() => {
    // Early return if not in browser - this check must be first
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Only load PostHog after page is interactive
    const loadPostHog = () => {
      import("../instrumentation-client").catch((err) => {
        console.error("Failed to load PostHog:", err);
      });
    };

    // At this point, TypeScript knows window and document exist
    // Use explicit type assertion to help TypeScript
    const win = window as Window;
    const doc = document as Document;

    // Check for requestIdleCallback support
    if (typeof (win as any).requestIdleCallback === "function") {
      (win as any).requestIdleCallback(loadPostHog, { timeout: 2000 });
      return;
    }

    // Fallback: load after a delay or when page is interactive
    if (doc.readyState === "complete") {
      setTimeout(loadPostHog, 2000);
    } else {
      win.addEventListener("load", () => {
        setTimeout(loadPostHog, 2000);
      });
    }
  }, []);

  return null;
}
