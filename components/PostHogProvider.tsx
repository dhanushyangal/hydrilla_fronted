"use client";

import { useEffect } from "react";

/**
 * Lazy-loaded PostHog provider
 * Only loads PostHog after page is interactive to improve initial load
 * This reduces initial JavaScript bundle size by ~118 KiB
 */
export default function PostHogProvider() {
  useEffect(() => {
    // Only load PostHog after page is interactive
    const loadPostHog = () => {
      import("../instrumentation-client").catch((err) => {
        console.error("Failed to load PostHog:", err);
      });
    };

    // Early return if not in browser
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Explicitly type window and document after the check
    const win = window as Window & typeof globalThis;
    const doc = document as Document;

    // Check for requestIdleCallback using typeof to avoid narrowing issues
    const hasRequestIdleCallback = typeof (win as any).requestIdleCallback === "function";

    if (hasRequestIdleCallback) {
      (win as any).requestIdleCallback(loadPostHog, { timeout: 2000 });
    } else {
      // Fallback: load after a delay or when page is interactive
      if (doc.readyState === "complete") {
        setTimeout(loadPostHog, 2000);
      } else {
        win.addEventListener("load", () => {
          setTimeout(loadPostHog, 2000);
        });
      }
    }
  }, []);

  return null;
}
