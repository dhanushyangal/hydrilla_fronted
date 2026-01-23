"use client";

import { useEffect } from "react";

/**
 * Lazy-loaded PostHog provider
 * Only loads PostHog after page is interactive to improve initial load
 * This reduces initial JavaScript bundle size by ~118 KiB
 */
export default function PostHogProvider() {
  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === "undefined") {
      return;
    }

    // Only load PostHog after page is interactive
    const loadPostHog = () => {
      import("../instrumentation-client").catch((err) => {
        console.error("Failed to load PostHog:", err);
      });
    };

    // Use requestIdleCallback if available (better performance)
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(loadPostHog, { timeout: 2000 });
    } else {
      // Fallback: load after a delay or when page is interactive
      if (typeof document !== "undefined" && document.readyState === "complete") {
        setTimeout(loadPostHog, 2000);
      } else if (typeof window !== "undefined") {
        window.addEventListener("load", () => {
          setTimeout(loadPostHog, 2000);
        });
      }
    }
  }, []);

  return null;
}
