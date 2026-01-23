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

    // Ensure we're in browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Use requestIdleCallback if available (better performance)
    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(
        loadPostHog,
        { timeout: 2000 }
      );
    } else {
      // Fallback: load after a delay or when page is interactive
      if (document.readyState === "complete") {
        setTimeout(loadPostHog, 2000);
      } else {
        window.addEventListener("load", () => {
          setTimeout(loadPostHog, 2000);
        });
      }
    }
  }, []);

  return null;
}
