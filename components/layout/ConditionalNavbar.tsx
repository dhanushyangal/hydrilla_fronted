"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on generate page
  if (pathname === "/generate") {
    return null;
  }
  
  // Use default variant for library page, hero for others
  const variant = pathname === "/library" ? "default" : "hero";
  
  return <Navbar variant={variant} />;
}

