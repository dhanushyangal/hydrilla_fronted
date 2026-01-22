"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/layout/Footer";
import { checkEarlyAccess, createEarlyAccessPayment } from "../../lib/api";

// Hook for scroll-triggered animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

export default function EarlyAccessPage() {
  const { userId, getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const { ref: paymentSectionRef, isVisible: paymentVisible } = useScrollAnimation();
  
  // Get user's account email
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || null;

  // Check if user already has access on page load
  useEffect(() => {
    const checkAccess = async () => {
      if (!isSignedIn || !userEmail) {
        setHasAccess(false);
        return;
      }

      try {
        const { hasAccess: access } = await checkEarlyAccess(userEmail, getToken);
        setHasAccess(access);
      } catch (err) {
        console.error("Error checking access:", err);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [isSignedIn, userEmail, getToken]);

  // Handle payment success redirect
  useEffect(() => {
    const status = searchParams.get("status");
    const shouldRedirect = searchParams.get("redirect") === "home";
    
    if (status === "success") {
      // Payment completed - refresh access status
      if (userEmail) {
        checkEarlyAccess(userEmail, getToken).then(({ hasAccess }) => {
          setHasAccess(hasAccess);
          
          // Redirect to landing page after 2 seconds if redirect param is set
          if (shouldRedirect && hasAccess) {
            setTimeout(() => {
              router.push("/");
            }, 2000);
          }
        }).catch(() => {});
      }
    }
  }, [searchParams, getToken, router, userEmail]);

  const handleGetEarlyAccess = async () => {
    if (!isSignedIn || !userEmail) {
      setError("Please sign in to get early access");
      return;
    }

    if (!userEmail || !userEmail.includes("@")) {
      setError("Valid email is required");
      return;
    }

    // CRITICAL: Check access status BEFORE attempting payment
    // This prevents duplicate payment attempts
    try {
      const { hasAccess: currentAccess } = await checkEarlyAccess(userEmail, getToken);
      if (currentAccess) {
        setHasAccess(true);
        setError("You already have early access activated. Payment button disabled.");
        setIsLoading(false);
        return;
      }
    } catch (checkErr) {
      console.error("Error checking access before payment:", checkErr);
      // Continue to payment attempt if check fails (but log it)
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createEarlyAccessPayment(userEmail, getToken);
      
      // Redirect to checkout URL
      if (result.paymentLink) {
        window.location.href = result.paymentLink;
      } else {
        setError("Failed to create payment link. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Error creating payment:", err);
      let errorMessage = "Failed to create payment link. Please try again.";
      
      // Handle ALREADY_HAS_ACCESS status from backend
      if (err.message) {
        if (err.message.includes("ALREADY_HAS_ACCESS") || 
            err.message.includes("already has early access") ||
            err.message.includes("This email already has early access")) {
          errorMessage = "Early Access already activated for this email. Payment disabled.";
          setHasAccess(true);
          // Refresh access status
          checkEarlyAccess(userEmail, getToken).then(({ hasAccess }) => {
            setHasAccess(hasAccess);
          }).catch(() => {});
        } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          errorMessage = "Cannot connect to server. Please check if the backend is running.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Show "Already Have Access" card if user has paid
  if (hasAccess === true) {
    return (
      <div className="min-h-screen bg-white">
        <section 
          ref={heroSectionRef}
          className="relative min-h-screen w-full overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/future.jpg"
              alt="Our Future Plans"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 pt-32 sm:pt-40 md:pt-48 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center justify-center min-h-screen">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl border border-white/20">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-silver-400 to-silver-600 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    You Already Have Hydrilla Pass
                  </h2>
                  <p 
                    className="text-lg sm:text-xl text-gray-700 mb-8"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    Thank you for being an early supporter! You have full access to all premium features.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-900 transition-all duration-300 shadow-xl"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    Go to Home
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Show sign-in prompt if not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white">
        <section 
          ref={heroSectionRef}
          className="relative min-h-screen w-full overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/future.jpg"
              alt="Our Future Plans"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 pt-32 sm:pt-40 md:pt-48 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center justify-center min-h-screen">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl border border-white/20">
                <h2 
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  Sign In Required
                </h2>
                <p 
                  className="text-lg sm:text-xl text-gray-700 mb-8"
                  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                >
                  Please sign in to get early access to Hydrilla.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-900 transition-all duration-300 shadow-xl"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={heroSectionRef}
        className="relative min-h-screen w-full overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/future.jpg"
            alt="Our Future Plans"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 pt-32 sm:pt-40 md:pt-48 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center justify-center min-h-screen">
          <p 
            className="text-xs sm:text-sm md:text-base text-white/90 mb-6 sm:mb-8 tracking-[0.15em] uppercase font-medium animate-fade-in"
            style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
          >
            ( Early Access )
          </p>
          
          <h1 className="text-center animate-fade-in-up mb-6 sm:mb-8">
            <span 
              className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.05] tracking-[-0.02em] font-bold drop-shadow-2xl"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              Join the Future
            </span>
          </h1>

          <div className="text-center max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
            >
              Be part of the next generation of 3D creation. Get early access to cutting-edge features, priority support, and exclusive updates.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Card Section */}
      <section 
        ref={paymentSectionRef}
        className="relative w-full bg-gradient-to-b from-neutral-50 to-white py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Payment Status Messages */}
          {searchParams.get("status") === "success" && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
              <p 
                className="text-lg sm:text-xl text-green-800 font-medium mb-2"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                ✅ Payment successful! Redirecting to home...
              </p>
            </div>
          )}

          {/* Payment Card */}
          <div 
            className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-3xl p-8 sm:p-10 md:p-12 lg:p-16 shadow-2xl border border-gray-300/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>

            <div className="relative z-10">
              <div className="text-center mb-8 sm:mb-10">
                <p 
                  className="text-sm sm:text-base text-gray-600 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                >
                  Fair pricing.
                </p>
                <p 
                  className="text-sm sm:text-base text-gray-600 mb-6 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                >
                  No hidden fees.
                </p>
                
                <div className="flex items-baseline justify-center gap-2 mb-8">
                  <span 
                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-lime-500"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    $59
                  </span>
                  <span 
                    className="text-lg sm:text-xl md:text-2xl text-gray-600"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    per<br />month
                  </span>
                </div>
              </div>

              <div className="mb-8 sm:mb-10 space-y-4 sm:space-y-5">
                {[
                  "Free during beta",
                  "Unlimited 3D generation jobs",
                  "Priority queue access",
                  "Advanced generation features",
                  "Early access to new tools",
                  "Premium support",
                  "Export in multiple formats",
                  "High-resolution outputs",
                  "Commercial usage rights",
                  "Direct access to founders",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-lime-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p 
                      className="text-base sm:text-lg md:text-xl text-gray-700"
                      style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                    >
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              {/* User Email Display (read-only) */}
              {userEmail && (
                <div className="mb-6 sm:mb-8 p-4 bg-white/80 rounded-xl border border-gray-200">
                  <p 
                    className="text-xs sm:text-sm text-gray-600 mb-1"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    Payment will be processed for:
                  </p>
                  <p 
                    className="text-sm sm:text-base font-medium text-black"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    {userEmail}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p 
                    className="text-sm text-red-600 text-center"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Get Early Access Button */}
              <div className="space-y-4">
                {hasAccess ? (
                  <div className="w-full bg-gray-100 text-gray-600 px-6 sm:px-8 py-4 sm:py-5 rounded-xl text-base sm:text-lg md:text-xl font-bold text-center border-2 border-gray-300">
                    <span style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                      ✓ Early Access Already Activated
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetEarlyAccess}
                    disabled={isLoading || !userEmail || hasAccess !== false}
                    className="w-full bg-black text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl text-base sm:text-lg md:text-xl font-bold hover:bg-gray-900 transition-all duration-300 shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    {isLoading ? "Creating checkout..." : "Get Early Access"}
                  </button>
                )}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm sm:text-base text-gray-600 hover:text-black transition-colors underline"
                  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
