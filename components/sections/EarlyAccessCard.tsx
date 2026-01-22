"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { checkEarlyAccess } from "../../lib/api";

/**
 * Early Access Card Component
 * Displays above footer on landing page
 * Only shows if user hasn't paid yet
 */
export default function EarlyAccessCard() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || null;

  useEffect(() => {
    const checkAccess = async () => {
      if (!isSignedIn || !userEmail) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        const { hasAccess: access } = await checkEarlyAccess(userEmail, getToken);
        setHasAccess(access);
      } catch (err) {
        console.error("Error checking access:", err);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [isSignedIn, userEmail, getToken]);

  // Don't show if user already has access
  if (isChecking || hasAccess === true) {
    return null;
  }

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Background Image - Desktop: horizontal, Mobile: vertical */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hydrillaccess.jpg"
          alt="Early Access Background"
          fill
          className="object-cover md:object-cover object-center md:object-center"
          priority
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border border-white/20">
          <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
            {/* Heading */}
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              Get Early Access
            </h2>

            {/* Subheading */}
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
              style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
            >
              Be among the first to experience the future of 3D creation. Join our early access program and unlock exclusive features.
            </p>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-4">
              <Link
                href="/earlyaccess"
                className="inline-flex items-center gap-2 sm:gap-3 bg-black text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full text-sm sm:text-base md:text-lg font-bold hover:bg-gray-900 hover:scale-105 transition-all duration-300 shadow-xl active:scale-95"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                Learn More
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path
                    d="M1 7H13M13 7L7 1M13 7L7 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
