"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { checkEarlyAccess } from "../../lib/api";

interface EarlyAccessCardProps {
  /** If true, shows "You Have Hydrilla Pass" when user has access instead of hiding */
  showWhenHasAccess?: boolean;
  /** Compact mode for inline display (e.g., in generate page) */
  compact?: boolean;
}

/**
 * Early Access Card Component
 * Displays above footer on landing page
 * Shows CTA if user hasn't paid, or success message if showWhenHasAccess is true
 */
export default function EarlyAccessCard({ showWhenHasAccess = false, compact = false }: EarlyAccessCardProps) {
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

  // Loading state
  if (isChecking) {
    return null;
  }

  // User has access - show success card or hide
  if (hasAccess === true) {
    if (!showWhenHasAccess) {
      return null;
    }

    // Compact version for inline display
    if (compact) {
      return (
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-white border border-slate-200 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">Hydrilla Pass Active</h3>
              <p className="text-xs text-slate-500">You have early access</p>
            </div>
            <div className="ml-auto">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    // Full version
    return (
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hydrillaccess.jpg"
            alt="Early Access Background"
            fill
            className="object-cover md:object-cover object-center md:object-center"
            priority
            sizes="100vw"
            quality={85}
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border border-white/20">
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-slate-100 to-white border-2 border-slate-200 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              <h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                You Have Hydrilla Pass
              </h2>

              <p 
                className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto"
                style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
              >
                Thank you for being an early supporter! You have access to all exclusive features.
              </p>

              <div className="flex justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Early Access Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Compact version for generate page - show nothing if no access (they'll see it on landing page)
  if (compact) {
    return null;
  }

  // User doesn't have access - show CTA
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
          quality={85}
          loading="eager"
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
