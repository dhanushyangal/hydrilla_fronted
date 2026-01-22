"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import Footer from "../../../components/layout/Footer";
import { checkEarlyAccess } from "../../../lib/api";

export default function CheckoutSuccessPage() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || null;

  // Check payment status and access
  useEffect(() => {
    const checkPayment = async () => {
      const paymentIdParam = searchParams.get("payment_id");
      if (paymentIdParam) {
        setPaymentId(paymentIdParam);
      }

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

    checkPayment();
  }, [isSignedIn, userEmail, getToken, searchParams]);

  // Auto-redirect to home after 3 seconds if access is granted
  useEffect(() => {
    if (hasAccess === true) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasAccess, router]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/future.jpg"
            alt="Payment Success"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 pt-32 sm:pt-40 md:pt-48 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl border border-white/20">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                Payment Successful!
              </h1>

              {/* Status Message */}
              {isChecking ? (
                <p
                  className="text-lg sm:text-xl text-gray-700 mb-8"
                  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                >
                  Verifying your payment...
                </p>
              ) : hasAccess === true ? (
                <>
                  <p
                    className="text-lg sm:text-xl text-gray-700 mb-8"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    🎉 Welcome to Hydrilla Early Access! You now have full access to all premium features.
                  </p>
                  <p
                    className="text-sm sm:text-base text-gray-600 mb-8"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    Redirecting to home page in 3 seconds...
                  </p>
                  {paymentId && (
                    <p
                      className="text-xs text-gray-500 mb-4"
                      style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                    >
                      Payment ID: {paymentId}
                    </p>
                  )}
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
                </>
              ) : (
                <>
                  <p
                    className="text-lg sm:text-xl text-gray-700 mb-8"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    Your payment was successful, but we're still processing your access. Please wait a moment and refresh this page.
                  </p>
                  <p
                    className="text-sm sm:text-base text-gray-600 mb-8"
                    style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                  >
                    If you continue to see this message, please contact support.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-900 transition-all duration-300 shadow-xl"
                      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                    >
                      Refresh Page
                    </button>
                    <Link
                      href="/"
                      className="bg-gray-200 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-300 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                    >
                      Go to Home
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
