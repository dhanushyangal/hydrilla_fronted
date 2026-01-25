"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { UserSync } from "./UserSync";

// Lazy load PostHog to reduce initial bundle size
const PostHogProvider = dynamic(() => import("./PostHogProvider"), {
  ssr: false,
});

/**
 * Client-side providers and components that need to be in the layout
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <UserSync />
      <PostHogProvider />
      {children}
    </>
  );
}

