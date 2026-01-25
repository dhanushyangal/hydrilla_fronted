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
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-black font-dm-sans">Hydrilla Pass Active</h3>
              <p className="text-xs text-gray-500 font-dm-sans">You have early access</p>
            </div>
            <div className="ml-auto">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-14 border border-white/20 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight font-dm-sans"
            >
              You Have Hydrilla Pass
            </h2>

            <p 
              className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto font-space-grotesk mb-8"
            >
              Thank you for being an early supporter! You have access to all exclusive features.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Early Access Active
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
      {/* Background Image */}
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
        {/* Dark overlay for premium feel */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-14 border border-white/20 shadow-2xl text-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-bold tracking-widest uppercase font-dm-sans backdrop-blur-md">
                Limited Time Offer
              </span>
            </div>

            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight font-dm-sans"
            >
              Get Early Access
            </h2>

            <p 
              className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-space-grotesk"
            >
              Be among the first to experience the future of 3D creation. Join our early access program and unlock exclusive features.
            </p>

            <div className="pt-4 sm:pt-6">
              <Link
                href="/earlyaccess"
                className="inline-flex items-center gap-3 bg-white text-black px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl active:scale-95 font-dm-sans group"
              >
                Learn More
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-300 group-hover:translate-x-1"
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
